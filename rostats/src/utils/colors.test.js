import { describe, it, expect } from 'vitest'
import {
  PALETTE, AQI_LEVELS, MAG_LEVELS, TEMP_LEVELS,
  aqiColor, aqiTag, magColor, tempColor, withAlpha,
} from './colors'

describe('aqiColor / aqiTag', () => {
  it.each([
    [0,   PALETTE.green,  'GOOD'],
    [50,  PALETTE.green,  'GOOD'],
    [51,  PALETTE.amber,  'MODERATE'],
    [100, PALETTE.amber,  'MODERATE'],
    [101, PALETTE.red,    'POOR'],
    [150, PALETTE.red,    'POOR'],
    [151, PALETTE.violet, 'UNHEALTHY'],
    [400, PALETTE.violet, 'UNHEALTHY'],
  ])('AQI %i → %s, %s', (value, color, tag) => {
    expect(aqiColor(value)).toBe(color)
    expect(aqiTag(value)).toBe(tag)
  })
})

describe('magColor', () => {
  it.each([
    [1.2, PALETTE.green],
    [2.99, PALETTE.green],
    [3, PALETTE.amber],
    [3.9, PALETTE.amber],
    [4, PALETTE.red],
    [6.5, PALETTE.red],
  ])('M %f → %s', (mag, color) => {
    expect(magColor(mag)).toBe(color)
  })
})

describe('tempColor', () => {
  it.each([
    [-12, PALETTE.sky],
    [0,   PALETTE.blue],
    [9,   PALETTE.blue],
    [10,  PALETTE.green],
    [20,  PALETTE.amber],
    [30,  PALETTE.red],
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
})

describe('withAlpha', () => {
  it('converts a hex color to rgba', () => {
    expect(withAlpha('#f87171', 0.12)).toBe('rgba(248, 113, 113, 0.12)')
  })
})
