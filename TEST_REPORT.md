# Vue 2 Package Lab — Test Report

Date: 2026-10-18
Package under test: `vue2-smart-datatable@0.1.0-beta.2` installed from npm

## Exact environment

| Component | Version |
| --- | --- |
| Node.js | 22.14.0 (portable darwin-x64 used for validation) |
| npm | 10.9.2 |
| Vue | 2.7.16 |
| Vuetify | 2.6.16 |
| Vue Router | 3.6.5 |
| Vite | 6.1.0 |
| TypeScript | 5.9.2 |
| vue-tsc | 2.2.12 |
| Playwright | 1.55.0, managed Chromium 140.0.7339.16 (build 1187) |
| vue2-smart-datatable | 0.1.0-beta.2 |

`npm ls vue vuetify vite vue2-smart-datatable --all` showed every package using the same deduped `vue@2.7.16`. The production JavaScript contains one `Vue.js v2.7.16` signature. Vite also aliases bare `vue` imports to `node_modules/vue/dist/vue.runtime.esm.js` and sets `dedupe: ['vue']`.

## Commands and actual outcomes

| Command | Actual result |
| --- | --- |
| `npm ci --ignore-scripts` | PASS — 52 packages installed from `package-lock.json` using an ignored local cache; npm reported 8 audit findings (2 low, 1 moderate, 5 high) in this EOL Vue 2 dependency tree. |
| `npx playwright install chromium` | PASS — downloaded Playwright-managed Chromium 140.0.7339.16, build 1187. |
| `npm run typecheck` | PASS — `vue-tsc --noEmit`, exit 0. |
| `npm run build` | PASS — Vite transformed 35 modules and emitted the production app. One non-blocking warning reported a JavaScript chunk over 500 kB. |
| `npm run test:e2e` | PASS — 10/10 browser tests in 47.8 seconds using the `desktop-chromium` and `mobile-chromium` projects; no system Chrome channel configured. |
| `npm run preview -- --host 127.0.0.1 --port 4174` | PASS — production preview opened; `/server` fetched `/api/users`, showed 10 rows and total 140, and did not render a blank page. |
| `npm ls vue vuetify vite vue2-smart-datatable --all` | PASS — a single deduped Vue 2.7.16 installation. |
| `grep -R 'file:' package.json package-lock.json` | PASS — no local/file dependency or source-repository alias. |

The sandbox could not read the system OpenSSL configuration, so validation commands in this agent environment used `OPENSSL_CONF=/dev/null`; this is not present in project scripts, Playwright configuration, README commands, or CI. The first clean-install attempt also encountered root-owned files in the user's global npm cache, so the successful rerun used the ignored `.tools/npm-cache` rather than changing global ownership or using `sudo`. Normal developer and CI environments use the README commands unchanged.

## Scenario matrix

| Scenario | Result | Evidence |
| --- | --- | --- |
| App and four routes render | PASS | Browser test visits `/`, `/local`, `/server`, `/scenarios` and checks non-empty content. |
| Local rows, filtering, sorting | PASS | 72 deterministic rows; test filters to Noah and verifies descending name sort and emitted `update:sort`. |
| Local pagination/page size | PASS (rendered/manual control available) | Pagination reports 1–10 of 72 with 10/25/50 sizes; package control is exercised indirectly by server paging test. |
| Selection, custom status cell, row action | PASS (rendered/manual) | Checkbox selection, scoped status chips and non-destructive Inspect action are wired to status/event panels. |
| Server request and query changes | PASS | Browser observes `/api/users?page=2&per_page=10`, changed rows, and a `name=Noah` filter request. |
| API validation/order | PASS (implementation inspection + browser response) | Inputs are allow-listed; filter → total → sort → page is explicit in the local handler. |
| Loading and slow response | PASS (rendered/manual) | 0/500/1500 ms controls and slow scenario use the package loading state. |
| Stale response protection | PASS | Rapid-filter test submits Ava then Noah with latency and verifies only Noah remains; provider passes the package AbortSignal to fetch. |
| Empty state | PASS | Empty API scenario renders the package empty message. |
| Persistent server error and Retry UI | PASS | 503 scenario renders package error and Retry control. |
| One-time error then Retry success | PASS | First request returns 503; clicking the package Retry control returns 10 rows. |
| Mobile 360 px | PASS | Mobile-card rendering and no document-level horizontal overflow verified. |
| Tablet 768 px | PASS | Collapsed navigation, mobile-card rendering and no document-level horizontal overflow verified. |
| RTL | PASS | Test toggles the documented `direction` prop and verifies `dir="rtl"` on the table root. |
| Column visibility persistence | PASS | Email is hidden, page is refreshed, and the column remains hidden. |
| CSV export | PASS | Browser receives a real `.csv` download from the published exporter. |
| Production preview | PASS | Provider-backed server table rendered from `dist` with a successful local API response. |

