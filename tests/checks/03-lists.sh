# tests/checks/03-lists.sh — Task 3 列表类页面（由 tests/run.sh source）

# 首页：紧凑列表 + 年份分组 + 分页
has index.html 'post-list post-list--compact'
has index.html 'class="post-year"'
has index.html 'class="post-item"'
has index.html 'class="pager"'
exists page/2/index.html
has page/2/index.html 'class="pager"'
# 首页简介在列表上方
before index.html 'Inkwell 主题的示例站点' 'post-list post-list--compact'

# 分页链接在子路径下带前缀
OUT=tests/.out-sub exists page/2/index.html
OUT=tests/.out-sub has index.html 'class="pager"'
OUT=tests/.out-sub has index.html 'href="/blog/page/2/"'
OUT=tests/.out-sub has page/2/index.html 'href="/blog/"'

# 标签总览与词条页
exists tags/index.html
has tags/index.html 'Markdown'
exists tags/markdown/index.html
has tags/markdown/index.html 'post-list post-list--compact'

# 归档：全部文章按年份分组，不分页
exists archives/index.html
has archives/index.html 'class="post-year"'
has archives/index.html 'hugo-series-3/'
hasnt archives/index.html 'class="pager"'

# 特殊字符标题在列表里正确转义（Hugo 把 " 转义为 &#34;，< > & 必须被转义）
has archives/index.html '引号 &#34;与&#34; &lt;尖括号&gt; &amp; 符号'
hasnt archives/index.html '<尖括号>'

# 摘要样式（第四种构建）
OUT=tests/.out-summary has index.html 'post-list post-list--summary'
OUT=tests/.out-summary has index.html 'class="post-summary"'
OUT=tests/.out-summary hasnt index.html 'class="post-year"'
