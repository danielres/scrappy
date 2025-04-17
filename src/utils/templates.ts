import path from 'path'
import { promises as fs } from 'fs'
import * as filesystem from './filesystem.ts'
import Workbook from '../workbook.ts'
import config from '../../main/config.ts'
import sheet from './sheet.ts'
import translator from './translator.ts'
import type { FileObject } from './filesystem.ts'

type TranslatedTemplateObject = FileObject & {
  language: string
}

// TODO: make skippable
export async function translateFor(wb: Workbook) {
  const languages = await sheet.getLanguages(wb.json)
  const originaTemplatePaths = filesystem.getDirFilePaths(
    config.TEMPLATES_DIR,
    '.md'
  )
  const originalTemplates = filesystem.loadFileObjects(originaTemplatePaths)
  const translatedTemplates = translateTemplates(originalTemplates, languages)
  await writeAllTranslations(await translatedTemplates)
}

async function translateTemplates(
  originalTemplates: FileObject[],
  languages: string[]
): Promise<TranslatedTemplateObject[]> {
  const promises = originalTemplates.map((template) =>
    translateTemplate(template, languages)
  )
  const resolved = await Promise.all(promises)
  return resolved.flat()
}

async function translateTemplate(
  template: FileObject,
  languages: string[]
): Promise<TranslatedTemplateObject[]> {
  const promises = languages.map(async (language) => {
    const newPath = path.join(
      config.TEMPLATES_DIR,
      'translations',
      language,
      template.name
    )
    const getBody = async () => {
      if (language === 'en') return template.body
      return await translator.openAi(template.body, language)
    }
    return {
      ...template,
      path: newPath,
      language,
      body: await getBody(),
    }
  })
  return Promise.all(promises)
}

export async function writeAllTranslations(ts: TranslatedTemplateObject[]) {
  const promises = ts.map(writeTranslation)
  return await Promise.all(promises)
}

async function writeTranslation(translation: TranslatedTemplateObject) {
  const dir = path.dirname(translation.path)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(translation.path, translation.body, 'utf8')
  console.log('💾', translation.path)
}
