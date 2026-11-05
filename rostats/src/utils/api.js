// Empty by default: in development Vite proxies /api to the Express server,
// in production the API is served from the same origin by Vercel.
const API_BASE = import.meta.env.VITE_API_BASE || ''

/** GET a JSON endpoint; throws on HTTP errors and on { ok: false } bodies. */
export async function getJson(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`)
  const json = await res.json()
  if (json.ok === false) throw new Error(json.error || 'API error')
  return json
}
