// Data-source status shown in the top bar and the left navigation.
// Each source is one of: 'live' | 'demo' | 'error' | 'loading'.

/** Status of one source from its React Query result and the `source` the API reported. */
export function sourceStatus(query, source) {
  if (query.isError && !query.data) return 'error'
  if (query.isPending) return 'loading'
  return source ?? 'live'
}

/** One status for all sources. Worst state wins: one offline source outweighs the rest. */
export function overallStatus(statuses) {
  const values = Object.values(statuses)
  for (const s of ['error', 'loading', 'demo']) {
    if (values.includes(s)) return s
  }
  return 'live'
}
