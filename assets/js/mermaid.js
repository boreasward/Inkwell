// Mermaid 图表：按需从 CDN 动态加载，按明暗主题渲染；主题切换后用 data-source 还原再重渲染。
// 加载或渲染失败时保留 <pre> 里的源码文本，页面照常可读。
// 作为 ES module 运行时 document.currentScript 为 null，所以通过属性选择器找到 <script data-mermaid-url>。

const selector = "pre.mermaid[data-source]";

function mermaidUrl() {
  const script = document.querySelector("script[data-mermaid-url]");
  return script ? script.getAttribute("data-mermaid-url") : "";
}

function mermaidTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "default";
}

let loading = null;
function loadMermaid() {
  if (!loading) {
    const url = mermaidUrl();
    loading = url ? import(url).then((m) => m.default || m) : Promise.reject(new Error("缺少 data-mermaid-url"));
  }
  return loading;
}

async function renderAll() {
  const nodes = Array.from(document.querySelectorAll(selector));
  if (nodes.length === 0) return;
  let mermaid;
  try {
    mermaid = await loadMermaid();
  } catch (e) {
    return; // 加载失败：源码文本保持不动
  }
  mermaid.initialize({ startOnLoad: false, theme: mermaidTheme(), securityLevel: "strict" });
  for (const node of nodes) {
    // 还原为源码（首次渲染时本来就是），清掉上一轮的处理标记
    node.textContent = node.getAttribute("data-source");
    node.removeAttribute("data-processed");
    try {
      await mermaid.run({ nodes: [node] });
    } catch (e) {
      // 语法错误等：回到源码文本
      node.textContent = node.getAttribute("data-source");
      node.removeAttribute("data-processed");
    }
  }
}

// 串行执行，避免主题连续切换时两轮渲染交错
let queue = Promise.resolve();
function schedule() {
  queue = queue.then(renderAll).catch(() => {});
}

schedule();
document.addEventListener("inkwell:themechange", schedule);
