import test from 'node:test'
import { Sheet } from './sheet.ts'
import assert from 'node:assert'
import fs from 'fs'

test('Sheet', async (t) => {
  await t.test('compare stuff()', () => {
    const sheet = new Sheet('test/test_sheet.xlsx')
    const a = sheet.getAoa()
    const b = sheet.getRows()
    const h = sheet.getHeadersIndexes()
    console.log({ a, b, h })
  })

  await t.test('getHeaderIndexes()', () => {
    const sheet = new Sheet('test/test_sheet.xlsx')
    const headers_actual = sheet.getHeadersIndexes()
    const headers_expected = { 'skip?': 0, name: 1, url: 2 }
    assert.deepEqual(headers_actual, headers_expected)
  })

  await t.test('updateRows()', () => {
    const sheet = new Sheet('test/test_sheet.xlsx')
    console.log('1=====\n', sheet.aoa)
    const newAoa = [
      ['skip?', 'name', 'url', 'contact', 'emails', 'phones', 'language'],
      [
        'yes',
        'New Name',
        'http://newurl.com',
        'New Contact',
        'new@example.com',
        '1234567890',
        'English',
      ],
    ]
    sheet.updateSheetWithAoa(newAoa)
    console.log('2=====\n', sheet.aoa)
    assert.deepEqual(sheet.aoa, newAoa)
  })

  await t.test('save()', () => {
    const sheet = new Sheet('test/test_sheet.xlsx')
    const newRows = [
      ['skip?', 'name', 'url', 'contact', 'emails', 'phones', 'language'],
      [
        'yes',
        'New Name',
        'http://newurl.com',
        'New Contact',
        'new@example.com',
        '1234567890',
        'English',
      ],
    ]
    sheet.updateSheetWithAoa(newRows)
    const savePath = 'test/test_sheet_saved.xlsx'
    sheet.saveAs(savePath)

    // Verify the file was saved
    assert.ok(fs.existsSync(savePath))

    // Clean up
    fs.unlinkSync(savePath)
  })
})
