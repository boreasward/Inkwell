import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('搜索索引是合法 JSON，特殊字符标题原样保留', () => {
  const data = JSON.parse(readFileSync('tests/.out/search-index.json', 'utf8'));
  assert.ok(data.length >= 8);
  assert.ok(data.some((e) => e.title === '引号 "与" <尖括号> & 符号'));
  for (const e of data) assert.match(e.date, /^\d{4}-\d{2}-\d{2}$/);
});
