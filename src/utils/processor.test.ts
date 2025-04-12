import test from 'node:test'
import assert from 'node:assert'
import { sanitizeFileName } from './processor.ts'

test('sanitizeFilename', async (t) => {
  t.test('handles diacritics', () => {
    const actual = sanitizeFileName('À la plage en été')
    const expected = 'A la plage en ete'
    assert.equal(actual, expected)
  })
})
