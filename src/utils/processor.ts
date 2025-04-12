import type { Row } from './sheet.ts'
import fs from 'fs'
import Handlebars from 'handlebars'
import MarkdownIt from 'markdown-it'
import juice from 'juice'

type Doc = { name: string; body: string }

type Data = Row

export function rowsToHtmls(template: string, rows: Row[]): Doc[] {
  return rows.map((data) => ({
    name: data.name,
    body: dataToHtml(template, data),
  }))
}

export function saveDocs(docs: Doc[], options = { folder: '', ext: '' }) {
  console.log('')

  docs.forEach(({ name, body }, idx: number) => {
    const folder = options.folder || 'emails'
    const ext = options.ext || 'html'
    const sanitized = sanitizeFilename(name)
    const dest = `${folder}/${sanitized}.${ext}`
    fs.writeFileSync(dest, body)
    console.log(`✅ ${idx + 1}/${docs.length} Saved: ${dest}`)
  })
}

function dataToHtml(templateName: string, data: Data) {
  const templateSrc = fs.readFileSync(`templates/${templateName}`, 'utf-8')
  const md = Handlebars.compile(templateSrc)(data)
  const html = markdownToHtml(md)
  const finalHtml = juice(html)
  return finalHtml
}

function markdownToHtml(document: string) {
  const md = new MarkdownIt()
  const html = md.render(document)
  return html
}

export function sanitizeFilename(str: string) {
  return str
    .trim()
    .normalize('NFD') // Normalize to decompose diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritic marks
    .replace(/[^a-zA-Z0-9 ._-]/g, '') // Keep only filename-safe characters
}
