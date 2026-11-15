import { describe, it, expect } from 'vitest'
import { nearCity } from './geo'

describe('nearCity', () => {
  it('names the city itself when the point is within 5 km of it', () => {
    expect(nearCity(44.4268, 26.1025)).toBe('Bucharest')
    expect(nearCity(44.45, 26.12)).toBe('Bucharest')
  })

  it('gives distance and compass direction from the nearest city', () => {
    // Half a degree of latitude north of Cluj-Napoca is about 56 km.
    expect(nearCity(47.2712, 23.6236)).toBe('56 km N of Cluj-Napoca')
    // Out at sea, east of Constanța.
    expect(nearCity(44.1733, 29.0)).toBe('29 km E of Constanța')
  })

  it('measures from the nearest city, not the first one in the list', () => {
    // Bucharest comes first in the list; Brașov is much closer.
    expect(nearCity(45.5, 25.9)).toMatch(/ of Brașov$/)
  })
})
