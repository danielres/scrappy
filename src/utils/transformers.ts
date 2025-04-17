import type { Row } from '../types'
import Handlebars from 'handlebars'
import MarkdownIt from 'markdown-it'
import fs from 'fs'
import juice from 'juice'

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
  const templateSrc = fs.readFileSync(`templates/${templateName}`, 'utf-8')
  return Handlebars.compile(templateSrc)(data)
}

export function markdownToHtml(document: string): string {
  const md = new MarkdownIt()
  const html = md.render(document)
  return html
}
