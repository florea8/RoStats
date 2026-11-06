const DAY_MS = 86400000

/** Earthquake count per calendar day for the `days` days up to `now`, oldest first. */
export function dailyCounts(quakes, now, days = 7) {
  const counts = new Map()
  for (let i = days - 1; i >= 0; i--) {
    counts.set(new Date(now - i * DAY_MS).toDateString(), 0)
  }
  for (const q of quakes) {
    const day = new Date(q.properties.time).toDateString()
    if (counts.has(day)) counts.set(day, counts.get(day) + 1)
  }
  return [...counts.values()]
}

/** Number of events and the strongest magnitude in the 24 hours before `now`. */
export function summarize24h(quakes, now) {
  const recent = quakes.filter(q => now - q.properties.time < DAY_MS)
  return {
    count:  recent.length,
    maxMag: recent.length ? Math.max(...recent.map(q => q.properties.mag)) : null,
  }
}

/** Map marker radius in pixels, larger for stronger events. */
export function markerRadius(mag) {
  if (mag >= 4) return 10
  if (mag >= 3) return 7
  return 4
}
