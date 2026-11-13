# tests/checks/11-review-fixes.sh — 终审修复：链接、页脚、404 标题、样式规则（由 tests/run.sh source）
P=posts/markdown-style-test/index.html

# 站内绝对路径链接带子路径前缀；非子路径构建保持原样；排除协议相对地址
OUT=tests/.out-sub has $P 'href="/blog/about/"'
has $P 'href="/about/"'
# 不安全协议不输出成可点击地址
for o in tests/.out tests/.out-sub; do
  OUT=$o hasnt $P 'href="javascript:'
  OUT=$o has $P '这个'
done

# 页脚文字按行内 Markdown 渲染
OUT=tests/.out-comments has index.html '<a href="https://beian.miit.gov.cn/" rel="noopener" target="_blank">京ICP备12345678号</a>'

# /posts/ 栏目页含子栏目文章
grep -qF 'RegularPagesRecursive' layouts/section.html || fail "section.html 应使用 .RegularPagesRecursive"

# CSS 源文件：字号全部走令牌；无 JS 时不显示空评论框；custom.css 可覆盖令牌
if grep -nE 'font-size: *[0-9.]+(rem|px|em)' assets/css/*.css | grep -v 'assets/css/tokens.css'; then
  fail "CSS 里仍有写死的字号（应使用 --fs-* 令牌）"
fi
grep -qF '.no-js .comments' assets/css/components.css || fail "缺少 .no-js .comments 规则"
grep -qF '"custom"' layouts/_partials/css.html || fail "css.html 应支持 assets/css/custom.css"
CSS=$(ls "$OUT"/css/inkwell.*.css 2>/dev/null | head -n1)
grep -qE '\.site-title *\{[^}]*min-width: *0' "$CSS" || fail "site-title 应允许收缩（min-width: 0）"
grep -qE 'overflow-wrap: *anywhere' "$CSS" || fail "缺少 overflow-wrap: anywhere"
grep -qE '\.term-item[^{]*\{[^}]*min-width: *0|\.term-item[^{]*\{[^}]*overflow-wrap' "$CSS" || fail "term-item 应允许断行"

# 图片放大不劫持链接里的图片；主题脚本跟随系统明暗变化
JS=$(ls "$OUT"/js/main.*.js 2>/dev/null | head -n1)
grep -qF 'closest("a")' "$JS" || fail "lightbox 应跳过链接内的图片"
grep -qF 'prefers-color-scheme' "$JS" || fail "theme.js 应监听系统明暗变化"
