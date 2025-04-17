import type { Row } from '../types.ts'
import { onlyUnique } from './array.ts'

async function getLanguages(rows: Row[]) {
  const locales = rows
    .map((row) => row.language)
    .filter(Boolean)
    .filter(onlyUnique)
  const languages = locales.map((locale) => locale.split('-')[0])
  return languages
}

export default { getLanguages }
