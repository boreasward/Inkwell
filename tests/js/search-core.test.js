import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenize, search, snippet, highlight } from '../../assets/js/search-core.js';

const idx = [
  { title: 'Hugo 入门', url: '/a/', date: '2026-01-02', tags: ['hugo'], content: '模板与渲染钩子' },
  { title: '随笔', url: '/b/', date: '2026-03-01', tags: [], content: '今天读了 Hugo 的文档' },
  { title: '无关', url: '/c/', date: '2026-02-01', tags: [], content: '别的内容' },
];
const urls = (q) => search(idx, q).map((r) => r.entry.url);

test('tokenize', () => assert.deepEqual(tokenize('  Hugo  主题 '), ['hugo', '主题']));
test('标题命中排在正文命中前', () => assert.deepEqual(urls('hugo'), ['/a/', '/b/']));
test('多个关键词必须全部命中', () => assert.deepEqual(urls('hugo 文档'), ['/b/']));
test('不区分大小写', () => assert.equal(urls('HUGO').length, 2));
test('空查询', () => assert.deepEqual(urls('   '), []));
test('snippet 两侧截断', () => assert.equal(snippet('一二三四五六七八九十', ['五'], 2), '…三四五六七…'));
test('highlight 先转义再标记', () =>
  assert.equal(highlight('a<b> Hugo', ['hugo']), 'a&lt;b&gt; <mark>Hugo</mark>'));
