import test from 'node:test'
import assert from 'node:assert'
import { sanitizeFilename } from './processor.ts'

test('sanitizeFilename', async (t) => {
  t.test('handles diacritics', () => {
    const actual = sanitizeFilename('À la plage en été')
    const expected = 'A la plage en ete'
    assert.equal(actual, expected)
  })
})
