# tests/checks/08-article.sh — Task 8 文章页布局、目录、抽屉（由 tests/run.sh source）

# 系列文章：有目录也有系列，两个页签
S2=posts/hugo-series-2/index.html
has $S2 'class="article-layout has-toc has-series"'
has $S2 'id="drawer"'
has $S2 'data-active="toc"'
has $S2 'data-panel="toc"'
has $S2 'data-panel="series"'
has $S2 'data-drawer-tab="series"'
has $S2 'data-drawer-toggle'
has $S2 'aria-controls="drawer"'
has $S2 'aria-current="page"'
has $S2 'class="is-current"'
has $S2 '第 2 / 3 篇'
# 无 JavaScript 时目录排在正文之前
before $S2 'id="drawer"' 'class="prose"'

# 非系列文章：只有目录，不输出页签
L=posts/long-essay/index.html
has $L 'class="article-layout has-toc"'
has $L 'data-panel="toc"'
hasnt $L 'data-panel="series"'
hasnt $L 'data-drawer-tab'
has $L 'class="article-meta"'
has $L '<time datetime="2026-02-18">'
has $L 'class="article-words"'
has $L 'href="/tags/%E9%9A%8F%E7%AC%94/"'

# Review Focus 3：无标题、toc: false
N=posts/no-headings/index.html
has $N 'class="article-layout"'
hasnt $N 'id="drawer"'
hasnt $N 'data-drawer-toggle'
has $N '&lt;尖括号&gt;'
hasnt about/index.html 'data-panel="toc"'
hasnt about/index.html 'id="drawer"'

# 子路径：系列面板与标签链接带前缀
OUT=tests/.out-sub has $S2 'href="/blog/posts/hugo-series-1/"'
OUT=tests/.out-sub has $L 'href="/blog/tags/%E9%9A%8F%E7%AC%94/"'
# 最小配置（无 series 分类法）：只有目录，没有系列面板
OUT=tests/.out-min has $S2 'class="article-layout has-toc"'
OUT=tests/.out-min hasnt $S2 'data-panel="series"'

CSS=$(ls "$OUT"/css/inkwell.*.css 2>/dev/null | head -n1)
if [ -z "$CSS" ]; then
  fail "08-article：找不到 css/inkwell.*.css"
else
  grep -qF '.drawer' "$CSS" || fail "08-article：CSS 里没有 .drawer 规则"
  grep -qF '.fab' "$CSS" || fail "08-article：CSS 里没有 .fab 规则"
fi
JS=$(ls "$OUT"/js/main.*.js 2>/dev/null | head -n1)
if [ -z "$JS" ]; then
  fail "08-article：找不到 js/main.*.js"
else
  grep -qF 'data-drawer-toggle' "$JS" || fail "08-article：main.js 里没有 data-drawer-toggle"
  grep -qF 'IntersectionObserver' "$JS" || fail "08-article：main.js 里没有 IntersectionObserver"
fi
