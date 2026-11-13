# Inkwell Hugo 主题 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从空仓库做出一个以阅读为中心、可复用的 Hugo 主题 Inkwell，附带可运行的 `exampleSite`。

**Architecture:** 纯 Hugo：新版模板目录（`layouts/` 下的 `baseof/home/page/...` 与 `_partials`、`_markup`），手写 CSS（CSS 变量管理明暗两套颜色，Hugo 资源管道合并加指纹），原生 ES 模块 JS（用 Hugo 内置 `js.Build` 打包，不需要 npm）。文章页的“目录”和“系列篇目”在 DOM 里各只渲染一次，靠 CSS 在三档宽度下分别摆成侧栏或底部抽屉。验证靠一个 shell 测试脚本：多种配置构建 `exampleSite`，再对产物做断言。

**Tech Stack:** Hugo ≥ 0.146.0（开发用 0.169.0）、Go 模板、CSS、原生 JavaScript；测试用 bash + `node --test`（仅开发时，Node ≥ 22.7，无 npm 依赖）；CDN 按需加载 KaTeX 样式 0.18.4、Mermaid 11、giscus。

**Spec:** `docs/superpowers/specs/2026-11-13-inkwell-theme-design.md`

## Global Constraints

- Hugo 最低版本 `0.146.0`，写入 `theme.toml` 的 `min_version`；不需要 extended；不用 Sass。
- 不引入任何 npm 依赖，仓库里不出现 `package.json`、`node_modules`。
- 只用系统字体：正文 `-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`；等宽 `ui-monospace, "SF Mono", Menlo, Consolas, monospace`。
- 第三方资源只有 KaTeX 样式、Mermaid、giscus，全部按需加载，地址来自 `params`。
- 主题的 `hugo.toml` **只放 `params`**。Hugo 不合并主题里的 `taxonomies`、`markup`、`outputs`、语言设置；缺少站点配置时对应功能安静地不出现，构建不得报错。
- 所有站内链接和资源地址用 `.RelPermalink` / `relURL`，保证站点部署在子路径下可用。
- 所有界面文字走 `i18n`，模板里不写死中文或英文。
- 颜色、字号、间距一律用 `assets/css/tokens.css` 里的 CSS 变量。
- 任何宽度下页面本身不得出现横向滚动条。
- 关掉 JavaScript 时文章可完整阅读（此时固定为浅色，目录以正文前的静态块显示）。
- **提交步骤**：使用者尚未确认由执行者提交 git。执行前先问；未获确认则跳过每个任务末尾的 Commit 步骤，不推送。
- 测试构建一律不加 `--minify`，断言依赖未压缩的 HTML。

## 共享约定（所有任务都依赖）

**断点与尺寸**

| 名称 | 值 |
|---|---|
| 窄屏 | `< 1000px`：单栏 + 悬浮按钮；正文字号 `16px` |
| 中等 | `1000px – 1279px`：正文 + 右目录，整体居中；正文字号 `17px` |
| 大屏 | `≥ 1280px`：对称三列网格 `220px / 40em / 220px`，正文在视口正中 |
| `--measure` | `40em`（每行约 40 个汉字） |
| `--sidebar` | `220px` |
| `--gap` | `48px` |

**类名与数据属性**

- 根：`<html lang="…" class="no-js" data-theme="light|dark">`。内联脚本去掉 `no-js` 并设置 `data-theme`。
- 页面骨架：`.site-header`（内含 `.site-title`、`.site-nav`、`button[data-search-open]`、`button[data-theme-toggle]`）、`main.site-main`、`.site-footer`。
- 列表：`.post-list.post-list--compact` 或 `.post-list.post-list--summary`；年份组 `.post-year`；条目 `.post-item`；分页 `.pager`。
- 文章：`div.article-layout`（按需追加 ` has-toc`、` has-series`，顺序固定为先 toc 后 series）> `article.article` > `.article-header`（`.article-title`、`.article-meta`）、`.prose`、`.article-footer`（`.post-nav`、`section.comments`）。
- 抽屉：`div#drawer.drawer[data-active="toc|series"]` > `.drawer-tabs`（`button[data-drawer-tab="toc|series"]`）、`nav.drawer-panel.toc[data-panel="toc"]`、`nav.drawer-panel.series-nav[data-panel="series"]`；`button.fab[data-drawer-toggle]`；`.drawer-backdrop`。打开状态：`html[data-drawer="open"]`。
- 高亮：目录当前项 `a.is-active`；系列当前篇 `li.is-current` 且链接带 `aria-current="page"`。
- 正文钩子：`a.heading-anchor`；`div.table-wrap`；`figure.figure > img[data-zoomable]` + `figcaption`；`blockquote.alert.alert-<type>` > `p.alert-title`；`div.code-block` > `div.code-header`（`span.code-lang`、`button.code-copy[data-code-copy]`）+ `.highlight`；`pre.mermaid[data-source]`；块级公式 `div.math-display`。
- 搜索：`dialog#search-dialog[data-index="<索引地址>"]`、`input#search-input`、`ol#search-results`。
- 图片放大：`dialog.lightbox`。
- 评论：`section.comments[data-giscus]`，giscus 参数放在 `data-repo`、`data-repo-id`、`data-category`、`data-category-id`、`data-mapping`、`data-lang`。

**脚本约定**

- 本地存储键 `inkwell-theme`，值 `light` 或 `dark`；没有值时跟随系统。读写都包在 `try/catch` 里（隐私模式下可能抛异常）。
- 主题切换后派发 `document` 事件 `inkwell:themechange`，`detail = { theme: "light" | "dark" }`。
- 打包入口与产物：`assets/js/main.js` → `js/main.<hash>.js`（每页）；`search.js` → `js/search.<hash>.js`（开启搜索时）；`mermaid.js` → `js/mermaid.<hash>.js`（页面含 Mermaid 时）；`comments.js` → `js/comments.<hash>.js`（页面显示评论时）。CSS 产物 `css/inkwell.<hash>.css`。

**主题 `params` 默认值（`hugo.toml`）**

