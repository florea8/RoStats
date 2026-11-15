import { describe, it, expect } from 'vitest'
import { sentenceCase } from './text'

describe('sentenceCase', () => {
  it.each([
    ['MODERATE', 'Moderate'],
    ['light rain', 'Light rain'],
    ['Thunderstorm With Hail', 'Thunderstorm with hail'],
  ])('%s → %s', (text, expected) => {
    expect(sentenceCase(text)).toBe(expected)
  })

  it('returns an empty string for missing text', () => {
    expect(sentenceCase('')).toBe('')
    expect(sentenceCase(undefined)).toBe('')
  })
})
