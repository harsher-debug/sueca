import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.mjs';
test('serves canonical entry and retains campaign query', async () => {
  let seen;
  const response = await worker.fetch(new Request('https://sueca.com.br/skf?utm_source=test'), { ASSETS: { fetch: r => { seen = new URL(r.url); return new Response('ok'); } } });
  assert.equal(response.status, 200);
  assert.equal(seen.pathname, '/skf/index.html');
  assert.equal(seen.search, '?utm_source=test');
});
test('redirect preserves campaign parameters', async () => {
  const r = await worker.fetch(new Request('https://sueca.com.br/skf/?utm_campaign=x'), {});
  assert.equal(r.status, 308);
  assert.equal(r.headers.get('location'), 'https://sueca.com.br/skf?utm_campaign=x');
});
test('missing resources remain 404, POST is not treated as a form API', async () => {
  const env = { ASSETS: { fetch: () => new Response('missing', { status: 404 }) } };
  assert.equal((await worker.fetch(new Request('https://sueca.com.br/skf/assets/missing.png'), env)).status, 404);
  assert.equal((await worker.fetch(new Request('https://sueca.com.br/skf', { method: 'POST' }), env)).status, 405);
});
test('institutional and similarly prefixed paths pass through untouched', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async r => new Response(new URL(r.url).pathname);
  try {
    for (const path of ['/', '/sobre', '/skf-other', '/robots.txt', '/sitemap.xml']) {
      assert.equal(await (await worker.fetch(new Request(`https://sueca.com.br${path}`), {})).text(), path);
    }
  } finally { globalThis.fetch = original; }
});
