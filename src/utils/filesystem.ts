import fs from 'fs'
import path from 'path'
import { getFileBasename } from './string.ts'

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
