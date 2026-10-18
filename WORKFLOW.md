# فرایند مرکزی توسعه، انتشار و آزمون پکیج‌ها

این فایل مرجع واحد و قابل‌تکرار برای تغییر، آزمون، انتشار beta و اعتبارسنجی پکیج‌های Vue 2 در `vue2-package-lab` است. هر بار پکیج یا نسخهٔ جدیدی به آزمایشگاه اضافه می‌شود، **همین فایل** باید به‌روزرسانی شود؛ سند موازی دیگری نسازید.

هدف این فرایند جداسازی روشن دو نقش است:

- ریپوی پکیج، محل تغییر سورس، CI، demo، version، tag و انتشار npm است.
- ریپوی آزمایشگاه، یک مصرف‌کنندهٔ مستقل است که فقط artifact واقعی npm یا tarball کاندید را نصب می‌کند و هیچ سورس، `file:` dependency یا workaround پنهان ندارد.

آزمایشگاه هیچ API، داده، secret یا احراز هویت شرکتی ندارد. داده‌ها deterministic و محلی‌اند و mock API فقط در Vite dev/preview اجرا می‌شود. این ریپو در معماری فعلی GitHub Pages ندارد؛ hosting استاتیک به‌تنهایی سناریوهای وابسته به mock API را اجرا نمی‌کند و فعال‌سازی Pages فقط پس از طراحی آگاهانهٔ transport/backend جایگزین معنا دارد.

## چک‌لیست انسانی شش‌مرحله‌ای

1. تغییر پکیج، تست مرتبط و `CHANGELOG.md` را روی branch جدا آماده و نسخهٔ beta را بدون tag خودکار bump کنید.
2. همهٔ gateهای محلی پکیج را اجرا و محتویات `npm pack --dry-run` را بازبینی کنید.
3. tarball کاندید را بدون تغییر manifest/lock در آزمایشگاه نصب کنید، gateهای مصرف‌کننده را اجرا و آزمایشگاه را clean restore کنید.
4. PR را review/merge کنید و سبز بودن CI و demo عمومی پکیج برای commit دقیق را تأیید کنید.
5. فقط با `npm publish --tag beta --access public` منتشر کنید؛ registry، dist-tag، tarball، source tag و GitHub Release را راستی‌آزمایی کنید.
6. نسخهٔ منتشرشده را از npm در آزمایشگاه ثبت کنید، گزارش و CI guard را به‌روز کنید، gateها را اجرا و CI آزمایشگاه را سبز نگه دارید.

## Registry پکیج‌ها

| شناسه در آزمایشگاه | پکیج npm | نسخهٔ مصرف‌شده | ریپوی سورس | demo عمومی | صفحات/سناریوها | وضعیت |
| --- | --- | --- | --- | --- | --- | --- |
| `smart-datatable` | `vue2-smart-datatable` | `0.1.0-beta.2` | <https://github.com/reydi-dev/vue2-smart-datatable> | <https://reydi-dev.github.io/vue2-smart-datatable/> | `/local`، `/server`، `/scenarios` | فعال |
| _برای پکیج بعدی یک ردیف اضافه شود_ | — | — | — | — | — | برنامه‌ریزی‌نشده |

در هر ارتقای نسخه، ستون «نسخهٔ مصرف‌شده»، hardcodeهای UI/CI، `package.json`، lockfile و `TEST_REPORT.md` را با هم به‌روزرسانی کنید.

## پیش‌نیاز و متغیرهای هر release

Node.js 20 یا جدیدتر، npm، Git و دسترسی publish به npm لازم‌اند. GitHub CLI (`gh`) اختیاری است و فقط commandهای GitHub را کوتاه می‌کند؛ همهٔ عملیات PR، checks، merge و Release را می‌توان از Web UI ریپو انجام داد. مسیرها و نسخه را یک بار در shell تنظیم کنید:

```sh
export PACKAGE_REPO="/absolute/path/to/vue2-smart-datatable"
export LAB_REPO="/absolute/path/to/vue2-package-lab"
export PACKAGE_NAME="vue2-smart-datatable"
export NEXT_VERSION="0.1.0-beta.3"
export PACKAGE_GITHUB="reydi-dev/vue2-smart-datatable"
export LAB_GITHUB="reydi-dev/vue2-package-lab"
```

