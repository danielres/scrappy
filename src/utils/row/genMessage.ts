import type { Row } from '../../types.ts'
import config from '../../../config.ts'
import { dataToHtml } from '../../utils/transformers.ts'

export async function genMessage(row: Row): Promise<Row> {
  const template = config.EMAIL_TEMPLATE
  const message = dataToHtml(template, row)
  row.message = message
  return row
}
