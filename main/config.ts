export default {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: "gpt-4.1-nano",
  TEMPLATES_DIR: 'main/templates/',
  EMAIL_TEMPLATE: 'email.md',
  XLSX_IN: 'main/organizations.xlsx',
  XLSX_OUT: 'main/organizations_result.xlsx',
  CONTACT_PAGE_NAMES: [
    'contact',
    'about',
    'kontakt',
    'propos',
    'contactez',
    'contato',
  ],
}
