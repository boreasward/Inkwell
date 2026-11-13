# tests/checks/01-skeleton.sh — Task 1 骨架检查（由 tests/run.sh source）

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
bad=$(grep -rhoE '(href|src)="/([^"/][^"]*)?"' tests/.out-sub --include='*.html' | grep -v '="/blog/' || true)
[ -z "$bad" ] || fail "子路径构建中存在未带 /blog/ 前缀的地址: $bad"

# 404 页面标题走 i18n，不是 Hugo 的英文默认
has 404.html '<title>页面不存在'
OUT=tests/.out-min has 404.html '<title>Page not found'
