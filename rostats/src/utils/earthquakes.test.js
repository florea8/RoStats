import { describe, it, expect } from 'vitest'
import { dailyCounts, summarize24h, markerRadius } from './earthquakes'

// Local noon, so "N hours ago" lands on a predictable calendar day in any time zone.
const NOW = new Date(2026, 10, 6, 12, 0).getTime()
const HOUR = 3600 * 1000

const quake = (hoursAgo, magnitude = 2) => ({
  id: `q${hoursAgo}`,
  magnitude,
  time: new Date(NOW - hoursAgo * HOUR).toISOString(),
})

describe('dailyCounts', () => {
  it('counts events per day over the last 7 days, oldest first', () => {
    const quakes = [quake(1), quake(5), quake(30), quake(3 * 24)]
    expect(dailyCounts(quakes, NOW)).toEqual([0, 0, 0, 1, 0, 1, 2])
  })

  it('ignores events older than the window', () => {
    expect(dailyCounts([quake(10 * 24)], NOW)).toEqual([0, 0, 0, 0, 0, 0, 0])
  })

  it('supports a custom window length', () => {
    expect(dailyCounts([quake(1)], NOW, 3)).toEqual([0, 0, 1])
  })
})

describe('summarize24h', () => {
  it('counts events and finds the strongest one in the last 24 hours', () => {
    const quakes = [quake(1, 2.1), quake(20, 3.4), quake(25, 5.0)]
    expect(summarize24h(quakes, NOW)).toEqual({ count: 2, maxMag: 3.4 })
  })

  it('returns no magnitude when nothing happened', () => {
    expect(summarize24h([], NOW)).toEqual({ count: 0, maxMag: null })
  })
})

describe('markerRadius', () => {
  it('grows with magnitude', () => {
    expect([2.5, 3, 4.2].map(markerRadius)).toEqual([4, 7, 10])
  })
})