قبل از ادامه، صحت مسیرها و clean بودن هر دو ریپو را بررسی کنید:

```sh
test -d "$PACKAGE_REPO/.git"
test -d "$LAB_REPO/.git"
git -C "$PACKAGE_REPO" status --short --branch
git -C "$LAB_REPO" status --short --branch
npm whoami
command -v gh >/dev/null 2>&1 && gh auth status || echo "gh is optional; use the GitHub Web UI"
```

اگر هر working tree تغییر ناشناخته دارد، release را متوقف کنید؛ تغییر دیگران را stash، reset یا overwrite نکنید.

## ۱. Branch، تغییر و CHANGELOG در ریپوی پکیج

از `main` به‌روز یک branch موضوعی بسازید. نام branch باید هدف را بیان کند:

```sh
cd "$PACKAGE_REPO"
git switch main
git pull --ff-only origin main
git switch -c "release/$NEXT_VERSION"
```

تغییر را همراه تست‌های unit/consumer مرتبط انجام دهید. `CHANGELOG.md` باید شامل نسخه، تاریخ، تغییر observable، migration/breaking change و bug fixهای شناخته‌شده باشد. ایراد مصرف‌کننده را در سورس پکیج رفع کنید، نه با patch یا copy در آزمایشگاه.

قبل از bump، مطمئن شوید نسخه هنوز روی registry وجود ندارد:

```sh
if npm view "$PACKAGE_NAME@$NEXT_VERSION" version >/dev/null 2>&1; then
  echo "ERROR: $PACKAGE_NAME@$NEXT_VERSION already exists and is immutable"
  exit 1
fi
```

نسخه را بدون commit/tag خودکار npm افزایش دهید؛ این دستور `package.json` و lockfile را هماهنگ می‌کند:

```sh
npm version "$NEXT_VERSION" --no-git-tag-version
git diff -- package.json package-lock.json CHANGELOG.md
```

پس از تکمیل CHANGELOG، تغییرات را commit کنید:

```sh
git add package.json package-lock.json CHANGELOG.md src tests docs examples
git diff --cached --check
git commit -m "release: $NEXT_VERSION"
```

اگر بعضی مسیرها در آن تغییر وجود ندارند، فقط فایل‌های واقعی و بازبینی‌شده را به `git add` بدهید؛ از stage کورکورانهٔ secret یا خروجی build خودداری کنید.

## ۲. Gateهای محلی واقعی پکیج

این ترتیب با scriptهای فعلی `vue2-smart-datatable` منطبق است. هیچ مرحله‌ای را به‌خاطر موفقیت مرحلهٔ دیگر حذف نکنید:

```sh
cd "$PACKAGE_REPO"
npm ci
npx playwright install chromium
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run test:dist
npm run test:e2e
npm pack --dry-run
```

Gate موفق یعنی exit code صفر و working tree پاک:

```sh
git status --short
test -z "$(git status --porcelain)"
```

خروجی هر command، نسخهٔ Node/npm و commit hash را برای evidence release نگه دارید.

## ۳. آزمون tarball کاندید در آزمایشگاه، پیش از publish

این مرحله artifact واقعی را می‌سنجد، نه سورس linked. tarball را در یک پوشهٔ موقت بسازید:

```sh
export CANDIDATE_DIR="$(mktemp -d)"
cd "$PACKAGE_REPO"
npm pack --json --pack-destination "$CANDIDATE_DIR"
export CANDIDATE_TARBALL="$(find "$CANDIDATE_DIR" -maxdepth 1 -type f -name '*.tgz' -print -quit)"
test -n "$CANDIDATE_TARBALL"
test -f "$CANDIDATE_TARBALL"
export CANDIDATE_TARBALL="$(cd "$(dirname "$CANDIDATE_TARBALL")" && pwd)/$(basename "$CANDIDATE_TARBALL")"
shasum -a 256 "$CANDIDATE_TARBALL"
tar -tzf "$CANDIDATE_TARBALL"
```

