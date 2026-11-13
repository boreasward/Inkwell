+++
title = "Hugo 入门（二）：内容组织"
date = 2026-06-10T09:00:00+08:00
weight = 2
series = ["Hugo 入门"]
tags = ["Hugo"]
description = "系列第二篇：内容文件、front matter 与分类法。"
+++

上一篇我们装好了 Hugo，并且让一个空站点跑了起来。这一篇讲内容：文章放在哪里，文件开头那段配置是什么意思，以及怎样用标签和系列把文章分门别类。

## 内容文件与 front matter

`content/` 下的目录结构基本就是站点的网址结构。`content/posts/hello.md` 会生成 `/posts/hello/`；如果文章带有图片，可以把它做成一个目录（叫页面包），把 `index.md` 和图片放在一起，引用图片时直接写文件名就行。

每个内容文件开头有一段 front matter，用来描述这篇文章：

```toml
+++
title = "你好，世界"
date = 2026-01-01T09:00:00+08:00
draft = false
description = "一句话摘要，会出现在列表和搜索结果里。"
tags = ["随笔"]
+++
```

最常用的字段是 `title`、`date`、`draft` 和 `description`。`draft = true` 的文章在正式构建时不会输出。front matter 可以用 TOML、YAML 或 JSON 书写，同一个站点里最好统一一种。

## 标签与系列

标签和系列在 Hugo 里都叫分类法（taxonomy）。站点配置里声明了哪些分类法，文章的 front matter 才能使用它们：

```toml
[taxonomies]
  tag = "tags"
  series = "series"
```

声明之后，文章里写 `tags = ["Hugo"]` 或 `series = ["Hugo 入门"]`，Hugo 就会自动生成对应的列表页。要给某个系列写一段简介，在 `content/series/hugo-入门/_index.md` 里写正文即可。系列内文章的顺序可以靠 `weight` 控制：数字越小越靠前，没有设置 `weight` 时按日期排。这个系列的三篇文章，发布日期是倒过来的，但因为设了 `weight`，目录里仍然是一、二、三的顺序。
