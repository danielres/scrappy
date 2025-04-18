## 1) Installing node 23 on Windows

```sh

# Download and install fnm:
winget install Schniz.fnm

# Download and install Node.js:
fnm install 23

# Verify the Node.js version:
node -v # Should print "v23.11.0".

# Download and install pnpm:
corepack enable pnpm

# Verify pnpm version:
pnpm -v
```

[(source: nodejs.org)](https://nodejs.org/en/download)

## 2) Setting up

### Configuration

The general configuration is defined in [`main/config.ts`](https://github.com/danielres/scrappy/blob/main/main/config.ts)

1. For the automated translations, be sure to set `OPENAI_API_KEY`.
2. Other configuration options can be adjusted according to specific needs.
3. Scrappy can use the same `.xlsx` file for both input and output, or use 2 different ones. The default is to use different files. To change this, set `XLSX_OUT` to the same value as `XLSX_IN`.
4. Scrappy finds contact pages in different languages by searching for links containing the words defined in `CONTACT_PAGE_NAMES`. To cover additional languages, add the needed words to the list.

### Installing dependencies

Run the following command in the root directory to install all required dependencies:

```sh
pnpm install
```

## 3) Using scrappy

Scrappy runs several automated operations, or "steps", in a sequence.

### Prerequisites

Make sure to add some rows with "name" and "url" in `main/organizations.xlsl`.

### Running all operations

```sh
node main/scrappy.ts
```

### Re-running per-row operations

To prevent unnecessary costs from external APIs and to increase performance, Scrappy keeps track for each row of already run operations, using the column "processedBy".

On subsequent runs, Scrappy will, by default, skip rows that have already been processed.

Deleting the content of "processedBy" for a row prevents that row from being skipped.

## Templates

Templates are located under `main/templates`, for example: [`main/templates/message.md`](https://github.com/danielres/scrappy/blob/main/main/templates/message.md)

Handlebars expressions ([documentation](https://handlebarsjs.com/guide/expressions.html)) are used to replace placeholders like `{{name}}` with their actual value.

All data in a row can be used in the templates.

_For example:_

If, in a row, under "name" we have "Tom".

- The template `Hello {{name}}` will be rendered as `Hello Tom`.

### Automated translations

Scrappy automatically translates each template into the languages found under the (automatically filled) "language" column in `organizations.xlsx`.

These translations are generated under `main/templates/translations`.

On subsequent runs, Scrappy will skip automated translations for templates that have already been translated.

To translate a template again in a specific language, delete the corresponding translation under `main/templates/translations`.

For example:

To translate `message.md` in Polish again, delete `main/templates/translations/pl/message.md`.

You can delete the whole `main/templates/translations` directory to re-translate all templates in all languages.

### Fine-grained control

Editing the file [main/scrappy.ts](https://github.com/danielres/scrappy/blob/main/main/scrappy.ts) provides some extra control:

For example, changing:

```js
await wb.processEachRowWith(row.scrapeOrgData, { skippable: true })
```

into:

```js
await wb.processEachRowWith(row.scrapeOrgData, { skippable: false })
```

Entirely disables skipping for this operation, and will execute `scrapeOrgData` again for all rows.

While commenting the entire line:

```js
// await wb.processEachRowWith(row.scrapeOrgData, { skippable: true })
```

Completely disables this operation.
