import { PALETTE } from './colors'

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
  brasov:     [45.6427, 25.5887],
  pitesti:    [44.8565, 24.8692],
  fetesti:    [44.3800, 27.8300],
  constanta:  [44.1733, 28.6383],
  valcea:     [45.0997, 24.3693],
  sibiu:      [45.7983, 24.1256],
  sebes:      [45.9560, 23.5700],
  deva:       [45.8800, 22.9100],
  lugoj:      [45.6900, 21.9000],
  timisoara:  [45.7489, 21.2087],
  albaIulia:  [46.0700, 23.5800],
  aiud:       [46.3100, 23.7200],
  turda:      [46.5700, 23.7800],
  buzau:      [45.1500, 26.8200],
  focsani:    [45.7000, 27.1800],
  adjud:      [46.1000, 27.1800],
  bacau:      [46.5672, 26.9138],
}

// Schematic paths through a few waypoints: enough to place each road on the
// map, not a survey of its real course.
// Keyed by the road id from /api/traffic: one motorway can appear as two
// stretches (the A1 east and west of the Carpathians), so the number alone
// is not enough.
const ROUTES = {
  'a1-east': { label: 'A1 Bucharest – Pitești',     path: [P.bucharest, P.pitesti] },
  'a1-west': { label: 'A1 Sibiu – Timișoara',       path: [P.sibiu, P.sebes, P.deva, P.lugoj, P.timisoara] },
  'a2':      { label: 'A2 Bucharest – Constanța',   path: [P.bucharest, P.fetesti, P.constanta] },
  'a3':      { label: 'A3 Bucharest – Ploiești',    path: [P.bucharest, P.snagov, P.ploiestiE] },
  'a7':      { label: 'A7 Ploiești – Bacău',        path: [P.ploiestiE, P.buzau, P.focsani, P.adjud, P.bacau] },
  'a10':     { label: 'A10 Sebeș – Turda',          path: [P.sebes, P.albaIulia, P.aiud, P.turda] },
  'dn1':     { label: 'DN1 Bucharest – Brașov',     path: [P.bucharest, P.otopeni, P.ploiestiW, P.sinaia, P.brasov] },
  'dn7':     { label: 'DN7 Râmnicu Vâlcea – Sibiu', path: [P.valcea, P.sibiu] },
}

/**
 * Display label and map path for a road from useTraffic, matched by its id;
 * the road number is the first word of its name (e.g. "A1" or "DN7").
 */
export function describeRoad(road) {
  const code = road.name.split(/\s+/)[0]
  const route = ROUTES[road.id]
  return {
    id: road.id,
    code,
    label: route?.label ?? road.name,
    path:  route?.path ?? null,
    state: TRAFFIC_STATE_BY_KEY[road.status] ?? { key: road.status, label: road.status, color: PALETTE.muted },
    // Measured speeds (km/h), present only when the data is live.
    speed:    road.speed,
    freeFlow: road.freeFlow,
  }
}
