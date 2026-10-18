# Vue 2 Package Lab — Test Report

Date: 2026-10-19
Package under test: `vue2-smart-datatable@0.1.0-beta.3` installed from npm

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
| vue2-smart-datatable | 0.1.0-beta.3 |

`npm ls vue vuetify vite vue2-smart-datatable --all` showed every package using the same deduped `vue@2.7.16`. The production JavaScript contains one `Vue.js v2.7.16` signature. Vite also aliases bare `vue` imports to `node_modules/vue/dist/vue.runtime.esm.js` and sets `dedupe: ['vue']`.

## Commands and actual outcomes

| Command | Actual result |
| --- | --- |
| `npm ci` | PASS — 52 packages installed from `package-lock.json` using an ignored local cache. |
| `npx playwright install chromium` | BLOCKED ON THIS HOST — pinned Playwright reports that its Chromium build is unsupported on macOS 13; Linux CI uses the documented installer. The existing managed Chromium build 1187 in ignored `.tools/ms-playwright` was used for the local browser run. |
| `npm run typecheck` | PASS — `vue-tsc --noEmit`, exit 0. |
| `npm run build` | PASS — Vite transformed 35 modules and emitted the production app. One non-blocking warning reported a JavaScript chunk over 500 kB. |
| `PLAYWRIGHT_BROWSERS_PATH="$PWD/.tools/ms-playwright" npm run test:e2e` | PASS — 10/10 browser tests in 37.6 seconds using the `desktop-chromium` and `mobile-chromium` projects, a fresh forced Vite server on port 4176, and no system Chrome channel. |
| `npm ls vue vuetify vite vue2-smart-datatable --all` | PASS — a single deduped Vue 2.7.16 installation. |
| `grep -R 'file:' package.json package-lock.json` | PASS — no local/file dependency or source-repository alias. |

The sandbox could not read the system OpenSSL configuration or bind a local test port, so validation commands in this agent environment used `OPENSSL_CONF=/dev/null` and browser tests ran outside the sandbox; neither workaround is present in project scripts, Playwright configuration, README commands, or CI. The clean install used the ignored `.tools/npm-cache`. The current macOS host cannot download the pinned Chromium build through plain `npx playwright install chromium`, so the successful rerun used the already-installed Playwright-managed build 1187 from ignored `.tools/ms-playwright`; normal supported developer machines and Linux CI use the README commands unchanged.

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
| Production preview | NOT RE-RUN FOR BETA.3 | Production build passed, but a separate preview-server smoke check was not requested or run for this adoption. |

## Public repository readiness

- `playwright.config.ts` uses the Playwright-managed default Chromium browser and starts `npm run dev` on the dedicated test port 4176 with `--force`, `--strictPort`, and `reuseExistingServer: false`. This prevents candidate tests from attaching to a stale port-4173 dev server or stale optimized dependencies. It contains no `.tools` path, `OPENSSL_CONF`, or system Chrome channel.
- `.github/workflows/ci.yml` performs `npm ci`, installs Chromium with OS dependencies, then runs typecheck, build, and browser tests on pushes and pull requests to `main`.
- CI also fails if `package.json` stops being private or if `vue2-smart-datatable` is no longer pinned to the exact published version `0.1.0-beta.3`.
- The workflow uses read-only repository permissions and uploads the generated Playwright report only as a short-lived Actions artifact when a job fails.
- `package.json` remains `private: true`, preventing accidental npm publication while allowing the GitHub repository itself to be public. The tested table dependency is the exact npm version `0.1.0-beta.3`.
- The project is MIT licensed to Mohammad Reza Dehghani. README includes exact quickstart/test commands, the four-page architecture, screenshots, and a prominent link to this report.
- `.gitignore` excludes dependencies, build output, test/report output, coverage, local tools, environment files, npm credentials, local overrides, keys, and certificates.
- A source/documentation scan found only deterministic `example.test` fixture identities and the local `/api/users` route; no company endpoint, company data, secret, token, or authentication configuration was added.
- Public remote: <https://github.com/reydi-dev/vue2-package-lab>. Initial commit `78e68af` is on `main`.
- GitHub Actions run [`39171813830`](https://github.com/reydi-dev/vue2-package-lab/actions/runs/39171813830) completed successfully for lab `main` immediately before the beta.3 adoption branch.
- The central release and future-package procedure is maintained in `WORKFLOW.md`.

## Publication and packaging findings

- Source release commit: [`e64b8e492f5609284f02bf734c6b5d0f6d5962a2`](https://github.com/reydi-dev/vue2-smart-datatable/commit/e64b8e492f5609284f02bf734c6b5d0f6d5962a2), merged through [PR 37](https://github.com/reydi-dev/vue2-smart-datatable/pull/37).
- Registry verification: `vue2-smart-datatable@0.1.0-beta.3`, shasum `a0c7d83a77085343e583b2e0d52e7649759c988e`; `beta` points to beta.3 and `latest` remains beta.2.
- FIXED from beta.2: the published beta.3 artifact includes `docs/api.md`, `docs/providers.md`, `docs/adapters.md`, `docs/roadmap.md`, and the other declared documentation files, so README-relative documentation links resolve inside the installed package.
- FIXED from beta.2: `dist/types/index.d.ts` no longer imports the absent `./styles/index.scss` path.
- Package-shape verification found the expected ESM/CJS bundles, CSS, declarations, documentation, changelog, license, security and contribution files. The installed package is a real npm directory, not a symlink or local alias.

No functional package defect was observed in the beta.3 browser scenarios above. The lab contains no patch, copied component, local alias, or behavioral workaround for the package.

## Environment and security observations

- Vue 2.7.16 and Vuetify 2.6.16 are deprecated/EOL; npm prints both warnings during clean install.
- `npm audit` reports 8 findings for the selected legacy dependency tree. No force-upgrade was applied because it could change compatibility and is outside this consumer test.
- Vite reports one large-chunk warning (the application, Vuetify, icons and table are currently bundled together). This is a lab optimization opportunity, not a package behavior failure.
- Git 2.39.2 is available when commands run outside the sandbox. The repository has public remote `origin`, branch `main`, and initial commit `78e68af`; the working tree was clean before this documentation change.

## Not yet tested

- Screen-reader testing with VoiceOver/NVDA and full keyboard-only audit beyond visible focus styling.
- Safari/WebKit and Firefox engine compatibility; automated tests use Playwright-managed Chromium.
- Very large data sets, long-duration soak tests, and network conditions beyond deterministic 0/500/1500 ms latency.
- Custom persistence backends other than the package local-storage adapter.
- CSV content for non-ASCII/large exports beyond successful browser download.
- Live global Vuetify RTL switching. The documented table `direction` prop is tested instead, as stated in the UI.
