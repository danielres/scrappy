// Each configuration variable can be set externally using environment variables.
// If not set, it will fallback to the default value.
//
// For example, if process.env.OPENAI_API_KEY is set, it will use that value.
// Otherwise, it will fallback to the value under "defaults":

const defaults = {
  OPENAI_API_KEY: '<YOUR_OPENAI_API_KEY>',
  OPENAI_MODEL: 'gpt-4.1-nano',
  TEMPLATES_DIR: 'main/templates/',
  XLSX_IN: 'main/organizations.xlsx',
  XLSX_OUT: 'main/organizations_result.xlsx',
  CONTACT_PAGE_NAMES: 'contact,about,kontakt,propos,contactez,contato',
}

const config = Object.keys(defaults).reduce(
  (acc, key) => {
    acc[key] = process.env[key] || defaults[key]
    return acc
  },
  {} as Record<string, string>
)

export default config
