import Handlebars from 'handlebars'
import MarkdownIt from 'markdown-it'
import fs from 'fs'
import juice from 'juice'
import path from 'path'

import type { Row } from '../types.ts'
import config from '../../main/config.ts'

export function dataToHtml(templateName: string, data: Row, css = '') {
  const md = applyTemplate(templateName, data)
  const html = markdownToHtml(md)
  const htmlWithInlinedStyles = inlineStyles(html, css)
  return htmlWithInlinedStyles
}

export function inlineStyles(html: string, css: string) {
  return juice.inlineContent(html, css)
}

export function applyTemplate(templateName: string, data: Row): string {
  const templatePath = path.join(config.TEMPLATES_DIR, templateName)
  const templateSrc = fs.readFileSync(templatePath, 'utf-8')
  return Handlebars.compile(templateSrc)(data)
}

export function markdownToHtml(document: string): string {
  const md = new MarkdownIt()
  const html = md.render(document)
  return html
}
