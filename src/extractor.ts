import config from '../config.ts'
import { getFileName } from './utils/processor.ts'
import { getOrgaData } from './utils/scraper.ts'
import { Sheet } from './utils/sheet.ts'

console.log('\n' + getFileName(import.meta.url))

const sheet = new Sheet(config.XLSX_IN)
await sheet.updateEachRowWith(getOrgaData)
sheet.saveAs(config.XLSX_OUT)

console.log('✅ Saved: ' + config.XLSX_OUT)
