// 明暗切换。首次着色由 head 里的内联脚本完成，这里只处理点击、存储与事件。
const STORAGE_KEY = "inkwell-theme";

export function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    // 隐私模式下存储可能抛异常，忽略即可
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
