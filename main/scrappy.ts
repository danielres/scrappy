import Workbook from '../src/workbook.ts'
import row from '../src/utils/row.ts'
import config from './config.ts'
import * as templates from '../src/utils/templates.ts'

const wb = new Workbook(config.XLSX_OUT)

await wb.processEachRowWith(row.scrapeOrgData, { skippable: true })
await templates.translateFor(wb, { skippable: true })
await wb.processEachRowWith(row.genMessage, { skippable: true })

wb.save(config.XLSX_OUT)
