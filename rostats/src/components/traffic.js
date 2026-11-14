import { PALETTE } from '../utils/colors'

// Ordered from free to congested; drives the table, the map lines and the legend.
export const TRAFFIC_STATES = [
  { key: 'FREE',  label: 'Free flow', color: PALETTE.sage },
  { key: 'SLOW',  label: 'Slow',      color: PALETTE.ochre },
  { key: 'HEAVY', label: 'Heavy',     color: PALETTE.crimson },
]

export const TRAFFIC_STATE_BY_KEY = Object.fromEntries(TRAFFIC_STATES.map(s => [s.key, s]))

const P = {
  bucharest:  [44.4268, 26.1025],
  otopeni:    [44.5500, 26.0700],
  snagov:     [44.7000, 26.1800],
  ploiestiW:  [44.9400, 25.9800],
  ploiestiE:  [44.9600, 26.1000],
  sinaia:     [45.3500, 25.5500],
  cheia:      [45.4600, 25.9400],
  brasov:     [45.6427, 25.5887],
  sighisoara: [46.2197, 24.7964],
  tgMures:    [46.5386, 24.5514],
  cluj:       [46.7712, 23.6236],
  pitesti:    [44.8565, 24.8692],
  fetesti:    [44.3800, 27.8300],
  constanta:  [44.1733, 28.6383],
  valcea:     [45.0997, 24.3693],
  sibiu:      [45.7983, 24.1256],
}

// Schematic paths through a few waypoints: enough to place each road on the
// map, not a survey of its real course.
const ROUTES = {
  A1:  { label: 'A1 Bucharest – Pitești',      path: [P.bucharest, P.pitesti] },
  A2:  { label: 'A2 Bucharest – Constanța',    path: [P.bucharest, P.fetesti, P.constanta] },
  A3:  { label: 'A3 Bucharest – Cluj-Napoca',  path: [P.bucharest, P.snagov, P.ploiestiE, P.cheia, P.brasov, P.sighisoara, P.tgMures, P.cluj] },
  DN1: { label: 'DN1 Bucharest – Brașov',      path: [P.bucharest, P.otopeni, P.ploiestiW, P.sinaia, P.brasov] },
  DN7: { label: 'DN7 Râmnicu Vâlcea – Sibiu',  path: [P.valcea, P.sibiu] },
}

/**
 * Display label and map path for a road from useTraffic, matched by its road
 * number (the first word of the name, e.g. "A1" or "DN7").
 */
export function describeRoad(road) {
  const code = road.name.split(/\s+/)[0]
  const route = ROUTES[code]
  return {
    code,
    label: route?.label ?? road.name,
    path:  route?.path ?? null,
    state: TRAFFIC_STATE_BY_KEY[road.status] ?? { key: road.status, label: road.status, color: PALETTE.muted },
  }
}
