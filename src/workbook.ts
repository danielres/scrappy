import xlsx from 'xlsx'
import type { Row } from './types.ts'
import { appendProccessedBy } from './utils/row/appendProccessedBy.ts'

export type Processor = (row: Row, i: number) => Promise<Row>

export default class Workbook {
  public path: string
  public workbook: xlsx.WorkBook
  public sheetName: string

  constructor(path: string) {
    this.path = path
    this.workbook = xlsx.readFile(path)
    this.sheetName = this.workbook.SheetNames[0]
  }

  get sheet() {
    return this.workbook.Sheets[this.sheetName]
  }

  get json() {
    return xlsx.utils.sheet_to_json(this.sheet) as Row[]
  }

  async processEachRowWith(
    processor: Processor,
    options = { skippable: true }
  ) {
    console.log('\n🤖', processor.name)

    const processed = await Promise.all(
      this.json.map((row: Row, i: number) => {
        const processedBy = row.processedBy?.split(',')
        const skip = processedBy?.includes(processor.name) && options.skippable

        if (skip) {
          console.log('  ⏩', row.name.trim())
          return row
        }

        console.log('  ✅', row.name.trim())
        appendProccessedBy(row, processor.name)
        return processor(row, i)
      })
    )

    xlsx.utils.sheet_add_json(this.sheet, processed)
  }

  save(path: string = this.path) {
    xlsx.writeFile(this.workbook, path)
    console.log('\n💾' + path + '\n')
  }
}
