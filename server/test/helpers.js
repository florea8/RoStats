// Shared helpers for the API tests.

/** Minimal Express-like response object that records what a handler sent. */
function fakeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

/** A fetch() Response carrying a JSON body. */
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Runs a handler with the given query string params and returns the response. */
async function call(handler, query = {}, method = 'GET') {
  const res = fakeRes();
  await handler({ method, query }, res);
  return res;
}

module.exports = { fakeRes, jsonResponse, call };
