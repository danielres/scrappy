import { getRows } from './utils/sheet.ts'
import { renderData } from './utils/template.ts'
import config from '../config.ts'

const { XLSX_OUT, EMAIL_TEMPLATE } = config

const rows = getRows(XLSX_OUT)

rows.forEach((row) => {
  const email = row.Emails.split('\n')[0]
  const data = { ...row, email }
  const html = renderData(EMAIL_TEMPLATE, data)
  console.log(html)
  // const sanitized = sanitizeFilename(row.name)
  // fs.writeFileSync(`emails/${sanitized}.html`, finalHtml)
})
