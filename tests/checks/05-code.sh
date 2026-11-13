# tests/checks/05-code.sh — Task 5 代码块（由 tests/run.sh source）
P=posts/markdown-style-test/index.html

has $P 'class="code-block"'
has $P '<span class="code-lang">go</span>'
has $P 'data-code-copy'
has $P 'class="chroma"'
has $P 'class="line hl"'
has $P 'class="lnt"'
# 高亮用 CSS 类，不输出内联颜色
hasnt $P 'style="color:'
OUT=tests/.out-min hasnt posts/markdown-style-test/index.html 'style="color:'
# 最小配置站点（无 markup.highlight 配置）同样渲染代码块
OUT=tests/.out-min has posts/markdown-style-test/index.html 'class="code-block"'

CSS=$(ls "$OUT"/css/inkwell.*.css 2>/dev/null | head -n1)
if [ -z "$CSS" ]; then
  fail "05-code：找不到 css/inkwell.*.css"
else
  grep -qF '.code-block' "$CSS" || fail "05-code：CSS 里没有 .code-block 规则"
  grep -qF '.chroma' "$CSS" || fail "05-code：CSS 里没有 .chroma 规则"
fi
JS=$(ls "$OUT"/js/main.*.js 2>/dev/null | head -n1)
if [ -z "$JS" ]; then
  fail "05-code：找不到 js/main.*.js"
else
  grep -qF 'data-code-copy' "$JS" || fail "05-code：main.js 里没有 data-code-copy"
fi
