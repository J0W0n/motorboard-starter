import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createApp } from '../server.js';

async function start(t, store) {
  const server = createApp(store);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  const base = `http://127.0.0.1:${server.address().port}`;
  return (route, options) => fetch(base + route, options);
}

test('list API returns the current JSON file and detail API returns the same record', async t => {
  const request = await start(t);
  const expected = JSON.parse(await readFile(new URL('../data/cars.json', import.meta.url), 'utf8'));
  const response = await request('/api/cars');
  assert.equal(response.status, 200);
  const { cars } = await response.json();
  assert.deepEqual(cars, expected);
  assert.equal(new Set(cars.map(car => car.id)).size, cars.length);
  for (const car of cars) {
    const detail = await request(`/api/cars/${car.id}`);
    assert.equal(detail.status, 200);
    assert.deepEqual((await detail.json()).car, car);
    assert.equal((await request(car.image)).status, 200);
  }
});

test('unknown car and unknown API return 404', async t => {
  const request = await start(t);
  assert.equal((await request('/api/cars/missing')).status, 404);
  assert.equal((await request('/api/not-found')).status, 404);
});

test('starter does not allow a POST to silently pretend to save a car', async t => {
  const request = await start(t);
  const before = await (await request('/api/cars')).json();
  const result = await request('/api/cars', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'test' }),
  });
  assert.equal(result.status, 405);
  assert.deepEqual(await (await request('/api/cars')).json(), before);
  // 차량 등록 과제 완료 후 이 테스트를 201 응답·검증·파일 저장 테스트로 바꾸세요.
});

test('static pages load but project files and traversal are not exposed', async t => {
  const request = await start(t);
  for (const route of ['/', '/car.html?id=MB-001', '/styles.css', '/js/list.js']) {
    assert.equal((await request(route)).status, 200);
  }
  for (const route of ['/data/cars.json', '/server.js', '/package.json', '/.env', '/%2e%2e%2fserver.js', '/%2e%2e%5cserver.js']) {
    assert.equal((await request(route)).status, 404, route);
  }
  assert.equal((await request('/%E0%A4%A')).status, 400);
  const head = await request('/', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});

test('empty inventory remains a successful response', async t => {
  const request = await start(t, { getCars: async () => [], getCarById: async () => null });
  assert.deepEqual(await (await request('/api/cars')).json(), { cars: [] });
});

test('storage failure returns 500 without exposing the filesystem path', async t => {
  const request = await start(t, { getCars: async () => { throw new Error('test storage unavailable'); } });
  const result = await request('/api/cars');
  assert.equal(result.status, 500);
  const body = await result.json();
  assert.ok(body.message);
  assert.ok(!body.message.includes('test storage unavailable'));
});
