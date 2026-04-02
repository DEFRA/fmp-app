# FMFP End-to-End Tests

UI end-to-end test suite for the Flood Map for Planning (FMFP) application, built with [Playwright](https://playwright.dev/).

## Architecture

The suite uses a layered test architecture to keep specs readable and maintainable:

```
tests/*.spec.js          ← Test specifications (what to test)
  ↓
test-runner-api/          ← Steps & MapSteps (domain-level actions)
  ↓
test-runner-api/          ← FormDriver & MapDriver (Playwright locator logic)
  ↓
pages/                    ← Page objects & form control definitions
```

### Page Objects (`pages/`)

Each page is defined with `definePage({ key, slug, title })` and exports typed form control handles:

- `link(text)` / `mainLink(text)` — links scoped to `<main>`
- `footerLink(text)` — links scoped to `<footer>`
- `headerLink(text)` — links scoped to header/service navigation
- `textInput(text)`, `radioOption(text)`, `checkboxOption(text)`, `button(text)`, `errorText(text)`

### Drivers (`test-runner-api/form-driver.js`, `map-driver.js`)

Low-level Playwright interactions. `FormDriver` handles standard GOV.UK form pages. `MapDriver` extends it with map-specific actions (zoom, draw boundary, menu interactions).

Key behaviours:
- **Link matching** uses `exact: true` with `.first()` to prevent substring ambiguity while handling pages with genuinely duplicated links.
- **Text input** uses `textbox.or(spinbutton)` with `toBeVisible()` to wait for the element before filling, avoiding race conditions on page transitions.
- **Map zoom** waits for `networkidle` and re-checks button readiness between each zoom click to avoid flaky interactions with tile loading.
- **Link presence assertions** use `exact: true` and fall back to `.first()` only when `count > 1` (genuine duplicates), preserving strict-mode protection for single matches.

### Steps (`test-runner-api/steps.js`, `map-steps.js`)

Domain-level API used in specs. `Steps` wraps `FormDriver` for standard page interactions. `MapSteps` wraps `MapDriver` for map-specific flows like `addSquare()` and `confirmBoundaryAndContinue()`.

## Prerequisites

- Node.js 18+ (LTS recommended)
- Chrome installed locally (required for chromium projects)

## Install

```bash
npm install
```

## Configuration

### Environments

Target environment is set via `TEST_ENV` (defaults to `tst` locally, `local` in CI):

| Environment | Variable     | Public URL | Internal URL |
|-------------|-------------|------------|-------------|
| local       | `TEST_ENV=local` | `http://localhost:8050` | `http://localhost:8050` |
| dev         | `TEST_ENV=dev`   | `https://fmp2-dev.aws-int.defra.cloud/` | `https://fmp2-internal-dev.aws-int.defra.cloud/` |
| tst         | `TEST_ENV=tst`   | `https://fmp2-tst.aws-int.defra.cloud/` | `https://fmp2-internal-tst.aws-int.defra.cloud/` |

### Playwright Projects

Tests are organised into projects via tags:

| Project | Tags included | Tags excluded | Base URL |
|---------|--------------|---------------|----------|
| `public-chromium` | (all) | `@internal`, `@urlCheck` | Public |
| `internal-chromium` | `@internal`, `@both` | `@urlCheck` | Internal |
| `noDeps-local-chrome` | `@noDeps` | `@urlCheck`, `@internal`, `@both` | Public |
| `urlCheck-chrome` | `@urlCheck` | (none) | Public |

Firefox and WebKit variants follow the same pattern as chromium.

### Test Tags

- `@noDeps` — Tests with no external dependencies (can run against any environment).
- `@internal` — Tests that require the internal URL.
- `@both` — Tests that run against both public and internal URLs.
- `@urlCheck` — Tests that verify external links resolve correctly. Excluded from default runs to avoid flakiness from third-party sites.

### Settings

| Setting | Local | CI |
|---------|-------|----|
| Workers | 5 | 2 |
| Retries | 0 | 2 |
| Timeout | 60s | 60s |
| Action timeout | 5s | 5s |

Artifacts (screenshots, video, traces) are retained on failure.

## Running Tests

### Default run (public + internal chromium)

```bash
npm run test
```

### URL check tests (external link validation)

```bash
npm run test:urlCheck
```

### Local environment

```bash
npm run test:local
```

### Other environments

```bash
npm run test:tst
npm run test:dev
```

### Other browsers

```bash
npm run test:firefox
npm run test:all-browsers
```

### Interactive UI mode

```bash
npm run test:ui
```

### Filtering

Run a single spec:

```bash
npx playwright test tests/e2e.spec.js
```

Run specific projects:

```bash
npx playwright test --project=public-chromium tests/pages/location-page.spec.js
```

Filter by tag:

```bash
npx playwright test --grep @noDeps
```

## Project Structure

```
e2e/
├── tests/
│   ├── common/          # Shared page tests (cookies, footer, accessibility, etc.)
│   ├── pages/           # Page-specific tests
│   └── e2e.spec.js      # Full end-to-end journey test
├── pages/
│   ├── .utils/          # definePage(), form control factories
│   ├── common/          # Shared page objects (cookies, privacy, T&C, etc.)
│   └── *.page.js        # Page-specific objects
├── test-runner-api/
│   ├── form-driver.js   # Playwright form interactions
│   ├── map-driver.js    # Map-specific Playwright interactions
│   ├── steps.js         # Domain-level form steps
│   └── map-steps.js     # Domain-level map steps
├── data/                # Test data (locations, users, validation inputs)
├── environments.js      # Environment URL configuration
├── playwright.config.js # Playwright configuration
└── package.json
```

## Reports

After a test run, the HTML report opens automatically (locally) or can be viewed with:

```bash
npm run report:open
```

Reports and artifacts are written to `playwright-report/` and `test-results/`.

## Troubleshooting

- **"Unknown TEST_ENV"** — Set `TEST_ENV` to one of: `local`, `dev`, `tst`.
- **"Missing base URL config"** — The chosen environment is missing `baseUrl` or `internalBaseUrl` in `environments.js`.
- **Timeouts on map tests** — Map interactions depend on tile loading; ensure the target environment is responsive.
- **Strict mode violations** — A link's text matches multiple elements. Update the page object to use the exact link text, or check if the page content has changed.
