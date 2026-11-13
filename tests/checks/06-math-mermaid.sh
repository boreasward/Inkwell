# tests/checks/06-math-mermaid.sh — Task 6 公式与 Mermaid（由 tests/run.sh source）
M=posts/math-and-diagrams/index.html

has $M 'class="katex"'
has $M 'class="math-display"'
has $M 'katex.min.css'
has $M '<pre class="mermaid"'
has $M 'js/mermaid.'
has $M 'data-mermaid-url='
# spec 验收 7：只出现在用到的页面
hasnt posts/long-essay/index.html 'katex.min.css'
hasnt posts/long-essay/index.html 'js/mermaid.'
hasnt index.html 'katex.min.css'
OUT=tests/.out-summary hasnt index.html 'class="katex"'
# 示例页：行内公式也出现在 markdown-style-test
has posts/markdown-style-test/index.html 'class="katex"'
has posts/markdown-style-test/index.html '<pre class="mermaid"'
# Review Focus 1：没开 passthrough 时公式页照常生成
OUT=tests/.out-min exists posts/math-and-diagrams/index.html
OUT=tests/.out-min hasnt posts/math-and-diagrams/index.html 'katex.min.css'
OUT=tests/.out-min hasnt posts/math-and-diagrams/index.html 'class="katex"'

# 摘要/描述回退不能带出公式的 MathML 或 TeX 源码（防止公式文字重复）。
# 示例页的 description 来自 front matter，这里守住 <head> 里的描述与 og:description 路径；
# 无 description 时的回退（funcs/plain-summary.html）另用临时站点验证，见 task-6-report.md。
for f in "$OUT/$M" "tests/.out-summary/index.html"; do
  if [ ! -f "$f" ]; then fail "06-math：$f 不存在"; continue; fi
  lines=$(grep -E 'name="description"|og:description|class="post-summary"' "$f")
  if printf '%s\n' "$lines" | grep -qE 'katex|\\\(|\^|annotation'; then
    fail "06-math：$f 的描述行含公式标记：$lines"
  fi
done
# og:description 与 meta description 都存在
has $M 'property="og:description"'
has $M 'name="description"'
