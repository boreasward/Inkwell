# tests/checks/04-prose.sh — Task 4 正文排版与渲染钩子（由 tests/run.sh source）
P=posts/markdown-style-test/index.html

# 标题锚点
has $P 'class="heading-anchor"'
has $P 'href="#'
# 表格
has $P '<div class="table-wrap">'
# 提示框：五种类型、自定义标题、类型名走 i18n
has $P 'class="alert alert-note"'
has $P 'class="alert alert-tip"'
has $P 'class="alert alert-important"'
has $P 'class="alert alert-warning"'
has $P 'class="alert alert-caution"'
has $P 'class="alert-title"'
has $P '自定义标题'
has $P '提示'
has $P '注意'
# 图片
has $P '<figure class="figure">'
has $P '<figcaption>'
has $P 'data-zoomable'
has $P 'loading="lazy"'
# 外链
has $P 'rel="noopener" target="_blank"'
# 其他元素
has $P 'type="checkbox"'
has $P 'class="footnotes"'
has $P '<kbd>'
has $P '<mark>'
has $P '<details>'
has $P '<dl>'
has $P '<h6'

# 页面包里的图片用资源地址，且不会产生无效嵌套（figure 不在 p 里）
has posts/photo-notes/index.html 'data-zoomable'
has posts/photo-notes/index.html '<figure class="figure">'
has posts/photo-notes/index.html 'src="/posts/photo-notes/1.svg"'
hasnt $P '<p><figure'

# 子路径：站内图片地址带前缀，heading 锚点只用片段
OUT=tests/.out-sub has $P 'src="/blog/images/'
OUT=tests/.out-sub has posts/photo-notes/index.html 'src="/blog/posts/photo-notes/1.svg"'
OUT=tests/.out-sub hasnt $P 'href="/blog/#'

# 样式与脚本产物
CSS=$(ls "$OUT"/css/inkwell.*.css 2>/dev/null | head -n1)
if [ -z "$CSS" ]; then
  fail "04-prose：找不到 css/inkwell.*.css"
else
  grep -qF '.prose' "$CSS" || fail "04-prose：CSS 里没有 .prose 规则"
  grep -qF 'dialog.lightbox' "$CSS" || fail "04-prose：CSS 里没有 dialog.lightbox 规则"
fi
JS=$(ls "$OUT"/js/main.*.js 2>/dev/null | head -n1)
if [ -z "$JS" ]; then
  fail "04-prose：找不到 js/main.*.js"
else
  grep -qF 'lightbox' "$JS" || fail "04-prose：main.js 里没有 lightbox"
fi
