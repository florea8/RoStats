import { describe, it, expect } from 'vitest'
import { periodLabel, splitSign, describeChange } from './indicators'

describe('periodLabel', () => {
  it.each([
    ['2026-09', 'Sep 2026'],
    ['2026-01', 'Jan 2026'],
    ['2026-Q3', 'Q3 2026'],
    ['2025', '2025'],
  ])('%s → %s', (period, expected) => {
    expect(periodLabel(period)).toBe(expected)
  })
})

describe('splitSign', () => {
  it('puts a minus on negative values', () => {
    expect(splitSign({ value: -6.3, signed: true })).toEqual({ sign: '−', number: 6.3 })
  })

  it('puts a plus on positive rates of change only', () => {
    expect(splitSign({ value: 0.3, signed: true })).toEqual({ sign: '+', number: 0.3 })
    expect(splitSign({ value: 6.5, signed: false })).toEqual({ sign: '', number: 6.5 })
  })
})

describe('describeChange', () => {
  const rate = { unit: '%', decimals: 1, previousPeriod: '2026-08' }

  it('gives the change of a rate in points', () => {
    expect(describeChange({ ...rate, value: 6.3, previous: 6.4, better: 'lower' }))
      .toEqual({ text: '▼ 0.1 pts vs Aug 2026', favourable: true })
  })

  it('gives the change of an amount as a percentage', () => {
    expect(describeChange({ value: 20.1, previous: 18.6, unit: 'k €', decimals: 1, previousPeriod: '2024', better: 'higher' }))
      .toEqual({ text: '▲ 8.1% vs 2024', favourable: true })
  })

  it('judges a rise as bad news where lower is better', () => {
    expect(describeChange({ ...rate, value: 6.5, previous: 6.3, better: 'lower' }).favourable).toBe(false)
  })

  it('reports no change and no verdict when the figure did not move', () => {
    expect(describeChange({ ...rate, value: 6.3, previous: 6.3, better: 'lower' }))
      .toEqual({ text: 'Unchanged vs Aug 2026', favourable: null })
  })

  it('gives no verdict for a series without a better direction', () => {
    expect(describeChange({ value: 19.04, previous: 19.1, unit: 'M', decimals: 2, previousPeriod: '2025', better: null }).favourable)
      .toBeNull()
  })
})
