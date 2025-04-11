import type { Row } from './types.ts'

import xlsx from 'xlsx'
import fs from 'fs'
import Handlebars from 'handlebars'
import MarkdownIt from 'markdown-it'
import juice from 'juice'
import { sanitizeFilename } from './utils/sanitizeFilename.ts'

const { XLSX_OUT, EMAIL_TEMPLATE } = process.env

if (!XLSX_OUT) throw 'XLSX_OUT is not defined'
if (!EMAIL_TEMPLATE) throw 'EMAIL_TEMPLATE  is not defined'

const workbook = xlsx.readFile(XLSX_OUT)
const sheetName = workbook.SheetNames[0]
const sheet = workbook.Sheets[sheetName]
const rows = xlsx.utils.sheet_to_json(sheet) as Row[]
// Load template
const templatePath = `templates/${EMAIL_TEMPLATE}`
const templateSrc = fs.readFileSync(templatePath, 'utf-8')

// Compile template
const compiled = Handlebars.compile(templateSrc)

// Process each row
rows.forEach((row) => {
  const email = row.Emails.split('\n')[0]
  const data = { ...row, email }
  console.log('\n--------------------------------------------------')
  console.log(
    '== Available variables:\n',
    '  ',
    Object.keys(data).join(' | '),
    '\n\n'
  )

  const markdownWithData = compiled(data)

  // Step 2: Convert to HTML
  const md = new MarkdownIt()
  const html = md.render(markdownWithData)

  // Step 3: Inline CSS for emails
  const finalHtml = juice(html)

  // Output final HTML
  console.log(finalHtml)
  const sanitized = sanitizeFilename(row.name).slice(0, 100)
  // fs.writeFileSync(`emails/${sanitized}.html`, finalHtml)
})
