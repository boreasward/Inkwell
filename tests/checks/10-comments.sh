# Task 10：评论（giscus）
L=posts/long-essay/index.html
OUT=tests/.out-comments has $L 'data-giscus'
OUT=tests/.out-comments has $L 'data-repo="owner/repo"'
OUT=tests/.out-comments has $L 'data-repo-id="R_x"'
OUT=tests/.out-comments has $L 'data-category="General"'
OUT=tests/.out-comments has $L 'data-category-id="DIC_x"'
OUT=tests/.out-comments has $L 'data-mapping="pathname"'
OUT=tests/.out-comments has $L 'data-lang="zh-CN"'
OUT=tests/.out-comments has $L 'js/comments.'
# 评论区在上一篇/下一篇之后，且在 .article-footer 内
OUT=tests/.out-comments before $L 'class="post-nav"' 'data-giscus'
# 单篇 comments: false、非文章页、列表页都不输出
OUT=tests/.out-comments hasnt about/index.html 'data-giscus'
OUT=tests/.out-comments hasnt about/index.html 'js/comments.'
OUT=tests/.out-comments hasnt index.html 'data-giscus'
OUT=tests/.out-comments hasnt index.html 'js/comments.'
# 默认关闭
hasnt $L 'data-giscus'
hasnt $L 'js/comments.'
OUT=tests/.out-min hasnt $L 'data-giscus'
