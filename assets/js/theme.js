// 明暗切换。首次着色由 head 里的内联脚本完成，这里只处理点击、存储与事件。
const STORAGE_KEY = "inkwell-theme";

export function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function storedTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch (e) {
    return null;
  }
}

function applyTheme(theme, persist = true) {
  document.documentElement.setAttribute("data-theme", theme);
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // 隐私模式下存储可能抛异常，忽略即可
    }
  }
  document.dispatchEvent(new CustomEvent("inkwell:themechange", { detail: { theme } }));
}

export function initTheme() {
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });
}

// 没有手动选择过时，跟随系统明暗的实时变化；已有存储的选择则以选择为准。系统变化不写入存储。
export function initSystemTheme() {
  if (!window.matchMedia) return;
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const follow = (event) => {
    if (storedTheme()) return;
    const theme = event.matches ? "dark" : "light";
    if (theme !== currentTheme()) applyTheme(theme, false);
  };
  if (query.addEventListener) query.addEventListener("change", follow);
  else if (query.addListener) query.addListener(follow);
}
