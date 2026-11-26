const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
test('internal navigation keeps the campaign query and fragment', () => {
  const source = readFileSync('script.js', 'utf8');
  const start = source.indexOf('// Keep attribution');
  const end = source.indexOf('document.querySelector(".lead-form")', start);
  for (const search of ['', '?utm_source=google&utm_campaign=SKF%20Brasil']) {
    const link = { hash: '#contato', setAttribute(name, value) { this[name] = value; } };
    vm.runInNewContext(source.slice(start, end), {
      window: { location: { search } }, document: { querySelectorAll: () => [link] }
    });
    assert.equal(link.href, `/skf${search}#contato`);
  }
});