```toml
[params.home]
  listStyle = "compact"          # 或 "summary"
[params.article]
  showWordCount = true
  showReadingTime = true
  externalLinkNewTab = true
[params.search]
  enable = false
[params.math]
  enable = true
  css = "https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.css"
  cssIntegrity = "sha384-u1zONI5gPXUx0UKI62c75/zww972y0v2rSK5ZYlVdS6xEuWDeZWUI66v6t1gvlXJ"
[params.mermaid]
  url = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"
[params.footer]
  text = ""
[params.comments.giscus]
  repo = ""                      # 非空即开启评论
  repoId = ""
  category = ""
  categoryId = ""
  mapping = "pathname"
```

**站点必须自己写的配置（`exampleSite/hugo.toml` 与 README 共用同一段）**

```toml
languageCode = "zh-CN"
defaultContentLanguage = "zh-cn"
hasCJKLanguage = true
theme = "Inkwell"

[pagination]
  pagerSize = 5                  # 示例站点用 5，README 里建议 20

[taxonomies]
  tag = "tags"
  series = "series"

[markup.tableOfContents]
  startLevel = 2
  endLevel = 3
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)']]
[markup.goldmark.renderer]
  unsafe = true                  # 可选：正文内嵌 <kbd>、<mark>、<details> 需要
```

`exampleSite/hugo.toml` 另加 `themesDir = "../.."`、`[params.search] enable = true`、`menus.main`（首页、归档、系列、标签、关于）。

**i18n 键（`zh-cn.toml` 与 `en.toml` 必须一一对应）**

`toc`、`series`、`seriesPosition`（参数 `Index`、`Total`，中文为“第 {{ .Index }} / {{ .Total }} 篇”）、`allSeries`、`prev`、`next`、`published`、`updated`、`words`（参数 `Count`）、`readingTime`（参数 `Count`）、`tags`、`archives`、`postCount`（参数 `Count`，中文为“{{ .Count }} 篇”）、`newerPosts`、`olderPosts`、`search`、`searchPlaceholder`、`searchEmpty`、`copy`、`copied`、`toggleTheme`、`openDrawer`、`close`、`notFound`、`backHome`（中文为“返回首页”）、`comments`、`note`、`tip`、`important`、`warning`、`caution`。

**示例站点内容（文件名固定，测试按路径断言）**

| 文件 | 用途 |
|---|---|
| `content/_index.md` | 首页简介 |
| `content/about.md` | 关于页；`toc: false`、`comments: false`，正文含 3 个二级标题 |
| `content/archives.md` | `layout: archives`，标题“归档” |
| `content/posts/markdown-style-test.md` | 覆盖 spec 5.5 全部元素；`series: ["主题演示"]`，不设 `weight`，日期较早；`tags: ["Markdown", "样式"]` |
| `content/posts/math-and-diagrams.md` | 公式与 Mermaid；`series: ["主题演示"]`，不设 `weight`，日期较晚 |
| `content/posts/long-essay.md` | 两千字以上中文随笔，多个二、三级标题；不属于系列 |
| `content/posts/photo-notes/index.md` + `1.svg` `2.svg` `3.svg` | 图文；图片为手写的占位 SVG；不属于系列 |
| `content/posts/no-headings.md` | 无任何标题的短文；标题为 `引号 "与" <尖括号> & 符号` |
| `content/posts/hugo-series-1.md` `-2.md` `-3.md` | `series: ["Hugo 入门"]`，`weight` 分别为 1、2、3，**日期故意倒序**（第 1 篇最新）；每篇至少 2 个二级标题 |
| `content/series/hugo-入门/_index.md` | 系列简介 |

## Review Focus

spec 隐含、但常规断言容易漏掉的五种情况。每条的测试已放进对应任务：

1. **站点没抄必需配置**（没声明 `series`、没开 passthrough、语言是默认 `en`）：构建成功，系列和公式安静地不出现。→ Task 1、6、7。
2. **超宽内容出现在 375px 宽度**（长链接、长行内代码、宽表格、长代码行、大图、长块级公式）：各自在块内滚动或断行，页面不出横向滚动条。→ Task 4、5、6 的浏览器步骤。
3. **文章没有标题、只有一个标题、或写了 `toc: false`**：不渲染目录和悬浮按钮，正文布局不变。→ Task 8。
4. **标题和标签里有特殊字符**（引号、尖括号、`&`、中文和空格的系列名）：HTML 正确转义，搜索索引是合法 JSON，链接可达。→ Task 3、7、9。
5. **站点部署在子路径**（`baseURL = https://example.org/blog/`）：所有链接、样式、脚本、搜索索引地址都带前缀。→ Task 1 的检查，之后每个任务都会重跑。

---

### Task 1: 骨架、示例站点、测试脚手架

**Files:**
- Create: `theme.toml`、`hugo.toml`、`LICENSE`（MIT）、`archetypes/default.md`、`i18n/zh-cn.toml`、`i18n/en.toml`
- Create: `layouts/baseof.html`、`layouts/home.html`、`layouts/page.html`、`layouts/404.html`
- Create: `layouts/_partials/head.html`、`header.html`、`footer.html`
- Create: `exampleSite/hugo.toml` 与“示例站点内容”表中的全部文件（正文此时可以是占位，后续任务补全）
- Create: `tests/run.sh`、`tests/lib.sh`、`tests/fixtures/minimal.toml`、`tests/checks/01-skeleton.sh`
- Modify: `.gitignore`（追加 `tests/.out*`、`exampleSite/public/`、`exampleSite/resources/`、`.hugo_build.lock`、`.DS_Store`）

**Interfaces:**
- Produces: `baseof.html` 定义 `{{ block "main" . }}`，并在 `</body>` 前定义 `{{ block "scripts" . }}`；`head.html` 负责 `<title>`、description、canonical、RSS 链接、Open Graph（Hugo 内置模板）。
- Produces: `tests/lib.sh` 的断言函数，全部作用于 `$OUT`（默认 `tests/.out`）下的相对路径，失败时打印 `FAIL: …` 并置 `FAILED=1`：
  - `exists <file>`
  - `has <file> <固定字符串>` / `hasnt <file> <固定字符串>`
  - `before <file> <字符串A> <字符串B>`：A 首次出现的行号小于 B
- Produces: `tests/run.sh`，从仓库根运行，依次做：
  1. 默认构建：`hugo --source exampleSite --destination "$PWD/tests/.out" --cleanDestinationDir`，退出码非 0 或输出含 `WARN`、`ERROR` 即失败；
  2. 最小配置构建到 `tests/.out-min`：`--config "$PWD/tests/fixtures/minimal.toml"`，只要求退出码 0；
  3. 子路径构建到 `tests/.out-sub`：`--baseURL https://example.org/blog/`；
  4. 依次 `source tests/checks/*.sh`；
  5. 有 `node` 时运行 `node --test tests/js/`（目录不存在则跳过），没有则打印提示并跳过；
  6. `FAILED=1` 时以退出码 1 结束。
