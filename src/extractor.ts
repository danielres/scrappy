import config from '../config.ts'
import { getOrgaData } from './utils/scraper.ts'
import { Sheet } from './utils/sheet.ts'
;(async () => {
  const sheet = new Sheet(config.XLSX_IN)
  await sheet.updateEachRowWith(getOrgaData)
  sheet.saveAs(config.XLSX_OUT)
  console.log('✅ Updates saved to: ' + config.XLSX_OUT)
})()
