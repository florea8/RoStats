import { describe, it, expect } from 'vitest'
import { describeRoad, TRAFFIC_STATES, TRAFFIC_STATE_BY_KEY } from './traffic'
import { PALETTE } from './colors'

describe('describeRoad', () => {
  it('finds the label and map path by id, and the code from the name', () => {
    const road = describeRoad({ id: 'a1-west', name: 'A1  SIBIU – TIMIȘOARA', status: 'SLOW' })
    expect(road.code).toBe('A1')
    expect(road.label).toBe('A1 Sibiu – Timișoara')
    expect(road.path.length).toBeGreaterThan(1)
    expect(road.state).toBe(TRAFFIC_STATE_BY_KEY.SLOW)
  })

  it('tells apart two stretches of the same motorway', () => {
    const east = describeRoad({ id: 'a1-east', name: 'A1  BUC – PITEȘTI', status: 'FREE' })
    const west = describeRoad({ id: 'a1-west', name: 'A1  SIBIU – TIMIȘOARA', status: 'FREE' })
    expect(east.code).toBe(west.code)
    expect(east.path).not.toEqual(west.path)
  })

  it('passes measured speeds through', () => {
    const road = describeRoad({ id: 'a2', name: 'A2  BUC – CONSTANȚA', status: 'FREE', speed: 118, freeFlow: 127 })
    expect(road).toMatchObject({ speed: 118, freeFlow: 127 })
  })

  it('falls back to the API name and a muted state for unknown roads', () => {
    const road = describeRoad({ id: 'dn99', name: 'DN99 NOWHERE', status: 'CLOSED' })
    expect(road.label).toBe('DN99 NOWHERE')
    expect(road.path).toBeNull()
    expect(road.state).toEqual({ key: 'CLOSED', label: 'CLOSED', color: PALETTE.muted })
  })
})

describe('TRAFFIC_STATES', () => {
  it('runs from free to congested, as the legend reads', () => {
    expect(TRAFFIC_STATES.map(s => s.key)).toEqual(['FREE', 'SLOW', 'HEAVY'])
  })
})
