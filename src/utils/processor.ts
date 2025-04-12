import type { Row } from './sheet.ts'
import fs from 'fs'
import Handlebars from 'handlebars'
import MarkdownIt from 'markdown-it'
import juice from 'juice'
import path from 'path'

type NamedText = { name: string; body: string }

export function rowsToHtmls(template: string, rows: Row[]): NamedText[] {
  return rows.map((data) => ({
    name: data.name,
    body: dataToHtml(template, data),
  }))
}

export function saveFile(dest: string, body: string) {
  const sanitizedFullPath = sanitizeFullPath(dest)
  fs.writeFileSync(sanitizedFullPath, body)
  return sanitizedFullPath
}

function dataToHtml(templateName: string, data: Row) {
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

function sanitizeFullPath(fp: string) {
  const parts = fp.split('/')
  const path = parts.slice(0, -1).join('/') + '/'
  const fileName = parts[parts.length - 1]
  const sanitizedFileName = sanitizeFileName(fileName)
  return path + sanitizedFileName
}

export function sanitizeFileName(str: string) {
  return str
    .trim()
    .normalize('NFD') // Normalize to decompose diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritic marks
    .replace(/[^a-zA-Z0-9 ._-]/g, '') // Keep only filename-safe characters
}

export function getFileName(str: string) {
  return path.basename(str)
}