- `tests/fixtures/minimal.toml` 只含 `baseURL`、`title`、`theme = "Inkwell"`、`themesDir = "../.."`。

- [ ] **Step 1: 升级并确认 Hugo**

Run: `hugo version`
Expected: 版本号 ≥ `0.146.0`（开发机应为 `0.169.0`）。低于则停下，请使用者执行 `brew upgrade hugo`。

- [ ] **Step 2: 写测试脚手架和失败的检查**

`tests/checks/01-skeleton.sh`：

```bash
exists index.html
has index.html '<html lang="zh-CN" class="no-js"'
has index.html 'class="site-header"'
has index.html 'class="site-footer"'
has index.html '>归档</a>'
has index.html 'rel="alternate" type="application/rss+xml"'
exists posts/long-essay/index.html
has posts/long-essay/index.html '<article class="article"'
exists 404.html
has 404.html '返回首页'

# Review Focus 1：最小配置也能构建，界面回落到英文
OUT=tests/.out-min exists index.html
OUT=tests/.out-min has index.html '<html lang="en"'

# Review Focus 5：子路径部署时不得有不带前缀的站内地址
bad=$(grep -rhoE '(href|src)="/[^"/][^"]*"' tests/.out-sub --include='*.html' | grep -v '="/blog/' || true)
[ -z "$bad" ] || fail "子路径构建中存在未带 /blog/ 前缀的地址: $bad"
```

- [ ] **Step 3: 运行，确认失败**

Run: `bash tests/run.sh`
Expected: 失败，原因是主题和示例站点还不存在。

- [ ] **Step 4: 实现骨架**

按 Files 和 Interfaces 创建文件。`theme.toml` 写 `name = "Inkwell"`、`license = "MIT"`、`min_version = "0.146.0"`。`hugo.toml` 写入“主题 params 默认值”全文。两份 i18n 写齐全部键。`header.html` 渲染站点名和 `menus.main`；窄屏下导航保持单行、溢出时横向滚动，不做汉堡菜单。页头不吸顶。`home.html` 此时只需列出文章标题链接。`footer.html` 渲染版权行、RSS 链接、`params.footer.text`。

- [ ] **Step 5: 运行，确认通过**

Run: `bash tests/run.sh`
Expected: 无 `FAIL`，退出码 0，默认构建无 `WARN`。

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: theme skeleton, example site and build checks"
```

---

### Task 2: 设计令牌、基础样式、明暗切换

**Files:**
- Create: `assets/css/tokens.css`、`assets/css/base.css`
- Create: `assets/js/main.js`、`assets/js/theme.js`
- Create: `layouts/_partials/theme-init.html`、`layouts/_partials/css.html`、`layouts/_partials/js.html`、`layouts/_partials/icon.html`
- Modify: `layouts/_partials/head.html`、`layouts/_partials/header.html`、`layouts/baseof.html`
- Test: `tests/checks/02-theme.sh`

**Interfaces:**
- Produces: `css.html` 按固定顺序合并 `assets/css/` 下的文件（后续任务往列表里追加：`tokens, base, layout, prose, code, components`；文件不存在时跳过），生产环境压缩，加指纹，输出 `<link rel="stylesheet" … integrity>`，目标名 `css/inkwell.css`。
- Produces: `partial "js.html" (dict "src" "js/main.js" "page" .)`：用 `js.Build` 打包（目标 `es2020`），加指纹，输出 `<script type="module" src … integrity>`。
- Produces: `partial "icon.html" "<name>"`：内联 SVG。本任务提供 `sun`、`moon`；后续任务追加 `search`、`list`、`close`、`copy`、`check`、`link` 以及五种提示框图标。
- Produces: `tokens.css` 变量。颜色：`--c-bg`、`--c-bg-subtle`、`--c-text`、`--c-text-muted`、`--c-border`、`--c-accent`、`--c-code-bg`、`--c-mark`；高亮：`--hl-comment`、`--hl-keyword`、`--hl-string`、`--hl-number`、`--hl-func`、`--hl-type`、`--hl-tag`、`--hl-attr`、`--hl-line`；提示框：`--c-note`、`--c-tip`、`--c-important`、`--c-warning`、`--c-caution`；尺寸：`--measure`、`--sidebar`、`--gap`、`--radius`、`--font-sans`、`--font-mono`、`--fs-base`、`--lh-base`。
- Produces: `theme.js` 导出 `initTheme(): void`、`currentTheme(): "light" | "dark"`；`main.js` 调用各模块的 `init*`。

取值（spec 5.1）：浅色 `--c-bg: #ffffff`、`--c-text: #1f2328`、`--c-accent: #1f6feb`、`--c-code-bg: #f6f8fa`；深色写在 `:root[data-theme="dark"]` 下，`--c-bg: #0d1117`，正文柔和浅灰白，强调色更亮的蓝，代码块背景略亮于页面。`--lh-base: 1.8`。其余取值由实现者在素白方向内定。

- [ ] **Step 1: 写失败的检查**

```bash
has index.html 'localStorage.getItem("inkwell-theme")'
has index.html 'data-theme-toggle'
has index.html 'rel="stylesheet"'
has index.html 'integrity="sha'
css=$(ls tests/.out/css/inkwell.*.css 2>/dev/null | head -1)
[ -n "$css" ] || fail "缺少 css/inkwell.<hash>.css"
grep -qF -- '--c-bg' "$css" || fail "CSS 缺少颜色变量"
grep -qF -- '[data-theme="dark"]' "$css" || fail "CSS 缺少深色规则"
ls tests/.out/js/main.*.js >/dev/null 2>&1 || fail "缺少 js/main.<hash>.js"
```

- [ ] **Step 2: 运行，确认失败**

Run: `bash tests/run.sh`　Expected: `02-theme.sh` 的断言失败。

- [ ] **Step 3: 实现**

`theme-init.html` 是 `<head>` 里位于样式表之前的内联脚本：读 `inkwell-theme`，没有则读 `prefers-color-scheme`，设置 `data-theme`，去掉 `no-js`。`theme.js` 处理按钮点击（明暗互切）、写入存储、派发 `inkwell:themechange`。`base.css` 负责重置、`body` 排版、链接、页头、页脚。

