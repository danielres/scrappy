import xlsx from 'xlsx'

type Row = {
  'skip?': string
  name: string
  url: string
  Contact: string
  Emails: string
  Phones: string
  language: string
}

export function openSheet(file: string) {
  const workbook = xlsx.readFile(file)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  return sheet
}

export function getRows(file: string) {
  const sheet = openSheet(file)
  const rows = xlsx.utils.sheet_to_json(sheet) as Row[]
  return rows
}
