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
  skip: string
  name: string
  url: string
  contact: string
  emails: string[]
  phones: string[]
  language: string
}

export type AoaRow = [
  Row['skip'],
  Row['name'],
  Row['url'],
  Row['contact'],
  Row['emails'],
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
    const skip =
      (row[this.headers.indexOf('skip?')] || '')
        .toString()
        .trim()
        .toUpperCase() === 'TRUE'

    const orgName = (row[this.headers.indexOf('name')] || '').toString().trim()
    const orgUrl = (row[this.headers.indexOf('url')] || '').toString().trim()

    if (skip) {
      console.log(`⏭️  Skipping: ${orgName} (${orgUrl})`)
      return row
    }

    if (!orgUrl) {
      console.log(`⏭️  Skipping: ${orgName} (No URL provided)`)
      return row
    }

    console.log(`🔨 Processing: ${orgName}`)

    const data = await processorFn(orgUrl)
    this.updateCell(row, 'contact', data.contact)
    this.updateCell(row, 'emails', data.emails?.join('\n'))
    this.updateCell(row, 'phones', data.phones?.join('\n'))
    this.updateCell(row, 'language', data.language)
    this.updateCell(row, 'skip?', 'TRUE')

    return row
  }

  updateCell(row: AoaRow, position: ColumnName, data: string | undefined) {
    row[this.headers.indexOf(position)] = data || ''
  }
}
