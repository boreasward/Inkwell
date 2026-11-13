// 图片放大：点击 img[data-zoomable] 用一个按需创建的 dialog.lightbox 显示大图。
// 点击对话框任意位置、或按 Esc（dialog 原生行为）关闭。没有 JavaScript 时图片按原样显示。
let dialog = null;

function ensureDialog() {
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.appendChild(document.createElement("img"));
  dialog.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    dialog.querySelector("img").removeAttribute("src");
  });
  document.body.appendChild(dialog);
  return dialog;
}

function open(source) {
  const box = ensureDialog();
  const big = box.querySelector("img");
  big.src = source.currentSrc || source.src;
  big.alt = source.alt;
  box.setAttribute("aria-label", source.alt);
  if (!box.open) box.showModal();
}

export function initLightbox() {
  if (typeof HTMLDialogElement === "undefined") return;
  document.querySelectorAll("img[data-zoomable]").forEach((img) => {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.addEventListener("click", () => open(img));
    img.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open(img);
      }
    });
  });
}
