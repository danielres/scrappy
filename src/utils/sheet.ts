import xlsx from 'xlsx'

export type ColumnName =
  | 'id'
  | 'skip?'
  | 'name'
  | 'url'
  | 'contact'
  | 'emails'
  | 'email'
  | 'phones'
  | 'language'

export type Row = {
  id: number
  skip: boolean
  name: string
  url: string
  contact: string
  emails: string[]
  email: string
  phones: string[]
  language: string
}

export type AoaRow = [
  Row['id'],
  Row['skip'],
  Row['name'],
  Row['url'],
  Row['contact'],
  Row['emails'],
  Row['email'],
  Row['phones'],
  Row['language'],
]

export type Aoa = [string[], ...AoaRow[]]

type HeadersIndexes = Record<ColumnName, number>
type Headers = ColumnName[]

export class Sheet {
  private workbook: xlsx.WorkBook
  private sheetName: string
  private sheet: xlsx.WorkSheet
  private headersIndexes: Record<ColumnName, number>
  public headers: ColumnName[]
  public aoa: Aoa

  constructor(filepath: string) {
    this.workbook = xlsx.readFile(filepath)
    this.sheetName = this.workbook.SheetNames[0]
    this.sheet = this.workbook.Sheets[this.sheetName]

    this.aoa = xlsx.utils.sheet_to_json(this.sheet, {
      header: 1,
    }) as Aoa
    this.headers = this.aoa[0] as Headers
    this.headersIndexes = this.aoa[0].reduce((acc, header, idx) => {
      acc[header.toLowerCase() as ColumnName] = idx
      return acc
    }, {} as HeadersIndexes)
  }

  async updateEachRowWith(rowUpdateFn: (s: string) => Promise<Partial<Row>>) {
    const [headerRow, ...dataRows] = this.getAoa()
    const promises = dataRows.map((row: AoaRow) =>
      this.processRow(row, rowUpdateFn)
    )
    const updatedDataRows = await Promise.all(promises)
    const updatedRows: Aoa = [headerRow, ...updatedDataRows]
    this.updateSheetWithAoa(updatedRows)
  }

  getHeadersIndexes(): HeadersIndexes {
    return this.headersIndexes
  }

  updateSheetWithAoa(updatedAoa: Aoa): undefined {
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
  getAoa(): Aoa {
    return this.aoa
  }

  async processRow(
    row: AoaRow,
    processorFn: (a: string) => Promise<Partial<Row>>
  ) {
    const skip = this.getCellValue(row, 'skip') as Row['skip']
    const name = this.getCellValue(row, 'name') as Row['name']
    const url = this.getCellValue(row, 'url') as Row['url']

    if (skip) {
      console.log(`⏭️  Skipping: ${name} (${url})`)
      return row
    }

    if (!url) {
      console.log(`⏭️  Skipping: ${name} (No URL provided)`)
      return row
    }

    console.log(`🔨 Processing: ${name}`)

    const data = await processorFn(url)
    this.updateCell(row, 'contact', data.contact)
    this.updateCell(row, 'emails', data.emails)
    this.updateCell(row, 'email', data.emails?.[0])
    this.updateCell(row, 'language', data.language)
    this.updateCell(row, 'phones', data.phones)
    this.updateCell(row, 'skip', 'TRUE')
    return row
  }

  updateCell(
    row: AoaRow,
    position: ColumnName,
    data?: boolean | string | string[]
  ) {
    if (Array.isArray(data)) {
      row[this.headers.indexOf(position)] = data.join('\n')
      return
    }
    row[this.headers.indexOf(position)] = data ?? ''
  }

  getCellValue(row: AoaRow, name: ColumnName) {
    const value = row[this.headers.indexOf(name)]
    if (typeof value === 'string') return value.trim()
    if (Array.isArray(value)) return value.join('\n')
    return value
  }
}