در آزمایشگاه ابتدا baseline را برگردانید، سپس tarball را بدون تغییر tracked manifest/lock نصب کنید:

```sh
cd "$LAB_REPO"
test -z "$(git status --porcelain)"
npm ci
npm install --no-save --package-lock=false "$CANDIDATE_TARBALL"
git diff --exit-code -- package.json package-lock.json
```

نسخه و provenance نصب را بررسی کنید. مسیر نصب نباید symlink باشد و نسخه باید دقیقاً برابر کاندید باشد:

```sh
node -e "const fs=require('node:fs'); const p='node_modules/vue2-smart-datatable'; if(fs.lstatSync(p).isSymbolicLink()) throw new Error('linked package is forbidden'); const m=require('./'+p+'/package.json'); if(m.name!==process.env.PACKAGE_NAME || m.version!==process.env.NEXT_VERSION) throw new Error('candidate provenance/version mismatch'); console.log(m.name+'@'+m.version+' from '+fs.realpathSync(p))"
```

Gateهای مصرف‌کننده را روی همان tarball اجرا کنید:

```sh
npm run typecheck
npm run build
npm run test:e2e
```

در موفقیت یا شکست، آزمایشگاه را به dependency منتشرشدهٔ lockfile برگردانید و پاکی Git را اثبات کنید:

```sh
cd "$LAB_REPO"
npm ci
git diff --exit-code -- package.json package-lock.json
test -z "$(git status --porcelain)"
```

تنها بعد از تأیید مسیر، پاک‌سازی temp مجاز است:

```sh
test -n "$CANDIDATE_DIR"
test -d "$CANDIDATE_DIR"
rm -rf "$CANDIDATE_DIR"
```

## ۴. PR، CI پکیج و demo صفحات GitHub Pages

Branch را push و PR بسازید؛ publish از branch باز یا commit بدون CI ممنوع است:

```sh
cd "$PACKAGE_REPO"
git push -u origin "release/$NEXT_VERSION"
gh pr create --repo "$PACKAGE_GITHUB" --fill
export PR_NUMBER="$(gh pr view --repo "$PACKAGE_GITHUB" --json number --jq .number)"
gh pr checks "$PR_NUMBER" --repo "$PACKAGE_GITHUB" --watch --fail-fast
```

بدون `gh`، پس از push صفحهٔ <https://github.com/reydi-dev/vue2-smart-datatable/compare/> را باز کنید، `main` را به‌عنوان base و branch واقعی `release/$NEXT_VERSION` را به‌عنوان compare انتخاب و PR بسازید. در تب **Checks** یا بخش status checks همان PR منتظر سبز شدن همهٔ jobهای الزامی بمانید؛ reviewها را بررسی و از دکمهٔ **Merge pull request** مطابق policy ریپو استفاده کنید. بعد از merge، در تب **Actions** اجرای متناظر با merge commit را باز و hash آن را با `$PACKAGE_COMMIT` تطبیق دهید.

پس از review و سبز شدن همهٔ checkها، PR را طبق policy ریپو merge کنید. سپس commit دقیق merge را روی `main` بگیرید:

```sh
git switch main
git pull --ff-only origin main
export PACKAGE_COMMIT="$(git rev-parse HEAD)"
test -z "$(git status --porcelain)"
node -e "const p=require('./package.json'); if(p.version!==process.env.NEXT_VERSION) throw new Error('main version mismatch')"
gh run list --repo "$PACKAGE_GITHUB" --commit "$PACKAGE_COMMIT"
```

اگر `gh` نصب نیست، اجرای همان commit را از تب **Actions** ریپوی پکیج باز کنید؛ workflow باید commit hash مورد انتظار را نمایش دهد و همهٔ jobهای الزامی موفق باشند.

همهٔ workflowهای الزامی همان commit باید سبز باشند. demo پکیج را نیز محلی و عمومی بررسی کنید:

```sh
npm run build:demo
```

سپس <https://reydi-dev.github.io/vue2-smart-datatable/> را باز کنید و render، local/server demo، موبایل و console errors را بررسی کنید. Pages باید از commit مورد انتظار deploy شده باشد. این requirement فقط برای demo ریپوی پکیج است؛ `vue2-package-lab` static Pages ندارد، چون mock API آن middleware وابسته به Vite است.

