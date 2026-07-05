# Udyam Registration Scraper

A production-grade web scraper that extracts the complete UI structure (form fields, buttons, dropdowns, validation rules) from the first two steps of the [Udyam Registration Portal](https://udyamregistration.gov.in/UdyamRegistration.aspx).

## Overview

The scraper navigates to the Udyam Registration website using a headless Chromium browser (Puppeteer), captures the raw HTML, parses all form elements with Cheerio, and outputs a structured JSON schema suitable for dynamic form rendering.

### What Gets Scraped

| Step | Title | Elements |
|------|-------|----------|
| 1 | Aadhaar Verification | Aadhaar input, OTP fields, related buttons |
| 2 | PAN Verification | PAN input, related buttons |

> **Note:** The scraper does **not** bypass OTP or Aadhaar verification. It only extracts the visible UI structure and DOM elements available on the initial page load.

## Tech Stack

- **Node.js** >= 20
- **Puppeteer** — Headless browser automation
- **Cheerio** — Server-side HTML parsing
- **ESLint** — Linting
- **Prettier** — Code formatting

## Folder Structure

```
scrapper/
├── package.json
├── README.md
└── src/
    ├── index.js                  # Entry point — orchestrates the pipeline
    ├── config/
    │   └── index.js              # Centralised configuration
    ├── constants/
    │   └── index.js              # Shared constants & selectors
    ├── utils/
    │   ├── logger.js             # Structured logging utility
    │   └── file.util.js          # File I/O helpers
    ├── scraper/
    │   ├── browser.js            # Puppeteer browser lifecycle
    │   ├── extractor.js          # Raw HTML extraction
    │   ├── parser.js             # Cheerio-based DOM parsing
    │   └── schema.builder.js     # JSON schema construction
    └── output/
        ├── schema.json           # Generated structured schema
        └── raw.html              # Raw page HTML snapshot
```

## Setup & Usage

### Prerequisites

- Node.js >= 20
- npm

### Installation

```bash
cd scrapper
npm install
```

### Run the Scraper

```bash
npm run scrape
```

This will:
1. Launch a headless browser
2. Navigate to the Udyam Registration portal
3. Wait for dynamic content to load
4. Extract and save the raw HTML → `src/output/raw.html`
5. Parse all form elements from the DOM
6. Build and save the structured JSON schema → `src/output/schema.json`

### Lint & Format

```bash
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

## Output

### `schema.json`

A structured JSON file with the following format:

```json
{
  "source": "https://udyamregistration.gov.in/UdyamRegistration.aspx",
  "scrapedAt": "2026-07-03T00:00:00.000Z",
  "steps": [
    {
      "step": 1,
      "title": "Aadhaar Verification",
      "fields": [
        {
          "label": "...",
          "name": "...",
          "id": "...",
          "tagName": "input",
          "inputType": "text",
          "type": "text",
          "required": true,
          "placeholder": "...",
          "validation": {
            "pattern": "...",
            "maxlength": "12",
            "minlength": "12"
          }
        }
      ],
      "buttons": [...]
    }
  ]
}
```

### `raw.html`

The complete HTML snapshot of the page at the time of scraping, useful for debugging and manual inspection.

## Design Decisions

- **No hard-coded field names** — The parser auto-detects all `<input>`, `<select>`, `<textarea>`, and `<button>` elements.
- **ASP.NET hidden fields ignored** — `__VIEWSTATE`, `__EVENTVALIDATION`, etc. are filtered out.
- **No OTP bypass** — The scraper extracts only the visible UI; it does not attempt to automate Aadhaar verification or OTP entry.
- **Explicit waits only** — Uses `waitForSelector` and `waitForNetworkIdle` instead of arbitrary `sleep()` calls.
- **Functional programming** — All modules export pure/side-effect-isolated functions with no class hierarchies.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | `false` | Set to `true` to enable debug-level log output |
