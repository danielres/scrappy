import fs from 'fs'
import xlsx from 'xlsx'
import Workbook from '../Workbook.ts'

export function generateTypes(wb: Workbook) {
  const path = 'src/types.ts'

  let str = `export type Row = {\n`

  Object.entries(getTypes(wb)).forEach(([k, v]) => {
    str += `  ${k}: ${v ?? 'string'}\n`
  })

  str += '}'

  fs.writeFileSync(path, str)

  console.log(
    `\n 💾 ${path}:\n ${str
      .split('\n')
      .map((l) => '   ' + l)
      .join('\n')}
    `
  )
}

function getTypes(wb: Workbook) {
  const aoa = xlsx.utils.sheet_to_json(wb.sheet, { header: 1 })
  const headers = aoa[0] as string[]
  const types = Object.values(wb.json[0]).map((v) => typeof v)
  return headers.reduce((acc, h, i) => ({ ...acc, [h]: types[i] }), {})
}
