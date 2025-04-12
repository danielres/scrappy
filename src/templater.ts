import { Sheet } from './utils/sheet.ts'
import { getFileName, rowsToHtmls, saveFile } from './utils/processor.ts'
import config from '../config.ts'

console.log('\n' + getFileName(import.meta.url))

const sheet = new Sheet(config.XLSX_OUT)
const dataSource = sheet.getRows()

const template = config.EMAIL_TEMPLATE
const htmls = rowsToHtmls(template, dataSource)

htmls.forEach(({ name, body }) => {
  const outputPath = saveFile(`emails/${name}.html`, body)
  console.log(`✅ Saved: ${outputPath}`)
})
