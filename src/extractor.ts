import xlsx from 'xlsx'
import { isMainThread } from 'worker_threads'
import config from '../config.ts'
import { getOrganizationData } from './utils/scraper.ts'

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
    const workbook = xlsx.readFile(config.XLSX_IN)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 })

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
    const updatedSheet = xlsx.utils.aoa_to_sheet(updatedRows)
    workbook.Sheets[sheetName] = updatedSheet
    xlsx.writeFile(workbook, config.XLSX_OUT)
    console.log('✅ Updates saved to ' + config.XLSX_OUT)
  })()
}
