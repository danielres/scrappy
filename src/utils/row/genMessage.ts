import type { Row } from '../../types.ts'
import { applyTemplate, inlineStyles, markdownToHtml } from '../../utils/transformers.ts'
import path from 'path'

export async function genMessage(row: Row): Promise<Row> {
  const css = ''
  const language = row.language
  const md: string[] = []

  if (language === 'en') {
    md.push(applyTemplate('message.md', row))
  } else {
    md.push(applyTranslatedtemplate(language, 'disclaimer.md', row))
    md.push(applyTranslatedtemplate(language, 'message.md', row))
    md.push(applyTemplate('reference.md', row))
    md.push(applyTemplate('message.md', row))
  }

  const separator = '\n\n---\n\n'
  const mdstr = md.join(separator)
  const html = markdownToHtml(mdstr)
  const htmlWithInlinedStyles = inlineStyles(html, css)

  row.message = htmlWithInlinedStyles.trim()
  return row
}

function applyTranslatedtemplate(language: string, templateName: string, data: Row): string {
  const templateNameExpanded = path.join('translations', language, templateName)
  return applyTemplate(templateNameExpanded, data)
}
