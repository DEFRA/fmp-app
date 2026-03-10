# FMFP End-to-End Tests

UI end-to-end test suite for the Flood Map for Planning (FMFP) application, built with WebdriverIO v9 and Mocha.

This suite leverages a "test-runner API" pattern (see [fmfp-refresh-tests/test-runner-api](fmfp-refresh-tests/test-runner-api)) to standardize how runs are invoked and reported. The pattern isolates runner concerns from spec code, making tests easier to maintain and reproducible across environments.

## Prerequisites

- Node.js 18+ (LTS recommended)
- A local browser installed (Chrome or Firefox currently)
- macOS/Linux terminal or Windows PowerShell/Git Bash

## Install

From the root folder:

```bash
npm install
```

## Configuration

The test runner is configured via environment variables and [wdio.conf.js](wdio.conf.js).

- `BASE_URL`: Target base URL for public environments.
- `INTERNAL`: When set (e.g. `INTERNAL=true`), tests use `INTERNAL_BASE_URL`.
- `INTERNAL_BASE_URL`: Base URL for internal environments.
- `BROWSER`: Browser to run tests (`chrome` | `firefox` | `edge`). Defaults to `chrome`.
- `HEADLESS`: Headless mode. Defaults to headless; set `HEADLESS=false` to show the browser.
- `MOCHA_GREP`: Filter tests by tag (e.g. `@e2e`, `@internal`, `@both`).
- `MOCHA_INVERT`: Set to `true` to invert the grep selection.
- `CI`: In CI, failed specs retry automatically.

Reports are written to:

- HTML: `reports/html-reports/` (master report `master-<timestamp>.html`)
- JUnit XML: `reports/junit/`
- Allure: `reports/allure-results/`
- Videos/screenshots: `reports/html-reports/screenshots/`

## Quick Start

Run the default test flow (Chrome, headless):

```bash
npm run test
```

Run in a specific browser:

```bash
# Firefox
npm run test:firefox

# Chrome
npm run test:chrome
```

Show the browser (disable headless):

```bash
HEADLESS=false npm run test
```

Target internal environment:

```bash
INTERNAL=true INTERNAL_BASE_URL="https://internal.example" npm run test
```

Filter by tag and run a single spec:

```bash
MOCHA_GREP=@e2e npx wdio run wdio.conf.js --spec ./tests/e2e.spec.js
```

Run a specific spec without grep:

```bash
npx wdio run wdio.conf.js --spec ./tests/path/to/spec-file.js
```

Select browser and show UI in one go:

```bash
HEADLESS=false BROWSER=firefox npx wdio run wdio.conf.js --spec ./tests/e2e.spec.js
```

## Project Structure

- `tests/` — Test specifications.
- `pages/` — Page objects and helpers.
- `data/` — Test data and fixtures.
- `reports/` — Test execution artifacts (HTML, JUnit, Allure, videos).

## Troubleshooting

- "BASE_URL environment variable is required": set `BASE_URL` (or `INTERNAL=true` and `INTERNAL_BASE_URL`).
- Browser doesn't open: set `HEADLESS=false` to debug visually.
- Long waits/timeouts: default `waitforTimeout` is 120s; consider network and target environment readiness.

## References

- Runner config: [fmfp-refresh-tests/wdio.conf.js](wdio.conf.js)
- Scripts and reporters: [fmfp-refresh-tests/package.json](package.json)
