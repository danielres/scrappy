import config from '../config.ts'
import row from './utils/row.ts'
import { Workbook } from './workbook.ts'

async function main() {
  const wb = new Workbook(config.XLSX_IN)
  await wb.processEachRowWith(row.scrapeOrgData, { skippable: true })
  await wb.processEachRowWith(row.genMessage, { skippable: true })
  wb.save(config.XLSX_OUT)
}

main()
