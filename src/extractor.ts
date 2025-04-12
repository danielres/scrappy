import xlsx from 'xlsx'
import { isMainThread } from 'worker_threads'
import config from '../config.ts'
import { getOrganizationData } from './utils/scraper.ts'
import { Sheet } from './utils/sheet.ts'

async function processRow(row, headers) {
  const skip =
    (row[headers['skip?']] || '').toString().trim().toUpperCase() === 'TRUE'

  const orgName = (row[headers['name']] || '').toString().trim()
  const orgUrl = (row[headers['url']] || '').toString().trim()

  if (skip) {
    console.log(`⏭️  Skipping: ${orgName} (${orgUrl})`)
    return row
  }

  if (!orgUrl) {
    console.log(`⏭️  Skipping: ${orgName} (No URL provided)`)
    return row
  }

  const data = await getOrganizationData(orgName, orgUrl)
  row[headers['contact']] = data.contactPage
  row[headers['emails']] = data.emails.join('\n')
  row[headers['phones']] = data.phones.join('\n')
  row[headers['language']] = data.lang
  row[headers['skip?']] = 'TRUE'
  console.log(`✅ Processed: ${orgName}`)
  return row
}

if (isMainThread) {
  ;(async () => {
    const sheet = new Sheet(config.XLSX_IN)
    const rows = sheet.getAoa()

    const headers = rows[0].reduce((acc, header, idx) => {
      acc[header.toLowerCase()] = idx
      return acc
    }, {})

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
    sheet.updateSheetWithAoa(updatedRows)
    sheet.saveAs(config.XLSX_OUT)
    console.log('✅ Updates saved to ' + config.XLSX_OUT)
  })()
}
