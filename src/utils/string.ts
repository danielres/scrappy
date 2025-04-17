import path from 'path'
// TODO: move to fulesystem.ts

export function getFileBasename(pathStr: string) {
  return path.basename(pathStr)
}

export function sanitizeFullPath(fp: string) {
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
