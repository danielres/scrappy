import test from 'node:test'
import assert from 'node:assert'
import Wb, { type RowProcessor } from './workbook.ts'

const processor: RowProcessor = async (row, i) => {
  return {
    ...row,
    message: 'POPO ' + i,
  }
}

test('Workbook', async (t) => {
  await t.test(
    'wb.process() processes each row with provided processor',
    async () => {
      const wb = new Wb('test/test_sheet.xlsx')
      await wb.processEachRowWith(processor)

      assert.deepEqual(wb.json, [
        { name: 'name1', url: 'https://one.example.pl', message: 'POPO 0' },
        { name: 'name2', url: 'https://two.example.hr', message: 'POPO 1' },
        { name: 'name3', url: 'https://three.example.org', message: 'POPO 2' },
      ])
    }
  )
})
