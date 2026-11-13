# tests/checks/07-series.sh — Task 7 系列与文章导航（由 tests/run.sh source）

# 系列总览：名称、简介、篇数
exists series/index.html
has series/index.html 'Hugo 入门'
has series/index.html '3 篇'
has series/index.html '系列简介：三篇短文'
has series/index.html 'href="/series/hugo-%E5%85%A5%E9%97%A8/"'

# 系列词条页：有序列表；weight 生效（日期倒序，但按 weight 排）
T='series/hugo-入门/index.html'
exists "$T"
has "$T" '<ol class="series-list">'
before "$T" 'hugo-series-1/' 'hugo-series-2/'
before "$T" 'hugo-series-2/' 'hugo-series-3/'
# 无 weight 时按日期升序
D='series/主题演示/index.html'
exists "$D"
before "$D" 'markdown-style-test/' 'math-and-diagrams/'

# 系列文章：prev = 系列里更早的一篇，next = 更晚的一篇
S1=posts/hugo-series-1/index.html
S2=posts/hugo-series-2/index.html
S3=posts/hugo-series-3/index.html
has $S2 'class="post-nav"'
has $S2 'hugo-series-1/'
has $S2 'hugo-series-3/'
has $S2 'class="post-nav-prev"'
has $S2 'class="post-nav-next"'
before $S2 'class="post-nav-prev"' 'class="post-nav-next"'
hasnt $S1 'class="post-nav-prev"'
has $S1 'class="post-nav-next"'
has $S3 'class="post-nav-prev"'
hasnt $S3 'class="post-nav-next"'
# prev 链接指向系列第 1 篇，next 指向第 3 篇（取各自 <a> 所在行）
grep -F 'post-nav-prev' "$OUT/$S2" | grep -qF 'hugo-series-1/' || fail "$S2：prev 应指向 hugo-series-1/"
grep -F 'post-nav-next' "$OUT/$S2" | grep -qF 'hugo-series-3/' || fail "$S2：next 应指向 hugo-series-3/"

# 非系列文章：按时间 prev = 更早、next = 更晚
# 日期：no-headings 2025-12-30 < photo-notes 2026-01-25 < long-essay 2026-02-18 < markdown-style-test 2026-03-20
L=posts/long-essay/index.html
has $L 'class="post-nav"'
grep -F 'post-nav-prev' "$OUT/$L" | grep -qF 'photo-notes/' || fail "$L：prev 应指向更早的 photo-notes/"
grep -F 'post-nav-next' "$OUT/$L" | grep -qF 'markdown-style-test/' || fail "$L：next 应指向更晚的 markdown-style-test/"
hasnt posts/no-headings/index.html 'class="post-nav-prev"'
has posts/no-headings/index.html 'class="post-nav-next"'
# 导航在正文之后
before $L 'class="prose"' 'class="post-nav"'

# 独立页面（关于、归档）不是文章，不输出文章导航
hasnt about/index.html 'class="post-nav"'
hasnt archives/index.html 'class="post-nav"'
OUT=tests/.out-min hasnt about/index.html 'class="post-nav"'

# 标签页不受影响
has tags/index.html 'class="term-list"'
hasnt tags/index.html 'series-list'
has tags/markdown/index.html 'post-list post-list--compact'

# 子路径：系列链接带前缀
OUT=tests/.out-sub has series/index.html 'href="/blog/series/hugo-%E5%85%A5%E9%97%A8/"'
OUT=tests/.out-sub has series/hugo-入门/index.html 'href="/blog/posts/hugo-series-1/"'

# Review Focus 1：没声明 series 分类法时不生成系列页，文章页照常生成
[ ! -d tests/.out-min/series ] || fail "最小配置下不应生成 series 目录"
OUT=tests/.out-min exists posts/hugo-series-2/index.html
OUT=tests/.out-min hasnt posts/hugo-series-2/index.html 'class="series-nav"'