## Public repository readiness

- `playwright.config.ts` uses the Playwright-managed default Chromium browser and starts `npm run dev` normally. It contains no `.tools` path, `OPENSSL_CONF`, or system Chrome channel.
- `.github/workflows/ci.yml` performs `npm ci`, installs Chromium with OS dependencies, then runs typecheck, build, and browser tests on pushes and pull requests to `main`.
- CI also fails if `package.json` stops being private or if `vue2-smart-datatable` is no longer pinned to the exact published version `0.1.0-beta.2`.
- The workflow uses read-only repository permissions and uploads the generated Playwright report only as a short-lived Actions artifact when a job fails.
- `package.json` remains `private: true`, preventing accidental npm publication while allowing the GitHub repository itself to be public. The tested table dependency remains the exact npm version `0.1.0-beta.2`.
- The project is MIT licensed to Mohammad Reza Dehghani. README includes exact quickstart/test commands, the four-page architecture, screenshots, and a prominent link to this report.
- `.gitignore` excludes dependencies, build output, test/report output, coverage, local tools, environment files, npm credentials, local overrides, keys, and certificates.
- A source/documentation scan found only deterministic `example.test` fixture identities and the local `/api/users` route; no company endpoint, company data, secret, token, or authentication configuration was added.
- The GitHub Actions workflow was inspected locally but has not been executed on a GitHub-hosted runner because this task intentionally creates no remote.

## Package issues

### 1. Published README links to documentation files absent from the npm package

- Severity: Medium (consumer documentation/discoverability)
- Reproduction:
  1. Install `vue2-smart-datatable@0.1.0-beta.2` from npm.
  2. Open `node_modules/vue2-smart-datatable/README.md`.
  3. Follow relative links such as `docs/api.md`, `docs/providers.md`, `docs/adapters.md`, and `docs/roadmap.md`.
  4. Inspect the package contents; no `docs/` directory is published.
- Expected: linked consumer documentation is shipped, or README links use absolute public repository URLs.
- Actual: the links target missing files inside the installed package.
- Lab treatment: no workaround was hidden in the application. Provider behavior was implemented from the installed README example and installed type declarations, and this packaging defect is recorded here.

### 2. Root declaration imports a non-published stylesheet source path

- Severity: Low (package integrity/tooling compatibility)
- Reproduction:
  1. Inspect `node_modules/vue2-smart-datatable/dist/types/index.d.ts`.
  2. It contains `import './styles/index.scss'`.
  3. Inspect `node_modules/vue2-smart-datatable/dist/types`; that stylesheet path is absent.
- Expected: every relative import in emitted declarations resolves to a published file, or the source-style side-effect import is omitted from declarations.
- Actual: the declaration points to a file not present in the npm artifact.
- Observed impact: this lab's `vue-tsc` run still passes, but stricter declaration consumers or packaging tools may flag the dangling import.

No functional package defect was observed in the browser scenarios above. The lab contains no patch, copied component, local alias, or behavioral workaround for the package.

## Environment and security observations

- Vue 2.7.16 and Vuetify 2.6.16 are deprecated/EOL; npm prints both warnings during clean install.
- `npm audit` reports 8 findings for the selected legacy dependency tree. No force-upgrade was applied because it could change compatibility and is outside this consumer test.
- Vite reports one large-chunk warning (the application, Vuetify, icons and table are currently bundled together). This is a lab optimization opportunity, not a package behavior failure.
- `/usr/bin/git` is present but unusable on this machine because Xcode Command Line Tools are missing: `xcrun: error: invalid active developer path (/Library/Developer/CommandLineTools)`. Read-only metadata inspection shows `HEAD` points to `refs/heads/main`, but there is no branch ref, packed ref, index, or remote section in `.git/config`. The object database contains three unreachable agent-host checkpoint commits (`baseline checkpoint`, `turn 1 start`, and `turn 1`), but no ref selects any of them, so there is no verifiable current commit or branch history. No commit was created and no `.git` metadata was manually changed during publication-readiness work.

## Not yet tested

- Screen-reader testing with VoiceOver/NVDA and full keyboard-only audit beyond visible focus styling.
- Safari/WebKit and Firefox engine compatibility; automated tests use Playwright-managed Chromium.
- An actual GitHub-hosted Actions run; the workflow cannot run until the repository is intentionally connected to GitHub.
- Very large data sets, long-duration soak tests, and network conditions beyond deterministic 0/500/1500 ms latency.
- Custom persistence backends other than the package local-storage adapter.
- CSV content for non-ASCII/large exports beyond successful browser download.
- Live global Vuetify RTL switching. The documented table `direction` prop is tested instead, as stated in the UI.
