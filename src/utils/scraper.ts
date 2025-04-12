import axios from 'axios'
import * as cheerio from 'cheerio'
import config from '../../config.ts'

type ScrapeResult = { text: string; lang: string }

export async function getOrganizationData(orgName: string, orgUrl: string) {
  const contactPageUrls = await getContactPageUrls(orgUrl)
  const contactPageUrl = contactPageUrls[0] || orgUrl
  const { text, lang } = await scrape(contactPageUrl)
  const { emails, phones } = extractEmailsAndPhones(text)
  return { contactPage: contactPageUrl, emails, phones, lang }
}

async function scrape(url: string): Promise<ScrapeResult> {
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

async function getContactPageUrls(baseUrl: string) {
  try {
    const response = await axios.get(baseUrl, { timeout: 10000 })
    const $ = cheerio.load(response.data)
    const stringsToSearch = config.CONTACT_PAGE_NAMES

    const links = $('a[href]')
      .map((_, el) => $(el).attr('href'))
      .get()

    const internalLinks = links
      .filter((href) =>
        stringsToSearch.some((s) => href.toLowerCase().includes(s))
      )
      .map((href) => new URL(href, baseUrl).href)

    return [...new Set(internalLinks)] // Deduplicate
  } catch (error) {
    console.error(`Failed to load ${baseUrl}: ${error.message}`)
    return []
  }
}

function extractEmailsAndPhones(text: string) {
  const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
  const phoneRegex = /\+?\d[\d\s\-()]{8,}\d/g
  const emails = [...new Set(text.match(emailRegex) || [])]
  const phones = [...new Set(text.match(phoneRegex) || [])]
  return { emails, phones }
}
