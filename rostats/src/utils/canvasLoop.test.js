import { describe, it, expect } from 'vitest'
import { rand } from './canvasLoop'

describe('rand', () => {
  it('gives the same number for the same index, so particles keep their place', () => {
    expect(rand(7)).toBe(rand(7))
  })

  it('stays in [0, 1) and spreads out', () => {
    const values = Array.from({ length: 500 }, (_, i) => rand(i))
    expect(values.every(v => v >= 0 && v < 1)).toBe(true)
    // Roughly uniform: each half of the range gets a fair share.
    const low = values.filter(v => v < 0.5).length
    expect(low).toBeGreaterThan(200)
    expect(low).toBeLessThan(300)
  })
})
