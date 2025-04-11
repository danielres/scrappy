import type { Row } from './types.ts'

import axios from 'axios'
import * as cheerio from 'cheerio'
import xlsx from 'xlsx'
import { isMainThread } from 'worker_threads'

const { XLSX_IN, XLSX_OUT } = process.env

if (!XLSX_IN) throw 'XLSX_IN is not defined'
if (!XLSX_OUT) throw 'XLSX_OUT is not defined'

async function getContactLinks(baseUrl: string) {
  try {
    const response = await axios.get(baseUrl, { timeout: 10000 })
    const $ = cheerio.load(response.data)
    const links = $('a[href]')
      .map((_, el) => $(el).attr('href'))
      .get()
    const internal = links
      .filter((href) =>
        ['contact', 'about', 'kontakt'].some((x) =>
          href.toLowerCase().includes(x)
        )
      )
      .map((href) => new URL(href, baseUrl).href)
    return [...new Set(internal)] // Deduplicate
  } catch (error) {
    console.error(`Failed to load ${baseUrl}: ${error.message}`)
    return []
  }
}

async function extractTextFromUrl(url: string) {
  try {
    const response = await axios.get(url, { timeout: 10000 })
    const $ = cheerio.load(response.data)
    const lang = $('html').attr('lang') || 'unknown'
    $('script, style').remove()
    const text = $('body').text().replace(/\s+/g, ' ').trim()
    return { text, lang }
  } catch (error) {
    console.error(`Error scraping ${url}: ${error.message}`)
    return { text: '', lang: 'unknown' }
  }
}

function extractContacts(text: string) {
  const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
  const phoneRegex = /\+?\d[\d\s\-()]{8,}\d/g
  const emails = [...new Set(text.match(emailRegex) || [])]
  const phones = [...new Set(text.match(phoneRegex) || [])]
  return { emails, phones }
}

async function processOrganization(orgName: string, orgUrl: string) {
  console.log(`\n🔍 Processing: ${orgName} (${orgUrl})`)
  const contactPages = await getContactLinks(orgUrl)
  const contactPage = contactPages[0] || orgUrl
  console.log(`→ Contact page: ${contactPage}`)
  const { text, lang } = await extractTextFromUrl(contactPage)
  const { emails, phones } = extractContacts(text)
  return { contactPage, emails, phones, lang }
}

async function processRow(row: Row, headers) {
  console.log(row)
  const skip =
    (row[headers['skip?']] || '').toString().trim().toUpperCase() === 'TRUE'
  const orgName = (row[headers['name']] || '').toString().trim()
  const orgUrl = (row[headers['url']] || '').toString().trim()
  console.log({ skip, orgName, orgUrl })
  if (skip) {
    console.log(`⏭️ Skipping: ${orgName} (${orgUrl})`)
    return row
  }

  if (!orgUrl) {
    console.log(`⏭️ Skipping: ${orgName} (No URL provided)`)
    return row
  }

  const info = await processOrganization(orgName, orgUrl)
  row[headers['contact']] = info.contactPage
  row[headers['emails']] = info.emails.join('\n')
  row[headers['phones']] = info.phones.join('\n')
  row[headers['language']] = info.lang
  row[headers['skip?']] = 'TRUE'
  console.log(`✅ Processed: ${orgName}`)
  return row
}

if (isMainThread) {
  ;(async () => {
    const workbook = xlsx.readFile(XLSX_IN)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 })

    const headers = rows[0].reduce((acc, header, idx) => {
      acc[header.toLowerCase()] = idx
      return acc
    }, {})

    console.log(rows)

    const tasks = rows.slice(1).map((row, idx) => ({
      row,
      idx: idx + 1,
      headers,
    }))

    const results = await Promise.all(
      tasks.map(async (task) => {
        const updatedRow = await processRow(task.row, task.headers)
        return updatedRow
      })
    )

    const updatedRows = [rows[0], ...results]
    const updatedSheet = xlsx.utils.aoa_to_sheet(updatedRows)
    workbook.Sheets[sheetName] = updatedSheet
    xlsx.writeFile(workbook, XLSX_OUT)
    console.log('✅ Updates saved to ' + XLSX_OUT)
  })()
}
