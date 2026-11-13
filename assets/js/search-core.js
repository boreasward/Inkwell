// 搜索核心：纯函数，不碰 DOM，便于 node --test 直接测试。
// 索引条目：{ title, url, date: "YYYY-MM-DD", tags: string[], content }

const TITLE_SCORE = 10;
const TAG_SCORE = 5;
const CONTENT_SCORE = 1;

/** 转小写，按空白拆成关键词，去掉空串。 */
export function tokenize(query) {
  return String(query).toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * 每个关键词都必须出现在标题、标签或正文中（不区分大小写）。
 * 每个关键词：标题命中 +10、标签命中 +5、正文命中 +1。
 * 按分数降序，同分按日期降序；空查询返回 []。
 */
export function search(index, query, limit = 20) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const results = [];
  for (const entry of index) {
    const title = entry.title.toLowerCase();
    const tags = entry.tags.join("\n").toLowerCase();
    const content = entry.content.toLowerCase();
    let score = 0;
    let matched = true;
    for (const token of tokens) {
      const s =
        (title.includes(token) ? TITLE_SCORE : 0) +
        (tags.includes(token) ? TAG_SCORE : 0) +
        (content.includes(token) ? CONTENT_SCORE : 0);
      if (s === 0) {
        matched = false;
        break;
      }
      score += s;
    }
    if (matched) results.push({ entry, score });
  }
  results.sort((a, b) => b.score - a.score || (a.entry.date < b.entry.date ? 1 : a.entry.date > b.entry.date ? -1 : 0));
  return results.slice(0, limit);
}

// 把关键词拼成一个不区分大小写的正则；长的在前，避免短词截断长词。
function tokenPattern(tokens, flags) {
  const parts = tokens
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return parts.length ? new RegExp(parts.join("|"), flags) : null;
}

/**
 * 以第一个命中位置为中心取前后各 radius 个字符，被截断的一侧加 “…”；
 * 没有命中时取开头 2 * radius 个字符。
 */
export function snippet(text, tokens, radius = 40) {
  const re = tokenPattern(tokens, "i");
  const m = re && re.exec(text);
  let start = 0;
  let end = 2 * radius;
  if (m) {
    start = Math.max(0, m.index - radius);
    end = m.index + m[0].length + radius;
  }
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHTML = (s) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

/**
 * 返回可直接放进 innerHTML 的字符串：原文先转义，命中处包进 <mark>，保留原文大小写。
 * 按原文切分后分段转义，所以关键词不会命中转义产生的实体（如 “amp”）。
 */
export function highlight(text, tokens) {
  const re = tokenPattern(tokens, "gi");
  if (!re) return escapeHTML(text);
  let out = "";
  let last = 0;
  for (const m of text.matchAll(re)) {
    out += escapeHTML(text.slice(last, m.index)) + "<mark>" + escapeHTML(m[0]) + "</mark>";
    last = m.index + m[0].length;
  }
  return out + escapeHTML(text.slice(last));
}
