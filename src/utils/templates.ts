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

export async function translateFor(
  wb: Workbook,
  options = { skippable: true }
) {
  const languages = await sheet.getLanguages(wb.json)

  console.log('\n🤖', 'templates:', 'translate to:', languages.join(', '))
  const originaTemplatePaths = filesystem.getDirFilePaths(
    config.TEMPLATES_DIR,
    '.md'
  )
  const originalTemplates = filesystem.loadFileObjects(originaTemplatePaths)
  const translatedTemplates = translateTemplates(
    originalTemplates,
    languages,
    options
  )
  await writeAllTranslations(await translatedTemplates, options)
}

async function translateTemplates(
  originalTemplates: FileObject[],
  languages: string[],
  options = { skippable: true }
): Promise<TranslatedTemplateObject[]> {
  const promises = originalTemplates.map((template) =>
    translateTemplate(template, languages, options)
  )
  const resolved = await Promise.all(promises)
  return resolved.flat()
}

async function translateTemplate(
  template: FileObject,
  languages: string[],
  options = { skippable: true }
): Promise<TranslatedTemplateObject[]> {
  const promises = languages.map(async (language) => {
    const newPath = path.join(
      config.TEMPLATES_DIR,
      'translations',
      language,
      template.name
    )
    const skip = filesystem.fileExists(newPath) && options.skippable

    if (skip) {
      const fileObject = filesystem.loadFileObject(template.path)
      console.log('  ⏩', newPath)
      return { ...fileObject, language }
    }

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

async function writeAllTranslations(
  ts: TranslatedTemplateObject[],
  options = { skippable: true }
) {
  const promises = ts.map((t) => writeTranslation(t, options))
  return await Promise.all(promises)
}

async function writeTranslation(
  translation: TranslatedTemplateObject,
  options = { skippable: true }
) {
  const skip = filesystem.fileExists(translation.path) && options.skippable
  if (skip) return
  const dir = path.dirname(translation.path)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(translation.path, translation.body, 'utf8')
  console.log('  💾', translation.path)
}
