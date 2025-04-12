import { Sheet } from './utils/sheet.ts'
import { saveDocs, rowsToHtmls } from './utils/processor.ts'
import config from '../config.ts'

const template = config.EMAIL_TEMPLATE
const sheet = new Sheet(config.XLSX_OUT)
const rows = sheet.getRows()
const htmls = rowsToHtmls(template, rows)
const folder = 'emails'
saveDocs(htmls, { folder, ext: 'html' })

console.log(
  `\n✅ ${htmls.length} files generated successfully under "${folder}"`
)
