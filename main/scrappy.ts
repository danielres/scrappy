import config from '../config.ts'
import row from '../src/utils/row.ts'
import Workbook from '../src/workbook.ts'

const wb = new Workbook(config.XLSX_IN)

await wb.processEachRowWith(row.scrapeOrgData, { skippable: true })
await wb.processEachRowWith(row.genMessage, { skippable: true })

wb.save(config.XLSX_OUT)
