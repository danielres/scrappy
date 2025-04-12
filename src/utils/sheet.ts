import xlsx from 'xlsx'

export type ColumnName =
  | 'skip?'
  | 'name'
  | 'url'
  | 'contact'
  | 'emails'
  | 'phones'
  | 'language'

export type Row = {
  [columnName in ColumnName]: string
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

type HeadersIndexes = Record<ColumnName, number>

export class Sheet {
  private workbook: xlsx.WorkBook
  private sheetName: string
  private sheet: xlsx.WorkSheet
  private headersIndexes: Record<ColumnName, number>
  public aoa: string[][]

  constructor(filepath: string) {
    this.workbook = xlsx.readFile(filepath)
    this.sheetName = this.workbook.SheetNames[0]
    this.sheet = this.workbook.Sheets[this.sheetName]

    this.aoa = xlsx.utils.sheet_to_json(this.sheet, {
      header: 1,
    }) as string[][]

    this.headersIndexes = this.aoa[0].reduce((acc, header, idx) => {
      acc[header.toLowerCase() as ColumnName] = idx
      return acc
    }, {} as HeadersIndexes)
  }

  getHeadersIndexes(): HeadersIndexes {
    return this.headersIndexes
  }

  updateSheetWithAoa(updatedAoa: string[][]): undefined {
    this.aoa = updatedAoa
    const updatedSheet = xlsx.utils.aoa_to_sheet(this.aoa)
    this.workbook.Sheets[this.sheetName] = updatedSheet
  }

  saveAs(filepath: string): undefined {
    xlsx.writeFile(this.workbook, filepath)
  }

  getRows(): Row[] {
    const rows = xlsx.utils.sheet_to_json(this.sheet) as Row[]
    return rows
  }
  getAoa(): string[][] {
    return this.aoa
  }
}
