import { describe, it, expect } from 'vitest'
import { quakeMoment, REPLAY_DAYS } from './replay'

const DAY_MS = 86400000
const NOW = Date.parse('2026-11-15T12:00:00Z')
const quakeAt = msBeforeNow => ({ time: new Date(NOW - msBeforeNow).toISOString() })

describe('quakeMoment', () => {
  it('places an event within the replay window, 0 at its start and 1 now', () => {
    expect(quakeMoment(quakeAt(REPLAY_DAYS * DAY_MS), NOW)).toBe(0)
    expect(quakeMoment(quakeAt(15 * DAY_MS), NOW)).toBeCloseTo(0.5)
    expect(quakeMoment(quakeAt(0), NOW)).toBe(1)
  })

  it('keeps events outside the window at its edges', () => {
    expect(quakeMoment(quakeAt(45 * DAY_MS), NOW)).toBe(0)
    expect(quakeMoment(quakeAt(-DAY_MS), NOW)).toBe(1)
  })
})
