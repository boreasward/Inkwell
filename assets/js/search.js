// 搜索弹窗：独立入口，只依赖 search-core.js 和 #search-dialog 的 data-index / data-empty-label。
// 点 [data-search-open] 或按 “/” 打开；首次打开才下载索引；Esc 由原生 <dialog> 处理。
import { tokenize, search, snippet, highlight } from "./search-core.js";

const dialog = document.getElementById("search-dialog");

if (dialog) {
  const input = document.getElementById("search-input");
  const list = document.getElementById("search-results");
  let indexPromise = null;

  // 失败时清掉缓存，下次打开重试
  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(dialog.dataset.index)
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        })
        .catch(() => {
          indexPromise = null;
          return [];
        });
    }
    return indexPromise;
  }

  function resultItem(entry, tokens) {
    const li = document.createElement("li");
    li.className = "search-result";
    const a = document.createElement("a");
    a.href = entry.url;
    const title = document.createElement("span");
    title.className = "search-result-title";
    title.innerHTML = highlight(entry.title, tokens);
    const date = document.createElement("time");
    date.className = "search-result-date";
    date.dateTime = entry.date;
    date.textContent = entry.date;
    const text = document.createElement("span");
    text.className = "search-result-snippet";
    text.innerHTML = highlight(snippet(entry.content, tokens), tokens);
    a.append(title, date, text);
    li.append(a);
    return li;
  }

  async function render() {
    const query = input.value;
    const tokens = tokenize(query);
    const index = tokens.length ? await loadIndex() : [];
    if (input.value !== query) return; // 索引返回时输入已变，交给后一次渲染
    list.replaceChildren();
    if (!tokens.length) return;
    const results = search(index, query);
    if (!results.length) {
      const li = document.createElement("li");
      li.className = "search-empty";
      li.textContent = dialog.dataset.emptyLabel;
      list.append(li);
      return;
    }
    list.append(...results.map(({ entry }) => resultItem(entry, tokens)));
  }

  function open() {
    if (dialog.open) return;
    dialog.showModal();
    input.focus();
    input.select();
    loadIndex().then(render);
  }

  const links = () => [...list.querySelectorAll("a")];

  input.addEventListener("input", render);

  // Enter 打开第一条；上下键在输入框和结果之间移动
  input.addEventListener("keydown", (event) => {
    if (event.isComposing) return;
    if (event.key === "Enter") {
      const first = links()[0];
      if (first) first.click();
    } else if (event.key === "ArrowDown") {
      const first = links()[0];
      if (first) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  list.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const all = links();
    const i = all.indexOf(document.activeElement) + (event.key === "ArrowDown" ? 1 : -1);
    if (i < 0) input.focus();
    else if (all[i]) all[i].focus();
  });

  document.querySelectorAll("[data-search-open]").forEach((el) => el.addEventListener("click", open));
  document.querySelectorAll("[data-search-close]").forEach((el) => el.addEventListener("click", () => dialog.close()));

  // 点弹窗外的遮罩关闭（遮罩上的点击目标是 dialog 本身）
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  // 从结果页后退时（bfcache）不要还停在打开的弹窗上
  addEventListener("pagehide", () => dialog.close());

  // “/” 打开搜索：焦点在输入控件里、按着 Ctrl/Meta/Alt、或已有别的弹窗（如图片放大）时忽略。
  // 不排除 Shift：部分键盘布局上 “/” 本身要按 Shift。
  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.defaultPrevented || event.isComposing) return;
    const t = event.target;
    if (t instanceof Element && t.closest("input, textarea, select, [contenteditable]:not([contenteditable=false])")) return;
    if (document.querySelector("dialog[open]")) return;
    event.preventDefault();
    open();
  });
}
