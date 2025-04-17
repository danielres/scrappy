import type { Row } from '../../types.ts'
import { onlyUnique } from '../array.ts'

export function appendProccessedBy(row: Row, str: string): void {
  const processors = (row.processedBy || '').split(',')
  const processedBy = [...processors, str].filter(onlyUnique).filter((e) => e)
  row.processedBy = processedBy.join(',')
}
