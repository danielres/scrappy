import { Sheet } from './utils/sheet.ts'
import { saveDocs, rowsToHtmls } from './utils/processor.ts'
import config from '../config.ts'

const sheet = new Sheet(config.XLSX_OUT)
const dataSource = sheet.getRows()

const template = config.EMAIL_TEMPLATE
const htmls = rowsToHtmls(template, dataSource)
saveDocs(htmls, { folder: 'emails', ext: 'html' })

