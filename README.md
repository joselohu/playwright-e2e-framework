# Playwright E2E Framework

[![Playwright tests](https://github.com/joselohu/playwright-e2e-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/joselohu/playwright-e2e-framework/actions/workflows/playwright.yml)

End-to-end tests for the [Sauce Demo](https://www.saucedemo.com) store, written with Playwright and TypeScript. The suite covers login, the product list, the cart and checkout, and runs on Chromium, Firefox, WebKit and a mobile viewport.

Latest report: https://joselohu.github.io/playwright-e2e-framework/

## What it covers

| Area | Tests | Examples |
|---|---|---|
| Login | 7 | locked out user, wrong password, required fields, direct URL without a session, logout |
| Inventory | 6 | all four sort orders, product data, list and detail page agree |
| Cart | 4 | badge count, add and remove, contents survive a reload |
| Checkout | 5 | full purchase, order totals and tax, each required field |

That is 22 tests per desktop browser, plus a three-test smoke run on a Pixel 7 viewport.

## Run it

```bash
npm ci
npx playwright install
npm test
```

Other commands:

| Command | What it does |
|---|---|
| `npm run test:chromium` | Chromium only, the fastest full run |
| `npm run test:smoke` | Only the tests tagged `@smoke` |
| `npm run test:ui` | Playwright UI mode for debugging |
| `npm run report` | Open the HTML report from the last run |
| `npm run typecheck` | TypeScript check without running tests |

No configuration is needed. To point the suite at another environment, copy `.env.example` to `.env` and change `BASE_URL`.

## How it is built

```
src/
  pages/      Page objects: one class per screen, locators and actions only
  fixtures/   Extends Playwright's test with ready-made page objects
  data/       Users, products and customer details
tests/
  auth.setup.ts   Logs in once and saves the session
  *.spec.ts       One spec per feature
```

Design decisions:

- **Log in once.** `auth.setup.ts` signs in and saves the browser state. Every other test starts already authenticated, so the login form is only exercised by the login spec. That spec drops the saved state to start signed out.
- **Page objects hold no assertions.** They expose locators and actions. Assertions stay in the tests, so a failing line reads as a statement about the product.
- **Locators use the app's `data-test` attributes** through `getByTestId`, with role based locators where a button has no test id. No CSS chains or XPath.
- **No fixed waits.** Tests wait on what the user sees. Two places wait for a view specific control because the app changes the URL before it renders the new view. That race only showed up on WebKit.
- **Data driven cases.** Sort orders and required field checks are generated from tables, so adding a case is one line.
- **Independent tests.** Each test gets its own browser context, and the suite runs fully parallel.

## CI

The GitHub Actions workflow runs the type check and the full suite on every push and pull request. It retries a failing test twice and records a trace on the first retry. The HTML report is uploaded as an artifact and, on `main`, published to GitHub Pages.

To enable the published report: repository Settings, Pages, set Source to "GitHub Actions".

## Notes

Sauce Demo is a public practice site. The usernames and password in this repository are the ones shown on its login page.
