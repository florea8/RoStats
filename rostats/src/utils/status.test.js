import { describe, it, expect } from 'vitest'
import { sourceStatus, overallStatus } from './status'

describe('sourceStatus', () => {
  it('is loading before the first response', () => {
    expect(sourceStatus({ isPending: true }, undefined)).toBe('loading')
  })

  it('is error when the request failed and there is no data', () => {
    expect(sourceStatus({ isError: true }, undefined)).toBe('error')
  })

  it('keeps showing cached data after a failed refetch', () => {
    expect(sourceStatus({ isError: true, data: {} }, 'live')).toBe('live')
  })

  it('reports the source the API returned', () => {
    expect(sourceStatus({ data: {} }, 'demo')).toBe('demo')
  })
})

describe('overallStatus', () => {
  it('is live when every source is live', () => {
    expect(overallStatus({ seismic: 'live', aqi: 'live', weather: 'live' })).toBe('live')
  })

  it.each([
    [{ seismic: 'live', aqi: 'demo', weather: 'live' }, 'demo'],
    [{ seismic: 'loading', aqi: 'demo', weather: 'live' }, 'loading'],
    [{ seismic: 'live', aqi: 'demo', weather: 'error' }, 'error'],
  ])('worst state wins: %o → %s', (statuses, expected) => {
    expect(overallStatus(statuses)).toBe(expected)
  })
})
