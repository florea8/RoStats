import { describe, it, expect } from 'vitest'
import { wxCode } from './weather'

describe('wxCode', () => {
  it.each([
    ['thunderstorm with light rain', 'TSTM'],
    ['light snow', 'SNW'],
    ['moderate rain', 'RAIN'],
    ['mist', 'FOG'],
    ['overcast clouds', 'OVC'],
    ['few clouds', 'FEW'],
    ['partly cloudy', 'FEW'],
    ['scattered clouds', 'CLD'],
    ['broken clouds', 'CLD'],
    ['clear sky', 'CLR'],
    ['volcanic ash', 'VAR'],
  ])('"%s" → %s', (description, code) => {
    expect(wxCode(description)).toBe(code)
  })

  it('handles a missing description', () => {
    expect(wxCode(undefined)).toBe('VAR')
  })

  it('is case-insensitive', () => {
    expect(wxCode('Clear Sky')).toBe('CLR')
  })
})
