// giscus 评论：评论区（section.comments[data-giscus]）接近视口时才注入 client.js；
// 明暗切换时向已存在的评论框 iframe 发送主题。参数全部来自 section 的 data-* 属性。
const GISCUS_ORIGIN = "https://giscus.app";

const section = document.querySelector("section.comments[data-giscus]");

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function inject() {
  if (section.querySelector("script[data-giscus-client]")) return;
  const d = section.dataset;
  const script = document.createElement("script");
  script.src = GISCUS_ORIGIN + "/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-giscus-client", "");
  const attrs = {
    "data-repo": d.repo,
    "data-repo-id": d.repoId,
    "data-category": d.category,
    "data-category-id": d.categoryId,
    "data-mapping": d.mapping,
    "data-strict": "0",
    "data-reactions-enabled": "1",
    "data-emit-metadata": "0",
    "data-input-position": "bottom",
    "data-theme": currentTheme(),
    "data-lang": d.lang,
    "data-loading": "lazy",
  };
  for (const [name, value] of Object.entries(attrs)) {
    script.setAttribute(name, value);
  }
  section.appendChild(script);
}

function sendTheme(theme) {
  const frame = section.querySelector("iframe.giscus-frame");
  if (!frame || !frame.contentWindow) return;
  frame.contentWindow.postMessage({ giscus: { setConfig: { theme } } }, GISCUS_ORIGIN);
}

if (section) {
  document.addEventListener("inkwell:themechange", (event) => {
    sendTheme(event.detail && event.detail.theme ? event.detail.theme : currentTheme());
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          inject();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(section);
  } else {
    inject();
  }
}
