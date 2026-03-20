# FMFP End-to-End Tests

UI end-to-end test suite for the Flood Map for Planning (FMFP) application, built with Playwright.

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

The test runner is configured via environment variables and [playwright.config.js](playwright.config.js).

- `BASE_URL`: Target base URL for public environments.
- `INTERNAL`: When set (e.g. `INTERNAL=true`), tests use `INTERNAL_BASE_URL`.
- `INTERNAL_BASE_URL`: Base URL for internal environments.
- `BROWSER`: Browser to run tests (`chrome` | `firefox` | `edge`). Defaults to `chrome`.
- `HEADLESS`: Headless mode. Defaults to headless; set `HEADLESS=false` to show the browser.
- `PLAYWRIGHT_GREP`: Filter tests by Playwright tag (for example: `@noDeps`, `@internal`, `@urlCheck`).
- `PLAYWRIGHT_GREP_INVERT`: Invert grep selection.
- `CI`: In CI, failed specs retry automatically.

Reports are written to:

- HTML: `_results_/html-report/`
- JUnit XML: `_results_/junit/playwright-junit.xml`
- Test artifacts (screenshots/videos/traces): `_results_/test-output/`

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
npx playwright test --grep @both tests/e2e.spec.js
```

Run a specific spec without grep:

```bash
npx playwright test tests/path/to/spec-file.spec.js
```

Select browser and show UI in one go:

```bash
HEADLESS=false BROWSER=firefox npx playwright test tests/e2e.spec.js
```

## Project Structure

- `tests/` — Test specifications.
- `pages/` — Page objects and helpers.
- `data/` — Test data and fixtures.
- `_results_/` — Test execution artifacts (HTML, JUnit, screenshots, videos, traces).

## Troubleshooting

- "BASE_URL environment variable is required": set `BASE_URL` (or `INTERNAL=true` and `INTERNAL_BASE_URL`).
- Browser doesn't open: set `HEADLESS=false` to debug visually.
- Long waits/timeouts: check Playwright timeout settings in `playwright.config.js` and target environment readiness.

## References

- Runner config: [fmfp-refresh-tests/playwright.config.js](playwright.config.js)
- Scripts and reporters: [fmfp-refresh-tests/package.json](package.json)