- [ ] **Step 4: 运行，确认通过**

Run: `bash tests/run.sh`　Expected: 无 `FAIL`。

- [ ] **Step 5: 浏览器验证**

Run: `hugo server --source exampleSite --port 1313`，打开 `http://localhost:1313/`。
Expected: 点切换按钮后背景变深；刷新后保持深色且加载过程不闪白；清掉存储后跟随系统。

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: design tokens, base styles and dark mode"
```

---

### Task 3: 列表类页面

**Files:**
- Create: `layouts/section.html`、`layouts/taxonomy.html`、`layouts/term.html`、`layouts/archives.html`
- Create: `layouts/_partials/post-list.html`、`layouts/_partials/pager.html`
- Create: `assets/css/layout.css`（本任务只写页面容器和列表部分）
- Modify: `layouts/home.html`、`tests/run.sh`（增加第四种构建）
- Test: `tests/checks/03-lists.sh`

**Interfaces:**
- Produces: `partial "post-list.html" (dict "pages" <Pages> "style" "compact" | "summary")`。紧凑：按年份分组，每篇一行，日期 + 标题。摘要：标题、日期、标签，加 `.Description`，没有则用 `.Summary | plainify` 截断。摘要一律是纯文本。
- Produces: `partial "pager.html" .Paginator`。
- `home.html`：文章集合为 `where site.RegularPages "Type" "in" site.MainSections`，分页；样式取 `site.Params.home.listStyle`；首页内容非空时在列表上方显示。
- `section.html`、`term.html`：紧凑列表，不分页。`taxonomy.html`：所有词条及文章数。`archives.html`：全部文章按年份分组，不分页。
- `tests/run.sh` 增加摘要样式构建到 `tests/.out-summary`：环境变量 `HUGO_PARAMS_HOME_LISTSTYLE=summary`。

- [ ] **Step 1: 写失败的检查**

```bash
has index.html 'post-list post-list--compact'
has index.html 'class="post-year"'
exists page/2/index.html
has index.html 'class="pager"'
exists tags/index.html
has tags/index.html 'Markdown'
exists tags/markdown/index.html
exists archives/index.html
has archives/index.html 'class="post-year"'
has archives/index.html 'hugo-series-3/'
OUT=tests/.out-summary has index.html 'post-list post-list--summary'

# Review Focus 4：特殊字符标题在列表里正确转义
has archives/index.html '引号 &#34;与&#34; &lt;尖括号&gt; &amp; 符号'
```

- [ ] **Step 2: 运行，确认失败**

Run: `bash tests/run.sh`　Expected: `03-lists.sh` 的断言失败。

- [ ] **Step 3: 实现**（按 Interfaces）

- [ ] **Step 4: 运行，确认通过**

Run: `bash tests/run.sh`　Expected: 无 `FAIL`。若最后一条因 Hugo 的引号转义写法不同而失败（例如 `&quot;`），以实际的合法转义为准修正断言，但 `<` 和 `&` 必须被转义。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: home, section, tags and archive lists"
```

---

### Task 4: 正文排版与渲染钩子

**Files:**
- Create: `layouts/_markup/render-heading.html`、`render-link.html`、`render-image.html`、`render-table.html`、`render-blockquote.html`
- Create: `assets/css/prose.css`、`assets/js/lightbox.js`
- Modify: `assets/js/main.js`、`layouts/_partials/icon.html`、`exampleSite/content/posts/markdown-style-test.md`、`exampleSite/content/posts/photo-notes/index.md`
- Test: `tests/checks/04-prose.sh`

**Interfaces:**
- Consumes: 共享约定中的正文钩子类名；`tokens.css` 变量。
- Produces: `lightbox.js` 导出 `initLightbox(): void`：点击 `img[data-zoomable]` 用 `dialog.lightbox` 放大，点击或 Esc 关闭。
- `render-link.html`：外链且 `params.article.externalLinkNewTab` 为真时输出 `rel="noopener" target="_blank"`（属性顺序固定）。
- `render-image.html`：`figure.figure`，`img` 带 `loading="lazy"`、`data-zoomable`；有 `title` 时输出 `<figcaption>`。页面资源图片用资源的 `.RelPermalink`。
- `render-blockquote.html`：`.Type` 为 `alert` 时输出 `blockquote.alert.alert-{{ .AlertType }}`，标题用 `.AlertTitle`，否则用 `i18n .AlertType`；未知类型按 `note` 的样式处理。
- `prose.css`（spec 5.5）：只作用于 `.prose`。段间距大于行间距；左对齐；`line-break: strict`；`overflow-wrap: anywhere`；`text-autospace` 和 `text-spacing-trim` 作为渐进增强；标题 `scroll-margin-top`；任务列表、脚注、分隔线、`kbd`、`mark`、`details`、定义列表都要有样式。

`markdown-style-test.md` 必须包含：二到六级标题、长段落、三层嵌套列表、任务列表、普通引用、五种提示框（其中一个写成 `> [!TIP] 自定义标题`）、一张 8 列的宽表格、一个 120 字符以上不含空格的长链接、一张带 `title` 的图片、脚注、`<kbd>`、`<mark>`、`<details>`、定义列表、一个外链。

- [ ] **Step 1: 写失败的检查**

```bash
P=posts/markdown-style-test/index.html
has $P 'class="heading-anchor"'
has $P '<div class="table-wrap">'
has $P 'class="alert alert-note"'
has $P 'class="alert alert-warning"'
has $P 'class="alert-title"'
has $P '自定义标题'
has $P '<figcaption>'
has $P 'data-zoomable'
has $P 'loading="lazy"'
has $P 'rel="noopener" target="_blank"'
has $P 'type="checkbox"'
has $P 'class="footnotes"'
has $P '<kbd>'
has $P '<details>'
has posts/photo-notes/index.html 'data-zoomable'
```

- [ ] **Step 2: 运行，确认失败**

Run: `bash tests/run.sh`　Expected: `04-prose.sh` 的断言失败。

- [ ] **Step 3: 实现**（按 Interfaces）

- [ ] **Step 4: 运行，确认通过**

Run: `bash tests/run.sh`　Expected: 无 `FAIL`。

- [ ] **Step 5: 浏览器验证（Review Focus 2）**

