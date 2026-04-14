# FMFP End-to-End Tests

UI end-to-end test suite for the [Flood Map for Planning](https://flood-map-for-planning.service.gov.uk/) (FMFP) application, built with [Playwright](https://playwright.dev/).

---

## Architecture

The suite uses a three-layer architecture. Tests read like plain English, drivers handle all Playwright interactions, and page objects define the elements on each page.

```
tests/*.spec.js              ← Specifications (what to test)
  ↓ fixtures (steps / mapSteps)
test-runner-api/              ← FormDriver & MapDriver (how to interact)
  ↓
pages/                        ← Page definitions & control factories
```

### Fixtures (`fixtures.js`)

[Playwright fixtures](https://playwright.dev/docs/test-fixtures) provide two drivers to every test:

| Fixture    | Class        | Purpose |
|------------|-------------|---------|
| `steps`    | `FormDriver` | Standard GOV.UK form page interactions |
| `mapSteps` | `MapDriver`  | Map-specific interactions (extends `FormDriver`) |

```js
import { test } from '../../fixtures.js'

test('example', async ({ steps, mapSteps }) => {
  await steps.open(pages.home.page)
  // ...
})
```

### Drivers (`test-runner-api/`)

All Playwright locator logic lives here. Tests never call `page.getByRole(...)` directly.

**FormDriver** — navigation, form interactions, and assertions for standard GOV.UK pages:

| Method | Description |
|--------|-------------|
| `open(pageDef)` | Navigate to a page and verify its heading |
| `submit()` | Click the "Continue" button |
| `choose(element)` | Select a radio or checkbox option |
| `chooseAndSubmit(element)` | Select an option and submit |
| `type(element, value)` | Fill a text input or spinbutton |
| `select(element, value)` | Choose from a `<select>` dropdown |
| `clickButton(element)` | Click a button by name |
| `clickLink(element)` | Click a link (scoped by type: main, header, or footer) |
| `switchToNewWindow()` | Switch to a newly opened tab/window |
| `expectOn(pageDef)` | Assert the page heading matches |
| `expectText(text)` | Assert text is visible in `<main>` |
| `expectErrorText(element)` | Assert an error message is shown in the alert region |
| `expectLinkExists(element)` | Assert a link is visible (and optionally check its `href`) |
| `expectLinkNotExists(element)` | Assert a link is not present (auto-retrying) |
| `expectButtonExists(element)` | Assert a button is visible |
| `expectButtonNotExists(element)` | Assert a button is hidden |
| `expectUrlContains(substring)` | Assert the current URL contains a substring |

**MapDriver** — extends `FormDriver` with Esri map interactions:

| Method | Description |
|--------|-------------|
| `waitForMapToLoad()` | Wait for the map viewport to be visible and network to settle |
| `clickButton(element)` | Click a map button, polling until it is enabled (`aria-disabled` check) |
| `expandMenuSection(element)` | Expand a collapsible menu section |
| `chooseMenuOption(element)` | Select a menu button, radio, or checkbox option |
| `zoomIn(times)` | Zoom in with retry logic between each click |
| `addSquare()` | Open the location menu and click "Add square" |
| `confirmBoundaryAndContinue()` | Click "Finish" then "Get summary report" |

### Page Objects (`pages/`)

Each page is defined with `definePage({ slug, title })` and exports typed control handles built from factory functions.

**Form controls** (`pages/.utils/form-controls.js`):

| Factory | Scoped to | Usage |
|---------|-----------|-------|
| `link(text)` / `mainLink(text)` | `<main>` | Links in the main content area |
| `headerLink(text)` | `<header>` / service navigation / phase banner | Header navigation links |
| `footerLink(text)` | `<footer>` | Footer links |
| `radioOption(text)` | — | Radio button |
| `checkboxOption(text)` | — | Checkbox |
| `textInput(text)` | — | Text input (matched by label) |
| `selectInput(text)` | — | Select dropdown (matched by label) |
| `button(text)` | — | Button |
| `errorText(text)` | Alert region | Validation error message |

**Map controls** (`pages/.utils/map-controls.js`):

| Factory | Usage |
|---------|-------|
| `menuSection(text)` | Collapsible menu heading |
| `menuButtonOption(text)` | Menu button item |
| `menuRadioOption(text)` | Menu radio item |
| `menuCheckboxOption(text)` | Menu checkbox item |
| `mapButton(text)` | Map toolbar button |

Example page object:

```js
import { definePage } from './.utils/page.js'
import { radioOption, errorText } from './.utils/form-controls.js'

export const page = definePage({
  slug: '/triage',
  title: 'What flood information do you need?'
})

export const planningOption = radioOption('For planning purposes or scoping a site')
export const missingSelectionError = errorText('Choose the flood information you need to continue')
```

### Data-Driven Tests

Parameterised tests use `for...of` loops to generate individual test entries per data item:

```js
for (const { search } of invalidLocationData.invalidPostcodeSearchData) {
  test(`shows error for input: "${search}"`, { tag: '@noDeps' }, async ({ steps }) => {
    // ...
  })
}
```

### `test.step()` for Journey Tests

The end-to-end journey test uses `test.step()` to break the flow into named phases, which appear as collapsible sections in the HTML report and trace viewer:

```js
await test.step('Home → Triage', async () => {
  await steps.open(pages.home.page)
  await steps.clickButton(pages.home.startButton)
})
```

---

## Prerequisites

- Node.js 18+ (LTS recommended)
- Browsers — install whichever you need to run:

  ```bash
  npx playwright install chromium
  npx playwright install firefox
  npx playwright install webkit
  ```

  Or install all supported browsers at once:

  ```bash
  npx playwright install
  ```

- Docker (optional) — for running tests in a containerised environment without installing browsers locally

## Install

```bash
npm install
npx playwright install          # all browsers, or pick one as above
```

## Docker (WIP)

Tests can be run in Docker using the Playwright base image. This is a work in progress.

```bash
docker compose up --build
```

This builds from `Dockerfile`, which uses `mcr.microsoft.com/playwright:v1.58.2` with all browsers pre-installed. By default `docker compose up` runs `npm run test` (public + internal chromium against the `tst` environment). The HTML report is mounted to `./playwright-report` on the host.

To target a different environment, override the `TEST_ENV` variable:

```bash
TEST_ENV=dev docker compose up --build
```

## Configuration

### Environments

Set the target environment with `TEST_ENV`. Defaults to `tst` locally and `local` in CI.

| Environment | Variable | Public URL | Internal URL |
|-------------|----------|------------|--------------|
| local | `TEST_ENV=local` | `http://localhost:8050` | `http://localhost:8050` |
| dev | `TEST_ENV=dev` | `https://fmp2-dev.aws-int.defra.cloud/` | `https://fmp2-internal-dev.aws-int.defra.cloud/` |
| tst | `TEST_ENV=tst` | `https://fmp2-tst.aws-int.defra.cloud/` | `https://fmp2-internal-tst.aws-int.defra.cloud/` |

### Projects

Tests are organised into projects using tag-based filtering:

| Project | Tags included | Tags excluded | Base URL |
|---------|--------------|---------------|----------|
| `public-chromium` | all | `@internal`, `@urlCheck` | Public |
| `internal-chromium` | `@internal`, `@both` | `@urlCheck` | Internal |
| `noDeps-local-chrome` | `@noDeps` | `@urlCheck`, `@internal`, `@both` | Public |
| `urlCheck-chrome` | `@urlCheck` | — | Public |

Firefox and WebKit variants (`public-firefox`, `internal-firefox`, `public-webkit`, `internal-webkit`) follow the same pattern.

### Tags

| Tag | Purpose |
|-----|---------|
| `@noDeps` | No external dependencies — can run against any environment |
| `@internal` | Requires the internal URL |
| `@both` | Runs against both public and internal URLs |
| `@urlCheck` | Validates external third-party links resolve correctly |

Tags are applied via the `{ tag }` config object:

```js
test('example', { tag: '@noDeps' }, async ({ steps }) => { ... })
test.describe('group', { tag: '@noDeps' }, () => { ... })
```

### Settings

| Setting | Local | CI |
|---------|-------|----|
| Workers | 5 | 2 |
| Retries | 0 | 2 |
| Timeout | 60s | 60s |
| Action timeout | 5s | 5s |

Screenshots, video, and traces are captured/retained on failure.

---

## Running Tests

```bash
# Default — public + internal chromium
npm run test

# Local environment (noDeps tests only)
npm run test:local

# URL check tests (external link validation)
npm run test:urlCheck

# Other environments
npm run test:tst
npm run test:dev

# Other browsers
npm run test:firefox
npm run test:all-browsers

# Interactive UI mode
npm run test:ui
```

### Filtering

```bash
# Single spec file
npx playwright test tests/e2e.spec.js

# Specific project + file
npx playwright test --project=public-chromium tests/pages/location-page.spec.js

# By tag
npx playwright test --grep @noDeps

# List tests without running
npx playwright test --list
```

---

## Project Structure

```
e2e/
├── fixtures.js                  # Playwright fixtures (steps, mapSteps)
├── playwright.config.js         # Projects, reporters, settings
├── environments.js              # Environment URL configuration
├── package.json
│
├── test-runner-api/
│   ├── form-driver.js           # FormDriver — GOV.UK form interactions
│   └── map-driver.js            # MapDriver — Esri map interactions
│
├── pages/
│   ├── .utils/
│   │   ├── page.js              # definePage() factory
│   │   ├── form-controls.js     # Form control factories
│   │   └── map-controls.js      # Map control factories
│   ├── common/                  # Shared pages (cookies, privacy, T&C, etc.)
│   └── *.page.js                # Application page objects
│
├── tests/
│   ├── e2e.spec.js              # Full end-to-end journey (test.step phases)
│   ├── pages/                   # Page-specific tests
│   └── common/                  # Shared page tests (footer, header, etc.)
│
└── data/
    ├── location-data.js         # Postcodes, polygons, area data
    ├── user-data.js             # User details for form submission
    └── validation-data/         # Invalid input data for parameterised tests
```

---

## Reports

The HTML report opens automatically after a local run. To reopen it:

```bash
npm run report:open
```

| Output | Location |
|--------|----------|
| HTML report | `playwright-report/` |
| JUnit XML | `test-results/junit.xml` |
| Screenshots / video / traces | `test-results/` |

In CI, the GitHub reporter annotates failures directly on the PR. JUnit results are published via the CI pipeline.

---

## Writing Tests

### Adding a new page test

1. Create a page object in `pages/` (or `pages/common/` for shared pages):

    ```js
    import { definePage } from './.utils/page.js'
    import { link } from './.utils/form-controls.js'

    export const page = definePage({
      slug: '/my-page',
      title: 'My page title'
    })

    export const exampleLink = link('Example link text')
    ```

2. Add the export to `pages/index.js`.

3. Create a spec file in `tests/pages/` (or `tests/common/`):

    ```js
    import { test } from '../../fixtures.js'
    import { pages } from '../../pages/index.js'

    test.describe('My page', { tag: '@noDeps' }, () => {
      test.beforeEach(async ({ steps }) => {
        await steps.open(pages.myPage.page)
      })

      test('displays the correct page title', async ({ steps }) => {
        await steps.expectOn(pages.myPage.page)
      })

      test('navigates somewhere when clicking a link', async ({ steps }) => {
        await steps.clickLink(pages.myPage.exampleLink)
        await steps.expectOn(pages.otherPage.page)
      })
    })
    ```

### Adding a map interaction

Use the `mapSteps` fixture and the map control factories:

```js
test('interacts with the map', async ({ steps, mapSteps }) => {
  await steps.open(pages.map.page)
  await mapSteps.waitForMapToLoad()
  await mapSteps.zoomIn()
  await mapSteps.addSquare()
  await mapSteps.confirmBoundaryAndContinue()
})
```

### Tagging guidelines

- Use `@noDeps` for tests that only interact with the app's own pages (no external API calls or third-party redirects).
- Use `@urlCheck` for tests that click links to external sites and assert the destination URL.
- Use `@internal` for tests that require the internal URL (e.g. features only visible internally).
- Use `@both` for tests that should run against both public and internal URLs.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Unknown TEST_ENV "..."` | Set `TEST_ENV` to `local`, `dev`, or `tst` |
| `Missing base URL config` | Check `environments.js` has `baseUrl` and `internalBaseUrl` for the chosen environment |
| Map test timeouts | Map interactions depend on tile loading — ensure the target environment is responsive |
| Strict mode violation | A link's text matches multiple elements — update the page object to use the full exact link text |
| `@urlCheck` flakiness | External sites may be slow or temporarily unavailable — these tests are excluded from the default run for this reason |
