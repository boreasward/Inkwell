// 目录高亮：IntersectionObserver 跟随滚动，给 .toc 里当前章节的链接加 is-active。
// 当前章节 = 顶部已越过“阅读线”（视口上方三分之一处）的最后一个标题；
// 正文结尾进入视口时，最后几节的标题可能永远越不过阅读线，此时直接点亮最后一项。
const READING_LINE = 1 / 3;

function targetOf(link) {
  let id = link.hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch (e) {
    // 非法编码就按原样查找
  }
  return document.getElementById(id);
}

export function initToc() {
  const toc = document.querySelector(".toc");
  if (!toc || !("IntersectionObserver" in window)) return;
  const items = [...toc.querySelectorAll('a[href^="#"]')]
    .map((link) => ({ link, heading: targetOf(link) }))
    .filter((item) => item.heading);
  if (!items.length) return;

  let active = null;
  let endVisible = false;

  function setActive(item) {
    if (item === active) return;
    if (active) {
      active.link.classList.remove("is-active");
      active.link.removeAttribute("aria-current");
    }
    active = item;
    if (!item) return;
    item.link.classList.add("is-active");
    item.link.setAttribute("aria-current", "location");
    // 侧栏目录超高、自身滚动时，让当前项留在侧栏可见范围内（只滚侧栏，不动页面）
    if (toc.scrollHeight > toc.clientHeight + 1) {
      const box = toc.getBoundingClientRect();
      const row = item.link.getBoundingClientRect();
      if (row.top < box.top || row.bottom > box.bottom) {
        toc.scrollTop += row.top - box.top - box.height / 2;
      }
    }
  }

  function update() {
    if (endVisible) {
      setActive(items[items.length - 1]);
      return;
    }
    const line = window.innerHeight * READING_LINE;
    let current = null;
    for (const item of items) {
      if (item.heading.getBoundingClientRect().top > line) break;
      current = item;
    }
    setActive(current);
  }

  // 标题穿过阅读线时重新计算
  const headings = new IntersectionObserver(update, {
    rootMargin: `0px 0px -${Math.round((1 - READING_LINE) * 100)}% 0px`,
  });
  items.forEach((item) => headings.observe(item.heading));

  // 正文之后的文章尾部出现在视口里 = 已读到正文结尾
  const end = document.querySelector(".article-footer");
  if (end) {
    new IntersectionObserver((entries) => {
      endVisible = entries[entries.length - 1].isIntersecting;
      update();
    }).observe(end);
  }

  update();
}
