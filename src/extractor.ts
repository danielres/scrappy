import config from '../config.ts'
import { getOrgaData } from './utils/scraper.ts'
import { type Aoa, Sheet } from './utils/sheet.ts'
;(async () => {
  const sheet = new Sheet(config.XLSX_IN)
  const [headerRow, ...dataRows] = sheet.getAoa()
  const promises = dataRows.map((r) => sheet.processRow(r, getOrgaData))
  const updatedDataRows = await Promise.all(promises)
  const updatedRows: Aoa = [headerRow, ...updatedDataRows]
  sheet.updateSheetWithAoa(updatedRows)
  sheet.saveAs(config.XLSX_OUT)
  console.log('✅ Updates saved to: ' + config.XLSX_OUT)
})()
