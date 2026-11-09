import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { timeAgo } from './time'

const NOW = new Date('2026-11-06T12:00:00Z')

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })
  afterEach(() => vi.useRealTimers())

  it.each([
    [5 * 60 * 1000, '5m ago'],
    [3 * 3600 * 1000, '3h ago'],
    [2 * 86400 * 1000, '2d ago'],
  ])('%i ms ago → %s', (msAgo, expected) => {
    expect(timeAgo(NOW.getTime() - msAgo)).toBe(expected)
  })

  it('accepts ISO strings as returned by the API', () => {
    expect(timeAgo('2026-11-06T11:30:00Z')).toBe('30m ago')
  })
})
