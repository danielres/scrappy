import xlsx from 'xlsx'
import fs from 'fs'
import path from 'path'
import Handlebars from 'handlebars'
import MarkdownIt from 'markdown-it'
import juice from 'juice'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { XLSX_OUT } = process.env
const workbook = xlsx.readFile(XLSX_OUT)
const sheetName = workbook.SheetNames[0]
const sheet = workbook.Sheets[sheetName]
const rows = xlsx.utils.sheet_to_json(sheet)

// Load template
const templatePath = path.join(__dirname, '../templates/example.md')
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
})
