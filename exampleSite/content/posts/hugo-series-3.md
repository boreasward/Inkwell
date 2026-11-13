+++
title = "Hugo 入门（三）：模板入门"
date = 2026-06-05T09:00:00+08:00
weight = 3
series = ["Hugo 入门"]
tags = ["Hugo"]
description = "系列第三篇：模板查找与基础语法。"
+++

前两篇解决了“装好”和“写好”，最后一篇看看 Hugo 怎样把内容变成页面。模板是 Hugo 的核心，也是主题的主要内容，理解它的查找规则之后，改任何主题都不会再觉得无从下手。

## 模板的查找顺序

给定一个页面，Hugo 会按页面类型（首页、单篇、列表、分类法……）、所在目录和布局名，在 `layouts/` 里依次找最匹配的模板，找不到再退到更通用的一个。比如一篇文章通常用 `layouts/_default/single.html`（新版目录结构里是 `layouts/single.html`），一个目录的列表页用 `list.html`，首页用 `home.html`。

最重要的一条规则是：站点自己的 `layouts/` 优先于主题的 `layouts/`。你想改某个主题模板的行为，不必改主题本身，只要在站点里放一个同名文件，Hugo 就会用你的这一份。这也是主题可以长期升级的原因。

## 第一个自定义布局

在 `layouts/` 下新建 `single.html`，最小的模板可以只有几行：

```go-html-template
{{ define "main" }}
  <article>
    <h1>{{ .Title }}</h1>
    <time>{{ .Date.Format "2006-01-02" }}</time>
    {{ .Content }}
  </article>
{{ end }}
```

`{{ .Title }}`、`{{ .Date }}` 和 `{{ .Content }}` 分别取出当前页面的标题、日期和渲染后的正文。花括号里的内容由 Hugo 在构建时执行，其余部分原样输出。

自定义布局里还可以覆盖渲染钩子，改变标题、链接和图片的输出。钩子放在 `layouts/_markup/` 下，例如 `render-image.html` 控制每张图片生成什么样的 HTML，Inkwell 的图注和点击放大就是这样实现的。到这里，你已经具备了读懂并修改一个 Hugo 主题所需的全部基础。