## ۵. انتشار beta در npm

ابتدا prerelease بودن نسخه، identity و dist-tag فعلی را کنترل کنید:

```sh
case "$NEXT_VERSION" in
  *-beta.*) ;;
  *) echo "ERROR: beta workflow refuses non-beta version: $NEXT_VERSION"; exit 1 ;;
esac
npm whoami
npm view "$PACKAGE_NAME" dist-tags --json
git status --short --branch
test -z "$(git status --porcelain)"
test "$(git rev-parse HEAD)" = "$PACKAGE_COMMIT"
```

دستور publish باید **همیشه** tag و access را صریح داشته باشد:

```sh
npm publish --tag beta --access public
```

هرگز برای prerelease از `npm publish` بدون `--tag beta` استفاده نکنید؛ default می‌تواند `latest` را جابه‌جا کند. token یا OTP را در command، shell history، Markdown، issue یا log قرار ندهید؛ از login محلی امن، prompt تعاملی یا GitHub Actions secret/Trusted Publishing استفاده کنید.

## ۶. راستی‌آزمایی registry و tarball منتشرشده

بلافاصله پس از publish، metadata و dist-tagها را از registry بخوانید:

```sh
npm view "$PACKAGE_NAME@$NEXT_VERSION" version dist.tarball dist.integrity dist.shasum --json
npm view "$PACKAGE_NAME" dist-tags --json
npm dist-tag ls "$PACKAGE_NAME"
test "$(npm view "$PACKAGE_NAME" dist-tags.beta)" = "$NEXT_VERSION"
```

tarball منتشرشده را جداگانه دانلود و فهرست آن را بازبینی کنید:

```sh
export VERIFY_DIR="$(mktemp -d)"
npm pack "$PACKAGE_NAME@$NEXT_VERSION" --pack-destination "$VERIFY_DIR"
export PUBLISHED_TARBALL="$(find "$VERIFY_DIR" -maxdepth 1 -type f -name '*.tgz' -print -quit)"
test -f "$PUBLISHED_TARBALL"
shasum -a 256 "$PUBLISHED_TARBALL"
tar -tzf "$PUBLISHED_TARBALL"
```

اگر `npm publish` timeout یا پاسخ مبهم داد، **قبل از retry** با `npm view "$PACKAGE_NAME@$NEXT_VERSION" version` بررسی کنید که نسخه منتشر شده یا نه. ترکیب `name@version` در npm immutable است؛ نسخهٔ منتشرشده را نمی‌توان با محتوای جدید جایگزین کرد. در صورت کشف نقص، یک beta جدید بسازید و فرایند را از ابتدا تکرار کنید؛ `latest` را برای جبران دستکاری نکنید.

## ۷. به‌روزرسانی آزمایشگاه با نسخهٔ منتشرشده

فقط پس از مشاهدهٔ نسخه در npm، dependency واقعی را در آزمایشگاه به‌روزرسانی کنید:

```sh
cd "$LAB_REPO"
git switch main
git pull --ff-only origin main
git switch -c "test/$PACKAGE_NAME-$NEXT_VERSION"
npm install --save-exact "$PACKAGE_NAME@$NEXT_VERSION"
```

همهٔ hardcodeهای نسخهٔ قبلی را پیدا کنید. نسخهٔ guard در `.github/workflows/ci.yml`، registry همین فایل، UI/README و گزارش باید هماهنگ شوند:

```sh
export OLD_VERSION="0.1.0-beta.2"
grep -RIn --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.tools "$OLD_VERSION" .
```

`TEST_REPORT.md` را با Node/Vue/Vuetify/Vite/package دقیق، commandهای واقعاً اجراشده، ماتریس سناریوها، defectها و موارد تست‌نشده به‌روزرسانی کنید. سپس نصب تمیز و gateهای آزمایشگاه را اجرا کنید:

```sh
npm ci
npx playwright install chromium
npm run typecheck
npm run build
npm run test:e2e
node -e "const p=require('./package.json'); const l=require('./package-lock.json'); if(p.private!==true) throw new Error('lab must remain private'); if(p.dependencies[process.env.PACKAGE_NAME]!==process.env.NEXT_VERSION || l.packages['node_modules/'+process.env.PACKAGE_NAME].version!==process.env.NEXT_VERSION) throw new Error('lab package/lock mismatch')"
git diff --check
```

پس از بازبینی، commit/push و CI آزمایشگاه را کامل کنید:

```sh
git add package.json package-lock.json .github/workflows/ci.yml README.md WORKFLOW.md TEST_REPORT.md src tests
git diff --cached --check
git commit -m "test: validate $PACKAGE_NAME@$NEXT_VERSION"
git push -u origin "test/$PACKAGE_NAME-$NEXT_VERSION"
gh pr create --repo "$LAB_GITHUB" --fill
export LAB_PR_NUMBER="$(gh pr view --repo "$LAB_GITHUB" --json number --jq .number)"
gh pr checks "$LAB_PR_NUMBER" --repo "$LAB_GITHUB" --watch --fail-fast
```

بدون `gh`، از Web UI ریپوی آزمایشگاه PR بسازید، status checkهای همان PR را در **Checks** تا پایان دنبال کنید، review و diff را بازبینی و سپس با دکمهٔ merge ادغام کنید.

پس از merge، CI همان commit در `main` را بررسی کنید:

```sh
git switch main
git pull --ff-only origin main
export LAB_COMMIT="$(git rev-parse HEAD)"
gh run list --repo "$LAB_GITHUB" --commit "$LAB_COMMIT"
```

بدون `gh`، اجرای متناظر با `$LAB_COMMIT` را در تب **Actions** ریپوی آزمایشگاه بررسی کنید.

در معماری فعلی برای آزمایشگاه Pages پیکربندی نشده است: `/server` و سناریوهای provider به Vite middleware نیاز دارند و روی hosting استاتیک به‌تنهایی کار نمی‌کنند. اگر بعدها backend یا transport سازگار با hosting استاتیک طراحی شد، تصمیم Pages باید همراه همان تغییر معماری، تست و مستندسازی شود.

## ۸. tag و GitHub Release متناظر با سورس دقیق پکیج

tag باید دقیقاً به `$PACKAGE_COMMIT` منتشرشده اشاره کند، نه commit بعدی:

```sh
cd "$PACKAGE_REPO"
git fetch origin main --tags
git merge-base --is-ancestor "$PACKAGE_COMMIT" origin/main
git tag -a "v$NEXT_VERSION" "$PACKAGE_COMMIT" -m "$PACKAGE_NAME $NEXT_VERSION"
test "$(git rev-parse "v$NEXT_VERSION^{}")" = "$PACKAGE_COMMIT"
git push origin "v$NEXT_VERSION"
gh release create "v$NEXT_VERSION" --repo "$PACKAGE_GITHUB" --verify-tag --title "$PACKAGE_NAME $NEXT_VERSION" --notes-from-tag
```

بدون `gh`، پس از push شدن tag به صفحهٔ **Releases** ریپوی پکیج بروید، **Draft a new release** را انتخاب کنید، tag موجود `v$NEXT_VERSION` را برگزینید، عنوان و release notes را از CHANGELOG وارد و publish کنید. پیش از انتشار Release، در UI روی tag کلیک کنید و مطمئن شوید به `$PACKAGE_COMMIT` اشاره می‌کند.

اگر tag یا release شکست خورد ولی npm publish موفق بود، publish را تکرار نکنید. مشکل auth/network را رفع و همان tag را روی همان commit push کنید. اگر tag از قبل وجود دارد، ابتدا `git rev-parse "v$NEXT_VERSION^{}"` را با `$PACKAGE_COMMIT` مقایسه کنید؛ tag ناسازگار را به‌صورت خودسرانه جابه‌جا نکنید.

## ۹. Failure handling