打开 `http://localhost:1313/posts/markdown-style-test/`，视口宽 375，明暗各一次。在控制台执行：

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth
```

Expected: `true`。宽表格在 `.table-wrap` 内横向滚动；长链接自动断行；点图片能放大并用 Esc 关闭。

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: prose typography and markdown render hooks"
```

---

### Task 5: 代码块

**Files:**
- Create: `layouts/_markup/render-codeblock.html`、`assets/css/code.css`、`assets/js/code-copy.js`
- Modify: `assets/js/main.js`、`layouts/_partials/icon.html`、`exampleSite/content/posts/markdown-style-test.md`
- Test: `tests/checks/05-code.sh`

**Interfaces:**
- `render-codeblock.html`：输出 `div.code-block`，头部显示语言名和复制按钮，正文用 `transform.Highlight .Inner .Type (merge .Options (dict "noClasses" false))`，这样不依赖站点的 `markup.highlight` 配置。没有语言时语言名留空、按纯文本渲染。
- `code.css`：Chroma 的类（`.c*` 注释、`.k*` 关键字、`.s*` 字符串、`.m*` 数字、`.nf` 函数、`.kt`/`.nc` 类型、`.nt` 标签、`.na` 属性、`.hl` 高亮行、`.ln`/`.lnt` 行号）映射到 `--hl-*` 变量，不引入生成的 Chroma 样式文件。块内 `overflow-x: auto`。行内代码用 `--c-code-bg`。
- Produces: `code-copy.js` 导出 `initCodeCopy(): void`：点击 `[data-code-copy]` 复制同一 `.code-block` 内的代码文本（不含行号），按钮文字短暂变为 `i18n "copied"`（文字通过按钮上的 `data-copied-label` 传入）。

`markdown-style-test.md` 追加：一个 `go` 代码块；一个带 `{linenos=true, hl_lines=[2]}` 的代码块；一个无语言的代码块；一个含 200 字符长行的代码块；一段含行内代码的文字。

- [ ] **Step 1: 写失败的检查**

```bash
P=posts/markdown-style-test/index.html
has $P 'class="code-block"'
has $P '<span class="code-lang">go</span>'
has $P 'data-code-copy'
has $P 'class="chroma"'
has $P 'class="line hl"'
has $P 'class="lnt"'
hasnt $P 'style="color:'
OUT=tests/.out-min hasnt posts/markdown-style-test/index.html 'style="color:'
```

- [ ] **Step 2: 运行，确认失败**

Run: `bash tests/run.sh`　Expected: `05-code.sh` 的断言失败。

- [ ] **Step 3: 实现**（按 Interfaces）

- [ ] **Step 4: 运行，确认通过**

Run: `bash tests/run.sh`　Expected: 无 `FAIL`。若 `line hl`、`lnt` 与 Hugo 0.169 实际输出的类名不同，以实际输出为准修正断言和 `code.css`。

- [ ] **Step 5: 浏览器验证（Review Focus 2）**

同一页面，宽 375 与 1440，明暗各一次。Expected: 长代码行在块内横向滚动，页面无横向滚动条（执行 Task 4 的表达式得 `true`）；复制按钮可用；深色下高亮颜色随之切换。

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: code blocks with highlighting and copy button"
```

---

### Task 6: 公式与 Mermaid

**Files:**
- Create: `layouts/_markup/render-passthrough.html`、`layouts/_markup/render-codeblock-mermaid.html`、`assets/js/mermaid.js`
- Modify: `layouts/_partials/head.html`、`layouts/baseof.html`、`assets/css/prose.css`、`exampleSite/content/posts/math-and-diagrams.md`、`exampleSite/content/posts/markdown-style-test.md`
- Test: `tests/checks/06-math-mermaid.sh`

**Interfaces:**
- `render-passthrough.html`：`params.math.enable` 为真时用 `transform.ToMath .Inner (dict "output" "htmlAndMathml" "displayMode" (eq .Type "block") "throwOnError" false)` 渲染，块级包一层 `div.math-display`（`overflow-x: auto`），并 `.Page.Store.Set "hasMath" true`；为假时原样输出 `.Inner`。
- `head.html`：先 `{{ $noop := .WordCount }}` 强制渲染正文，再在 `.Page.Store.Get "hasMath"` 为真时输出 `params.math.css` 的 `<link>`（带 `cssIntegrity` 和 `crossorigin="anonymous"`）。
- `render-codeblock-mermaid.html`：输出 `<pre class="mermaid" data-source="…">`（内容 HTML 转义），并 `.Page.Store.Set "hasMermaid" true`。
- `baseof.html`：`hasMermaid` 为真时在 `</body>` 前用 `js.html` 引入 `js/mermaid.js`，并通过 `<script>` 标签上的 `data-mermaid-url` 传入 `params.mermaid.url`。
- `mermaid.js`：动态 `import()` 该地址；按 `data-theme` 选 `default` 或 `dark` 主题渲染；监听 `inkwell:themechange`，用 `data-source` 还原后重渲染。加载失败时保留源码文本可读。

`math-and-diagrams.md`：行内公式 `\(…\)`、块级 `$$…$$`、一条很长的块级公式、一个流程图和一个时序图。`markdown-style-test.md` 追加一条行内公式和一个小流程图。

- [ ] **Step 1: 写失败的检查**

```bash
M=posts/math-and-diagrams/index.html
has $M 'class="katex"'
has $M 'class="math-display"'
has $M 'katex.min.css'
has $M '<pre class="mermaid"'
has $M 'js/mermaid.'
# spec 验收 7：只出现在用到的页面
hasnt posts/long-essay/index.html 'katex.min.css'
hasnt posts/long-essay/index.html 'js/mermaid.'
hasnt index.html 'katex.min.css'
OUT=tests/.out-summary hasnt index.html 'class="katex"'
# Review Focus 1：没开 passthrough 时公式页照常生成
OUT=tests/.out-min exists posts/math-and-diagrams/index.html
OUT=tests/.out-min hasnt posts/math-and-diagrams/index.html 'katex.min.css'
```

- [ ] **Step 2: 运行，确认失败**

Run: `bash tests/run.sh`　Expected: `06-math-mermaid.sh` 的断言失败。

- [ ] **Step 3: 实现**（按 Interfaces）

- [ ] **Step 4: 运行，确认通过**

Run: `bash tests/run.sh`　Expected: 无 `FAIL`，默认构建无 `WARN`。

- [ ] **Step 5: 浏览器验证（Review Focus 2）**

打开 `http://localhost:1313/posts/math-and-diagrams/`，宽 375 与 1440。Expected: 公式排版正确；长公式在 `.math-display` 内滚动，页面无横向滚动条；两张图表渲染成功；切换明暗后图表配色随之变化。

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: build-time math and lazy mermaid diagrams"
```

---

### Task 7: 系列

**Files:**
- Create: `layouts/_partials/funcs/series.html`、`layouts/_partials/post-nav.html`
- Create: `layouts/series/taxonomy.html`、`layouts/series/term.html`
- Modify: `layouts/page.html`、`assets/css/layout.css`
- Test: `tests/checks/07-series.sh`

**Interfaces:**
- Produces: `partial "funcs/series.html" <Page>`，用 `return` 返回：
  - 页面没有系列、或站点没声明 `series` 分类法时返回 `false`；
  - 否则返回 `dict "term" <Page> "pages" <Pages> "index" <int，从 1 起> "total" <int> "prev" <Page 或 nil> "next" <Page 或 nil>`。
  - 只取页面的第一个系列。排序：系列内任一文章 `.Weight` 不为 0 时用 `.ByWeight`，否则用 `.ByDate`（升序）。
- Produces: `partial "post-nav.html" .`：系列文章用上面的 `prev`/`next`；非系列文章用 `.PrevInSection`/`.NextInSection`。两者都没有时不输出 `.post-nav`。
- `series/taxonomy.html`：每个系列的名称、简介（词条页内容）、`i18n "postCount"`。`series/term.html`：按上述排序的有序列表（`<ol>`）。

- [ ] **Step 1: 写失败的检查**

```bash
exists series/index.html
has series/index.html 'Hugo 入门'
has series/index.html '3 篇'
T='series/hugo-入门/index.html'
exists "$T"
# weight 生效：日期倒序，但按 weight 排
before "$T" 'hugo-series-1/' 'hugo-series-2/'
before "$T" 'hugo-series-2/' 'hugo-series-3/'
# 无 weight 时按日期升序
D='series/主题演示/index.html'
before "$D" 'markdown-style-test/' 'math-and-diagrams/'
S2=posts/hugo-series-2/index.html
has $S2 'class="post-nav"'
has $S2 'hugo-series-1/'
has $S2 'hugo-series-3/'
has posts/long-essay/index.html 'class="post-nav"'
# Review Focus 1：没声明 series 分类法时不生成系列页，文章页照常生成
[ ! -d tests/.out-min/series ] || fail "最小配置下不应生成 series 目录"
OUT=tests/.out-min exists posts/hugo-series-2/index.html
```

- [ ] **Step 2: 运行，确认失败**

Run: `bash tests/run.sh`　Expected: `07-series.sh` 的断言失败。

- [ ] **Step 3: 实现**（按 Interfaces）

- [ ] **Step 4: 运行，确认通过**

Run: `bash tests/run.sh`　Expected: 无 `FAIL`。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: series taxonomy pages and post navigation"
```

