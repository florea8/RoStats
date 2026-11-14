import { describe, it, expect } from 'vitest'
import {
  PALETTE, AQI_LEVELS, MAG_LEVELS, TEMP_LEVELS,
  aqiColor, aqiTag, magColor, tempColor, withAlpha,
} from './colors'

describe('aqiColor / aqiTag', () => {
  it.each([
    [0,   PALETTE.sage,   'GOOD'],
    [50,  PALETTE.sage,   'GOOD'],
    [51,  PALETTE.ochre,  'MODERATE'],
    [100, PALETTE.ochre,  'MODERATE'],
    [101, PALETTE.orange, 'POOR'],
    [150, PALETTE.orange, 'POOR'],
    [151, PALETTE.plum,   'UNHEALTHY'],
    [400, PALETTE.plum,   'UNHEALTHY'],
  ])('AQI %i → %s, %s', (value, color, tag) => {
    expect(aqiColor(value)).toBe(color)
    expect(aqiTag(value)).toBe(tag)
  })
})

describe('magColor', () => {
  it.each([
    [1.2, PALETTE.ochre],
    [2.99, PALETTE.ochre],
    [3, PALETTE.orange],
    [3.9, PALETTE.orange],
    [4, PALETTE.crimson],
    [6.5, PALETTE.crimson],
  ])('M %f → %s', (mag, color) => {
    expect(magColor(mag)).toBe(color)
  })
})

describe('tempColor', () => {
  it.each([
    [-12, PALETTE.navy],
    [0,   PALETTE.steel],
    [9,   PALETTE.steel],
    [10,  PALETTE.sand],
    [20,  PALETTE.apricot],
    [30,  PALETTE.brick],
  ])('%i°C → %s', (t, color) => {
    expect(tempColor(t)).toBe(color)
  })
})

describe('level scales', () => {
  // The lookup takes the first level whose `min` the value reaches,
  // so every scale must be ordered from the highest threshold down.
  it.each([['AQI', AQI_LEVELS], ['magnitude', MAG_LEVELS], ['temperature', TEMP_LEVELS]])(
    '%s levels are sorted by descending threshold',
    (_, levels) => {
      const mins = levels.map(l => l.min)
      expect(mins).toEqual([...mins].sort((a, b) => b - a))
      expect(mins.at(-1)).toBe(-Infinity)
    },
  )

  it.each([['AQI', AQI_LEVELS], ['magnitude', MAG_LEVELS], ['temperature', TEMP_LEVELS]])(
    '%s levels each use a different color',
    (_, levels) => {
      const colors = levels.map(l => l.color)
      expect(new Set(colors).size).toBe(colors.length)
    },
  )
})

describe('withAlpha', () => {
  it('converts a hex color to rgba', () => {
    expect(withAlpha('#f87171', 0.12)).toBe('rgba(248, 113, 113, 0.12)')
  })
})
