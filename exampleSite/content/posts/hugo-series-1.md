+++
title = "Hugo 入门（一）：安装与建站"
date = 2026-06-15T09:00:00+08:00
weight = 1
series = ["Hugo 入门"]
tags = ["Hugo"]
description = "系列第一篇：安装 Hugo 并初始化站点。"
+++

Hugo 是一个用 Go 写成的静态站点生成器：你用 Markdown 写内容，它把内容和模板合在一起，输出一堆可以直接放到任何静态服务器上的 HTML 文件。它的特点是快，构建几百篇文章通常只要几百毫秒，而且只有一个可执行文件，不依赖 Node，也不需要数据库。这个系列用三篇短文带你从零走到能自己改模板，本篇先把工具装好，把站点跑起来。

## 安装 Hugo

在 macOS 上最省事的办法是用 Homebrew：

```bash
brew install hugo
hugo version
```

Linux 可以用发行版自带的包管理器，也可以直接从 Hugo 的发布页下载压缩包，解开后把 `hugo` 放进 `PATH` 里的任意目录。Windows 用户可以用 `winget` 或 Scoop。装完以后运行 `hugo version`，能看到版本号就说明成功了。

> [!NOTE]
> 版本要注意。有些主题会要求较新的 Hugo，比如 Inkwell 要求 0.158.0 以上。装不到新版时，先看一眼 `hugo version` 的输出，再决定要不要升级。

## 初始化站点

安装好之后，新建一个站点只需要一条命令：

```bash
hugo new site my-blog
cd my-blog
git init
```

生成的目录里有几个关键位置：`content/` 放你的文章，`layouts/` 放模板，`static/` 放原样复制的静态文件，`hugo.toml` 是站点配置。现在先添加一篇文章，再启动本地预览：

```bash
hugo new content posts/hello.md
hugo server -D
```

`-D` 的意思是把草稿也一并显示。浏览器打开命令行里提示的地址，改动文件时页面会自动刷新。到这一步你已经有了一个能跑的站点，只是还没有主题，页面几乎是空的。下一篇会讲内容文件应该怎样组织，让站点的结构清楚起来。