| نقطهٔ شکست | اقدام امن |
| --- | --- |
| local gate پکیج | publish ممنوع؛ مشکل را در ریپوی پکیج رفع و همهٔ gateها را تکرار کنید. |
| tarball در آزمایشگاه | package/lock آزمایشگاه را با `npm ci` restore کنید؛ fix را در پکیج انجام دهید، نه در lab. |
| CI یا Pages پکیج | publish ممنوع؛ commit جدید بسازید و CI/demo همان commit را دوباره اثبات کنید. |
| publish با پاسخ مبهم | اول `npm view package@version`؛ فقط اگر نسخه قطعاً وجود ندارد retry کنید. |
| defect پس از publish | نسخه immutable است؛ beta بعدی بسازید. `latest` یا tarball قبلی را overwrite نکنید. |
| tag/release پس از publish | همان source commit را tag/release کنید؛ npm publish را تکرار نکنید. |
| CI آزمایشگاه | نسخهٔ npm را حذف/patch نکنید؛ defect و reproduction را ثبت و fix-forward پکیج را آغاز کنید. |

## ۱۰. افزودن پکیج بعدی

هنگام onboarding هر پکیج جدید، همین checklist را کامل کنید:

- [ ] یک ردیف کامل به «Registry پکیج‌ها» در بالای همین فایل اضافه شد.
- [ ] dependency با نسخهٔ دقیق npm در `package.json` و lockfile ثبت شد؛ `file:`، alias سورس و symlink وجود ندارد.
- [ ] ساختار package-specific جدا اضافه شد تا صفحات پکیج قبلی بازنویسی نشوند.
- [ ] routeهای Overview و package test به navigation اضافه شدند.
- [ ] fixture محلی deterministic و در صورت نیاز mock API مستقل تعریف شد؛ هیچ API/دادهٔ شرکت اضافه نشد.
- [ ] CSS/peer runtimeها یک‌بار و بدون runtime تکراری بارگذاری می‌شوند.
- [ ] سناریوهای happy path، empty، error، loading، responsive و قابلیت‌های اختصاصی پکیج در مرورگر تست شدند.
- [ ] hardcode/version guard در CI برای registry چندپکیجی به‌روزرسانی شد.
- [ ] README، screenshotها و `TEST_REPORT.md` به‌روزرسانی شدند.
- [ ] محدودیت hosting استاتیک و نیازهای mock backend مستند شدند.
- [ ] `npm ci`، typecheck، build و E2E روی نصب تمیز موفق شدند.

## Definition of Done و evidence

این جدول را برای هر release در PR یا release notes تکمیل و به log/URL واقعی ارجاع دهید:

| Evidence | مقدار لازم |
| --- | --- |
| نام و نسخه | `$PACKAGE_NAME@$NEXT_VERSION` |
| source commit | hash کامل merge commit روی `main` |
| package local gates | commandها و exit code صفر برای همهٔ scriptهای بخش ۲ |
| candidate tarball | نام فایل، SHA-256، فهرست محتوا و نسخهٔ نصب‌شده در lab |
| consumer gates | typecheck/build/E2E آزمایشگاه روی tarball، سپس clean restore |
| package CI | URL اجرای سبز برای همان source commit |
| Pages demo | URL و زمان smoke check برای همان release |
| npm publish | URL نسخه، `dist.integrity`، `dist.shasum` و `beta` dist-tag |
| lab update | commit/PR و URL CI سبز آزمایشگاه |
| source tag | `v$NEXT_VERSION` و اثبات اشاره به source commit دقیق |
| GitHub Release | URL release متناظر با tag |
| clean trees | `git status --porcelain` خالی در هر دو ریپو |
| security | نبود secret/company data و عدم ثبت token/OTP در log یا Git |

Release فقط وقتی Done است که همهٔ evidenceها موجود باشند، `beta` به نسخهٔ درست اشاره کند، `latest` ناخواسته تغییر نکرده باشد، آزمایشگاه نسخهٔ منتشرشده را از npm مصرف کند، و هر دو CI سبز باشند.

## مستندات رسمی npm

- [`npm pack`](https://docs.npmjs.com/cli/commands/npm-pack/)
- [`npm version`](https://docs.npmjs.com/cli/commands/npm-version/)
- [`npm publish`](https://docs.npmjs.com/cli/commands/npm-publish/)
- [`npm view`](https://docs.npmjs.com/cli/commands/npm-view/)
- [`npm dist-tag`](https://docs.npmjs.com/cli/commands/npm-dist-tag/)