---

### Task 8: 文章页三档布局、目录、抽屉

**Files:**
- Create: `layouts/_partials/funcs/has-toc.html`、`layouts/_partials/post-meta.html`、`layouts/_partials/drawer.html`
- Create: `assets/css/components.css`、`assets/js/toc.js`、`assets/js/drawer.js`
- Modify: `layouts/page.html`、`assets/css/layout.css`、`assets/js/main.js`、`layouts/_partials/icon.html`
- Test: `tests/checks/08-article.sh`

**Interfaces:**
- Consumes: `funcs/series.html`（Task 7）；共享约定中的文章和抽屉类名、断点表。
- Produces: `partial "funcs/has-toc.html" <Page>` 返回布尔值：front matter `toc` 不为 `false`，且 `.TableOfContents` 里的目录链接数 ≥ 2。
- Produces: `partial "post-meta.html" .`：发布日期；更新日期（`.Lastmod` 与 `.Date` 不同日才显示）；`i18n "words"` 与 `i18n "readingTime"`（受 `params.article.showWordCount`、`showReadingTime` 控制）；标签链接。
- Produces: `partial "drawer.html" (dict "page" . "series" <funcs/series 的返回值> "hasToc" <bool>)`：既无目录也无系列时什么都不输出（包括悬浮按钮）；只有一种时不输出 `.drawer-tabs`。系列面板列出全部篇目，当前篇标 `is-current` 和 `aria-current="page"`，面板顶部显示 `i18n "seriesPosition"`。
- Produces: `toc.js` 导出 `initToc(): void`：`IntersectionObserver` 跟随滚动，给 `.toc a` 加 `is-active`。`drawer.js` 导出 `initDrawer(): void`：悬浮按钮开关 `html[data-drawer]`；页签切换 `#drawer[data-active]`；点目录项、点遮罩、按 Esc 关闭。
- CSS 行为（`layout.css` 放网格，`components.css` 放抽屉、悬浮按钮、目录、系列导航的外观）：
  - 大屏：`.drawer { display: contents }`，系列面板在第 1 列、正文第 2 列、目录面板第 3 列；两个面板 `position: sticky`、超高时自身滚动；页签、悬浮按钮、遮罩隐藏。
  - 中等：正文 + 目录面板整体居中；系列面板变成底部抽屉；悬浮按钮只在 `.has-series` 时显示。
  - 窄屏：整个 `.drawer` 是底部抽屉；悬浮按钮在 `.has-toc` 或 `.has-series` 时显示。
  - `.no-js`：窄屏下 `.drawer` 回到文档流并排在 `.prose` 之前，悬浮按钮隐藏。
  - 任何一档 `.prose` 的宽度都是 `min(100%, var(--measure))`，不因侧栏变窄。

- [ ] **Step 1: 写失败的检查**

```bash
S2=posts/hugo-series-2/index.html
has $S2 'class="article-layout has-toc has-series"'
has $S2 'id="drawer"'
has $S2 'data-panel="toc"'
has $S2 'data-panel="series"'
has $S2 'data-drawer-tab="series"'
has $S2 'data-drawer-toggle'
has $S2 'aria-current="page"'
has $S2 '第 2 / 3 篇'
L=posts/long-essay/index.html
has $L 'class="article-layout has-toc"'
has $L 'data-panel="toc"'
hasnt $L 'data-panel="series"'
hasnt $L 'data-drawer-tab'
has $L 'class="article-meta"'
# Review Focus 3：无标题、toc: false
N=posts/no-headings/index.html
has $N 'class="article-layout"'
hasnt $N 'id="drawer"'
hasnt $N 'data-drawer-toggle'
has $N '&lt;尖括号&gt;'
hasnt about/index.html 'data-panel="toc"'
```

