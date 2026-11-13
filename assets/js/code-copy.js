// 代码块复制：点击 [data-code-copy] 复制同一 .code-block 内的代码文本（不含行号），
// 按钮文字短暂变为 data-copied-label。剪贴板不可用或被拒绝时安静地什么也不做。
const RESET_DELAY = 1600;

// 行号分在 .ln（行内）或 .lnt（表格列）里。表格模式下最后一个 pre 才是代码列。
function codeText(block) {
  const pres = block.querySelectorAll(".highlight pre");
  const code = pres[pres.length - 1]?.querySelector("code");
  if (!code) return "";
  const copy = code.cloneNode(true);
  copy.querySelectorAll(".ln, .lnt").forEach((node) => node.remove());
  return copy.textContent;
}

function flash(button) {
  const label = button.querySelector(".code-copy-label");
  const copied = button.dataset.copiedLabel || button.dataset.label;
  clearTimeout(button._resetTimer);
  label.textContent = copied;
  button.setAttribute("aria-label", copied);
  button.classList.add("is-copied");
  button._resetTimer = setTimeout(() => {
    label.textContent = button.dataset.label;
    button.setAttribute("aria-label", button.dataset.label);
    button.classList.remove("is-copied");
  }, RESET_DELAY);
}

export function initCodeCopy() {
  document.querySelectorAll("[data-code-copy]").forEach((button) => {
    // 记下初始文字，连点时不会把“已复制”当成原文
    button.dataset.label = button.querySelector(".code-copy-label").textContent;
    button.addEventListener("click", async () => {
      const block = button.closest(".code-block");
      if (!block || !navigator.clipboard?.writeText) return;
      try {
        await navigator.clipboard.writeText(codeText(block));
      } catch (error) {
        return;
      }
      flash(button);
    });
  });
}
