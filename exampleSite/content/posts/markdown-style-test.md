+++
title = "Markdown 样式测试"
date = 2026-03-20T09:00:00+08:00
description = "覆盖全部 Markdown 元素的样式测试文章。"
series = ["主题演示"]
tags = ["Markdown", "样式"]
+++

这篇文章把主题支持的 Markdown 元素各写了一遍，用来检查排版。下面从标题开始。

## 标题与段落

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

这是一段较长的正文，用来观察行高、段间距和中英文混排的效果。阅读型主题最重要的是长时间阅读不累：行高约 1.8，段与段之间留出比行距更大的空隙，左对齐而不是两端对齐，这样每一行的起点都是稳定的。When English words such as typography, readability and extraordinarily-long-compound-words appear in the middle of a Chinese sentence, 浏览器会在中英文之间自动补上一点间距，连续的全角标点（例如“《》”、“（）”、“，。”）也会被压缩，不会显得松散。

第二段很短。

## 列表

无序列表，三层嵌套：

- 第一层，条目一
  - 第二层，条目一
    - 第三层，条目一
    - 第三层，条目二
  - 第二层，条目二
- 第一层，条目二

有序列表：

1. 准备食材
2. 开火
   1. 先小火
   2. 再大火
3. 出锅

任务列表：

- [x] 写完主题骨架
- [x] 设计令牌与深色模式
- [ ] 正文排版
- [ ] 代码块与搜索

## 引用与提示框

> 好的排版是看不见的，读者只会觉得读起来舒服。
>
> 引用块的左侧有一条细线，文字用次要颜色。

> [!NOTE]
> 注意类提示框，用来补充读者可能想知道的背景信息。

> [!TIP] 自定义标题
> 提示类提示框，这一条写了自定义标题，所以不显示默认的类型名。

> [!IMPORTANT]
> 重要类提示框，说明继续之前必须知道的事。

> [!WARNING]
> 警告类提示框，说明可能出问题的地方。

> [!CAUTION]
> 当心类提示框，说明有风险的操作。

## 表格

下面是一张 8 列的宽表格，窄屏下应在表格自己的容器里横向滚动，而不是撑宽页面。

| 编号 | 名称 | 类别 | 产地 | 重量 | 单价 | 库存 | 备注 |
| :--- | :--- | :---: | :--- | ---: | ---: | ---: | :--- |
| 001 | 红富士苹果 | 水果 | 山东烟台 | 250 g | 6.50 | 120 | 当季 |
| 002 | 麒麟西瓜 | 水果 | 浙江嘉兴 | 3 kg | 18.00 | 36 | 冷藏 |
| 003 | 小青菜 | 蔬菜 | 上海崇明 | 500 g | 4.20 | 80 | 次日达 |
| 004 | 土鸡蛋 | 蛋类 | 安徽黄山 | 600 g | 22.00 | 54 | 每日限量 |

## 图片与链接

下面是一张带 `title` 的图片，`title` 作为图注，点击图片可以放大：

![山峦剪影的样例图片](/images/sample.svg "图 1：一张用来测试图注与放大查看的样例图片")

一个外链：[Hugo 官方网站](https://gohugo.io/)，会在新窗口打开。一个站内链接：[回到本页的表格](#表格)，在当前窗口跳转。

一个超长的链接，中间没有任何空格，应当自动断行而不是撑宽页面：<https://example.com/a-very-long-path/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/end>

行内代码也要能断行：`this_is_a_very_long_inline_code_span_without_any_spaces_that_should_wrap_instead_of_overflowing_the_page_width_at_375px`。

## 代码

行内代码用反引号包裹，比如 `fmt.Println` 或 `git commit -m "msg"`，在正文里和文字并排显示。

带语言的代码块，右上角有复制按钮：

```go
package main

import "fmt"

// Greeter 打招呼。
type Greeter struct{ Name string }

func (g Greeter) Hello() string {
	return fmt.Sprintf("你好，%s！共 %d 次", g.Name, 3)
}

func main() {
	fmt.Println(Greeter{Name: "世界"}.Hello())
}
```

显示行号并高亮第 2 行：

```js {linenos=true, hl_lines=[2]}
const items = [1, 2, 3];
const doubled = items.map((n) => n * 2);
console.log(doubled);
```

没有语言的代码块按纯文本显示：

```
$ hugo server
Web Server is available at http://localhost:1313/
```

超长的单行代码在块内横向滚动，不撑开页面：

```js
const veryLongLine = "01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789";
```

## 公式与图表

行内公式写在文字中间，比如勾股定理 \(a^2 + b^2 = c^2\)，它应该和周围文字对齐。更完整的公式和图表演示见《公式与图表》一文。

```mermaid
flowchart LR
    A[开始] --> B[排版] --> C[阅读]
```

## 其他元素

脚注的写法是这样的[^1]，页面底部会汇总，并可以点回正文[^2]。

键盘按键：<kbd>Ctrl</kbd> + <kbd>K</kbd> 打开搜索，<kbd>Esc</kbd> 关闭。高亮文字：这句话里有<mark>需要标记的部分</mark>。

<details>
<summary>点击展开折叠内容</summary>

折叠区域里可以放任何内容，包括**加粗**、`行内代码` 和列表：

- 第一项
- 第二项

</details>

定义列表：

排版
: 对文字、图片等内容的版面安排。

行高
: 相邻两行文字基线之间的距离。
: 阅读型页面通常取 1.6 到 2 之间。

---

分隔线上方是正文，下方是脚注。

[^1]: 这是第一条脚注。
[^2]: 这是第二条脚注，点击行末的箭头可以回到正文。
