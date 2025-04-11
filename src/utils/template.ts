import fs from 'fs'
import Handlebars from 'handlebars'
import MarkdownIt from 'markdown-it'
import juice from 'juice'

export function renderData(fileName: string, data: any) {
  const templatePath = `templates/${fileName}`
  const templateSrc = fs.readFileSync(templatePath, 'utf-8')
  const applyTemplate = Handlebars.compile(templateSrc)
  const mdDocument = applyTemplate(data)
  const html = markdownToHtml(mdDocument)
  const finalHtml = juice(html)
  return finalHtml
}

function markdownToHtml(document: string) {
  const md = new MarkdownIt()
  const html = md.render(document)
  return html
}
