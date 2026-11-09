// End-to-end tests against a real Express server on a random free port.
// Only routes that never call upstream APIs are exercised here.
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../app');

describe('Express app', () => {
  let server;
  let base;

  before(async () => {
    server = createApp().listen(0);
    await new Promise(resolve => server.once('listening', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(() => new Promise(resolve => server.close(resolve)));

  it('answers the health check', async () => {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).status, 'ok');
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await fetch(`${base}/api/nope`);
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { ok: false, error: 'Route not found.' });
  });

  it('validates query parameters before calling upstream APIs', async () => {
    const res = await fetch(`${base}/api/weather?city=paris`);
    assert.equal(res.status, 400);
  });

  it('sends security headers', async () => {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.ok(res.headers.get('content-security-policy'));
  });

  it('sends rate-limit headers on API routes', async () => {
    const res = await fetch(`${base}/api/health`);
    assert.ok(res.headers.get('ratelimit-policy') ?? res.headers.get('ratelimit'));
  });

  it('allows the dev frontend origin via CORS', async () => {
    const res = await fetch(`${base}/api/health`, { headers: { Origin: 'http://localhost:5173' } });
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  });
});
