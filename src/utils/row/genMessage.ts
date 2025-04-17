import type { Row } from '../../types.ts'
import { dataToHtml } from '../../utils/transformers.ts'
import config from '../../../main/config.ts'

export async function genMessage(row: Row): Promise<Row> {
  const template = config.EMAIL_TEMPLATE
  const message = dataToHtml(template, row)
  row.message = message
  return row
}