- [ ] **Step 2: 运行，确认失败**

Run: `bash tests/run.sh`　Expected: `08-article.sh` 的断言失败。

- [ ] **Step 3: 实现**（按 Interfaces）

- [ ] **Step 4: 运行，确认通过**

Run: `bash tests/run.sh`　Expected: 无 `FAIL`。

- [ ] **Step 5: 浏览器验证四种宽度**

对 `/posts/hugo-series-2/`（系列）和 `/posts/long-essay/`（非系列），在 375、768、1024、1440 下分别执行：

```js
const r = document.querySelector('.prose').getBoundingClientRect();
({
  fab: getComputedStyle(document.querySelector('.fab')).display,
  proseWidth: Math.round(r.width),
  centerOffset: Math.round((r.left + r.right) / 2 - innerWidth / 2),
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
})
```

Expected:

| 宽度 | 系列文章 `fab` | 非系列文章 `fab` | `proseWidth` | `centerOffset` | `overflow` |
|---|---|---|---|---|---|
| 375 | 非 `none` | 非 `none` | 视口宽减左右留白 | 0 | `false` |
| 768 | 非 `none` | 非 `none` | 640（16px × 40） | 0 | `false` |
| 1024 | 非 `none` | `none` | 680（17px × 40） | 负数（正文偏左） | `false` |
| 1440 | `none` | `none` | 680 | 绝对值 ≤ 2 | `false` |

另外手动确认：滚动时目录高亮跟随；窄屏点悬浮按钮弹出抽屉，页签可切换，点目录项跳转后抽屉收起且标题不被遮挡；浏览器禁用 JavaScript 后目录显示在正文之前。

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: responsive article layout with toc and drawer"
```

---

### Task 9: 搜索

**Files:**
- Create: `assets/js/search-core.js`、`assets/js/search.js`
- Create: `layouts/_partials/search-index.html`、`layouts/_partials/search-dialog.html`
- Modify: `layouts/_partials/header.html`、`layouts/baseof.html`、`assets/css/components.css`、`layouts/_partials/icon.html`
- Test: `tests/js/search-core.test.js`、`tests/js/search-index.test.js`、`tests/checks/09-search.sh`

**Interfaces:**
- Produces: `partial "search-index.html" .` 返回索引的相对地址。用 `resources.FromString "search-index.json"` 生成（不依赖站点的 `outputs` 配置），不加指纹。内容是数组，元素为 `{ "title": string, "url": string, "date": "YYYY-MM-DD", "tags": string[], "content": string }`，范围与首页文章集合相同，`content` 取 `.Plain`。
- `search-dialog.html` 与页头的搜索按钮只在 `params.search.enable` 为真时输出；`search.js` 也只在此时引入。
- Produces: `search-core.js` 的纯函数（不碰 DOM）：
  - `tokenize(query: string): string[]`：转小写，按空白拆分，去掉空串。
  - `search(index: Entry[], query: string, limit = 20): { entry: Entry, score: number }[]`：每个关键词都必须出现在标题、标签或正文中（不区分大小写）；每个关键词在标题命中 +10、标签命中 +5、正文命中 +1；按分数降序，同分按日期降序；空查询返回 `[]`。
  - `snippet(text: string, tokens: string[], radius = 40): string`：以第一个命中位置为中心取前后各 `radius` 个字符，被截断的一侧加 `…`；没有命中时取开头 `2 * radius` 个字符。
  - `highlight(text: string, tokens: string[]): string`：先做 HTML 转义，再把命中处包进 `<mark>`，保留原文大小写。
- `search.js`：点 `[data-search-open]` 或按 `/`（焦点不在输入框时）打开弹窗；首次打开才 `fetch` `data-index`；输入时渲染 `#search-results`（标题、日期、高亮片段）；无结果显示 `i18n "searchEmpty"`（文字通过 `data-empty-label` 传入）。窄屏下弹窗占满屏幕。

- [ ] **Step 1: 写失败的测试**

`tests/js/search-core.test.js`：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenize, search, snippet, highlight } from '../../assets/js/search-core.js';

const idx = [
  { title: 'Hugo 入门', url: '/a/', date: '2026-01-02', tags: ['hugo'], content: '模板与渲染钩子' },
  { title: '随笔', url: '/b/', date: '2026-03-01', tags: [], content: '今天读了 Hugo 的文档' },
  { title: '无关', url: '/c/', date: '2026-02-01', tags: [], content: '别的内容' },
];
const urls = (q) => search(idx, q).map((r) => r.entry.url);

test('tokenize', () => assert.deepEqual(tokenize('  Hugo  主题 '), ['hugo', '主题']));
test('标题命中排在正文命中前', () => assert.deepEqual(urls('hugo'), ['/a/', '/b/']));
test('多个关键词必须全部命中', () => assert.deepEqual(urls('hugo 文档'), ['/b/']));
test('不区分大小写', () => assert.equal(urls('HUGO').length, 2));
test('空查询', () => assert.deepEqual(urls('   '), []));
test('snippet 两侧截断', () => assert.equal(snippet('一二三四五六七八九十', ['五'], 2), '…三四五六七…'));
test('highlight 先转义再标记', () =>
  assert.equal(highlight('a<b> Hugo', ['hugo']), 'a&lt;b&gt; <mark>Hugo</mark>'));
```

`tests/js/search-index.test.js`（Review Focus 4）：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('搜索索引是合法 JSON，特殊字符标题原样保留', () => {
  const data = JSON.parse(readFileSync('tests/.out/search-index.json', 'utf8'));
  assert.ok(data.length >= 8);
  assert.ok(data.some((e) => e.title === '引号 "与" <尖括号> & 符号'));
  for (const e of data) assert.match(e.date, /^\d{4}-\d{2}-\d{2}$/);
});
```

`tests/checks/09-search.sh`：

