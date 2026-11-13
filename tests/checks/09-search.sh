# Task 9：搜索
exists search-index.json
has index.html 'id="search-dialog"'
has index.html 'data-index="/search-index.json"'
has index.html 'data-search-open'
has index.html 'js/search.'
OUT=tests/.out-sub has index.html 'data-index="/blog/search-index.json"'
# 搜索默认关闭
OUT=tests/.out-min hasnt index.html 'search-dialog'
OUT=tests/.out-min hasnt index.html 'js/search.'
