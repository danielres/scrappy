import type { Row } from './sheet.ts'
import fs from 'fs'
import Handlebars from 'handlebars'
import MarkdownIt from 'markdown-it'
import juice from 'juice'

type Data = Record<string, string>
export type Doc = { name: string; body: string }

export function dataToHtml(templateName: string, data: Data) {
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

export function rowsToHtmls(template: string, rows: Row[]): Doc[] {
  return rows.map((data) => ({
    name: data.name,
    body: dataToHtml(template, data),
  }))
}

export function saveDocs(docs: Doc[], options = { folder: '', ext: '' }) {
  docs.forEach(({ name, body }) => {
    const folder = options.folder || 'emails'
    const ext = options.ext || 'html'
    const sanitized = sanitizeFilename(name)
    fs.writeFileSync(`${folder}/${sanitized}.${ext}`, body)
  })
}

export function sanitizeFilename(str: string) {
  return str
    .trim()
    .normalize('NFD') // Normalize to decompose diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritic marks
    .replace(/[^a-zA-Z0-9 ._-]/g, '') // Keep only filename-safe characters
}