```bash
exists search-index.json
has index.html 'id="search-dialog"'
has index.html 'data-index="/search-index.json"'
has index.html 'data-search-open'
has index.html 'js/search.'
OUT=tests/.out-sub has index.html 'data-index="/blog/search-index.json"'
# 搜索默认关闭
OUT=tests/.out-min hasnt index.html 'search-dialog'
OUT=tests/.out-min hasnt index.html 'js/search.'
```

- [ ] **Step 2: 运行，确认失败**

Run: `bash tests/run.sh`　Expected: shell 断言失败；`node --test` 报找不到 `search-core.js`。

- [ ] **Step 3: 实现**（按 Interfaces）

- [ ] **Step 4: 运行，确认通过**

Run: `bash tests/run.sh`　Expected: 无 `FAIL`，`node --test` 全部通过。

- [ ] **Step 5: 浏览器验证**

Expected: 按 `/` 打开弹窗；搜“钩子”和“hugo”都有结果且关键词高亮；点结果跳转；Esc 关闭；宽 375 时弹窗占满屏幕。

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: client-side search with build-time json index"
```

---

### Task 10: 评论

**Files:**
- Create: `layouts/_partials/comments.html`、`assets/js/comments.js`、`tests/fixtures/comments.toml`
- Modify: `layouts/page.html`、`assets/css/components.css`、`tests/run.sh`（增加第五种构建）
- Test: `tests/checks/10-comments.sh`

**Interfaces:**
- `comments.html`：`params.comments.giscus.repo` 非空、且页面 front matter `comments` 不为 `false` 时，输出 `section.comments[data-giscus]`（属性见共享约定，`data-lang` 取站点语言）并引入 `js/comments.js`；否则什么都不输出。
- `comments.js`：`IntersectionObserver`（`rootMargin: "400px"`）在评论区接近视口时注入 `https://giscus.app/client.js`，初始主题取 `data-theme`；监听 `inkwell:themechange`，向 `iframe.giscus-frame` 发送 `{ giscus: { setConfig: { theme } } }`，目标源 `https://giscus.app`。
- `tests/fixtures/comments.toml`：`[params.comments.giscus]` 下 `repo = "owner/repo"`、`repoId = "R_x"`、`category = "General"`、`categoryId = "DIC_x"`。
- `tests/run.sh` 增加评论构建到 `tests/.out-comments`：`--config "hugo.toml,$PWD/tests/fixtures/comments.toml"`。

- [ ] **Step 1: 写失败的检查**

```bash
L=posts/long-essay/index.html
OUT=tests/.out-comments has $L 'data-giscus'
OUT=tests/.out-comments has $L 'data-repo="owner/repo"'
OUT=tests/.out-comments has $L 'js/comments.'
OUT=tests/.out-comments hasnt about/index.html 'data-giscus'
OUT=tests/.out-comments hasnt index.html 'js/comments.'
# 默认关闭
hasnt $L 'data-giscus'
hasnt $L 'js/comments.'
```

- [ ] **Step 2: 运行，确认失败**

Run: `bash tests/run.sh`　Expected: `10-comments.sh` 的断言失败。

- [ ] **Step 3: 实现**（按 Interfaces）

- [ ] **Step 4: 运行，确认通过**

Run: `bash tests/run.sh`　Expected: 无 `FAIL`。

- [ ] **Step 5: 浏览器验证（占位参数，spec 5.8）**

用评论配置启动：`hugo server --source exampleSite --config "hugo.toml,$PWD/tests/fixtures/comments.toml" --port 1313`，打开 `/posts/long-essay/`。
Expected: 页面顶部时网络请求里没有 `giscus.app/client.js`；滚到文末后出现该请求。占位仓库下评论框本身报错属预期，不做真实评论的端到端验证。

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: lazy giscus comments"
```

---

### Task 11: 文档、示例内容补全、全量验收

**Files:**
- Create: `README.md`、`images/screenshot.png`、`images/tn.png`
- Modify: `exampleSite/content/**`（把占位正文补成可读的真实内容）

**Interfaces:**
- Consumes: 前面所有任务的产物。

- [ ] **Step 1: 补全示例内容**

`long-essay.md` 写满两千字以上的中文随笔；系列三篇写成连贯的 Hugo 入门短文；`photo-notes` 每张图配图注；`_index.md` 写一段站点简介。

- [ ] **Step 2: 写 README（中文为主）**

章节：简介与截图；要求（Hugo ≥ 0.146.0）；安装；“必须复制的站点配置”（共享约定里的整段，逐项说明缺了哪一项会少哪个功能）；全部 `params` 逐项说明；front matter 字段（`toc`、`comments`、`series`、`weight`、`description`）；Markdown 写法示例（提示框、公式定界符、Mermaid、图注）；如何用 CSS 变量覆盖样式；本地运行示例站点（`hugo server --source exampleSite`，并说明仓库目录名需为 `Inkwell`）；运行测试（`bash tests/run.sh`）；已知限制（搜索为关键词包含匹配；关 JS 时固定浅色；较旧 Hugo 内置的 KaTeX 版本可能与样式表版本不同；评论未做真实端到端验证）。

- [ ] **Step 3: 全量自动检查**

Run: `bash tests/run.sh`
Expected: 无 `FAIL`，默认构建无 `WARN`、`ERROR`，`node --test` 全部通过。

- [ ] **Step 4: 全量浏览器验收（spec 第 6 节）**

宽度 375、768、1024、1440，明、暗两种模式，逐页打开：首页（紧凑；再用 `HUGO_PARAMS_HOME_LISTSTYLE=summary` 启动看摘要）、`/posts/hugo-series-2/`、`/posts/long-essay/`、`/posts/markdown-style-test/`、`/posts/math-and-diagrams/`、`/posts/photo-notes/`、`/tags/`、`/archives/`、`/series/`、`/series/hugo-入门/`、一个不存在的地址（404）。
每一页执行 `document.documentElement.scrollWidth <= document.documentElement.clientWidth`，Expected: 全部为 `true`。
再确认：明暗切换无闪烁且刷新后保持；禁用 JavaScript 后文章可读、导航可用。发现的问题回到对应任务的文件里修，修完重跑 Step 3。

- [ ] **Step 5: 截图**

在 1440 宽、浅色下截取 `/posts/markdown-style-test/` 存为 `images/screenshot.png`（1500×1000）和 `images/tn.png`（900×600）。停止预览服务。

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "docs: readme, example content and screenshots"
```
