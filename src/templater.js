import fs from 'fs'
import path from 'path'
import Handlebars from 'handlebars'
import MarkdownIt from 'markdown-it'
import juice from 'juice'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load data
const data = {
  name: 'Jack',
  product: 'Potatoes',
  link: 'https://example.com',
}

const templatePath = path.join(__dirname, '../templates/test.md')
const templateSrc = fs.readFileSync(templatePath, 'utf-8')

// Step 1: Inject data with handlebars
const compiled = Handlebars.compile(templateSrc)
const markdownWithData = compiled(data)

// Step 2: Convert to HTML
const md = new MarkdownIt()
const html = md.render(markdownWithData)

// Step 3: Inline CSS for emails
const finalHtml = juice(html)
console.log(finalHtml)
// Step 4: Write to file
// fs.writeFileSync('output/email.html', finalHtml)
