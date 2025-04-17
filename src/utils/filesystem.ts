import fs from 'fs'
import path from 'path'

export type FileObject = {
  name: string
  path: string
  body: string
}

export function getDirFilePaths(dir: string, ext: string) {
  try {
    const files = fs.readdirSync(dir).filter((f) => path.extname(f) === ext)
    const paths = files.map((file) => path.join(dir, file))
    return paths
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
}

export function loadFileObjects(filepaths: string[]) {
  return filepaths.map(loadFileObject)
}

export function loadFileObject(filePath: string): FileObject {
  const template = fs.readFileSync(filePath, 'utf8')
  return {
    name: getFileBasename(filePath),
    path: filePath,
    body: template,
  }
}

export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath)
  } catch (error) {
    console.error('Error checking file existence:', error)
    return false
  }
}

export function sanitizeFullPath(fp: string) {
  const parts = fp.split('/')
  const path = parts.slice(0, -1).join('/') + '/'
  const fileName = parts[parts.length - 1]
  const sanitizedFileName = sanitizeFileName(fileName)
  return path + sanitizedFileName
}

function sanitizeFileName(str: string) {
  return str
    .trim()
    .normalize('NFD') // Normalize to decompose diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritic marks
    .replace(/[^a-zA-Z0-9 ._-]/g, '') // Keep only filename-safe characters
}

function getFileBasename(pathStr: string) {
  return path.basename(pathStr)
}
