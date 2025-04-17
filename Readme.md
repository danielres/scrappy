## 1) Installing node 23 on Windows

```sh

# Download and install fnm

winget install Schniz.fnm

# Download and install Node.js

fnm install 23

# Verify the Node.js version

node -v # Should print "v23.11.0".

# Download and install pnpm

corepack enable pnpm

# Verify pnpm version

pnpm -v
```

(source: <https://nodejs.org/en/download>)

## 2) Setting up

### Configuration

The general configuration is set in `main/config.ts`

1. For the automated translations, be sure to set `OPENAI_API_KEY`.
2. Other configuration options can be adjusted according to specific needs.
3. Scrappy can use the same `.xlsx` file for both input and output, or use 2 different ones. The default is to use different files. To change this, set `XLSX_OUT` to the same value as `XLSX_IN`.
4. Scrappy finds contact pages in different languages by searching for links containing the words defined in `CONTACT_PAGE_NAMES`. To find contact pages in more languages, add the needed words to the list.

## 3) Running scrappy

```sh
node main/scrappy.ts
```
