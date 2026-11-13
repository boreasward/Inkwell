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
