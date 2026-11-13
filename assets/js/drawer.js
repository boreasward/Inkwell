// 底部抽屉：悬浮按钮开关 html[data-drawer="open"]；页签切换 #drawer[data-active]；
// 点目录项、点遮罩、按 Esc 关闭（Esc 和遮罩关闭后焦点回到悬浮按钮）。
// 窄屏抽屉是整个 #drawer，中等宽度只有系列面板；宽度跨过断点时自动收起。
const MEDIUM = "(min-width: 1000px)";
const WIDE = "(min-width: 1280px)";

function isVisible(el) {
  return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
}

export function initDrawer() {
  const drawer = document.getElementById("drawer");
  const toggle = document.querySelector("[data-drawer-toggle]");
  if (!drawer || !toggle) return;
  const root = document.documentElement;
  const isOpen = () => root.getAttribute("data-drawer") === "open";

  function open() {
    root.setAttribute("data-drawer", "open");
    toggle.setAttribute("aria-expanded", "true");
    // 焦点移进抽屉：中等宽度抽屉里只有系列面板（目录是侧栏）
    const sheet = matchMedia(MEDIUM).matches ? drawer.querySelector(".series-nav") : drawer;
    const first = sheet && [...sheet.querySelectorAll("button, a[href]")].find(isVisible);
    if (first) first.focus({ preventScroll: true });
  }

  function close(returnFocus) {
    if (!isOpen()) return;
    root.removeAttribute("data-drawer");
    toggle.setAttribute("aria-expanded", "false");
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => (isOpen() ? close(false) : open()));

  document.querySelectorAll("[data-drawer-close]").forEach((el) => {
    el.addEventListener("click", () => close(true));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) close(true);
  });

  const tabs = drawer.querySelectorAll("[data-drawer-tab]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      drawer.setAttribute("data-active", tab.dataset.drawerTab);
      tabs.forEach((t) => t.setAttribute("aria-pressed", String(t === tab)));
      drawer.scrollTop = 0;
    });
  });

  // 点目录项：先收起抽屉再让浏览器跳转，目标标题不会被抽屉挡住。侧栏状态下抽屉本就关着，不受影响。
  const toc = drawer.querySelector(".toc");
  if (toc) {
    toc.addEventListener("click", (event) => {
      if (event.target.closest("a[href]")) close(false);
    });
  }

  [MEDIUM, WIDE].forEach((query) => {
    matchMedia(query).addEventListener("change", () => close(false));
  });
}
