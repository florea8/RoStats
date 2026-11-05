// Literal hex values of the :root color tokens in index.css. Leaflet markers
// and canvas charts can't resolve var(--…), so JS colors come from here.
export const PALETTE = {
  green:  '#1de9a0',
  amber:  '#fbbf24',
  red:    '#f87171',
  blue:   '#4facfe',
  sky:    '#93c5fd',
  teal:   '#00f0c8',
  violet: '#c4b5fd',
  muted:  '#567898',
}

/** Hex color plus alpha (0–1) as rgba(), for translucent fills. */
export function withAlpha(hex, alpha) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

// Each scale drives both the colors and the map legend, so they can't drift apart.
// Levels are ordered from highest to lowest threshold.
export const MAG_LEVELS = [
  { min: 4,         color: PALETTE.red,   label: 'M ≥ 4' },
  { min: 3,         color: PALETTE.amber, label: 'M 3–4' },
  { min: -Infinity, color: PALETTE.green, label: 'M < 3' },
]

export const AQI_LEVELS = [
  { min: 151,       color: PALETTE.violet, tag: 'PERICOL', label: 'Periculos (>150)' },
  { min: 101,       color: PALETTE.red,   tag: 'RIDICAT', label: 'Ridicat (101–150)' },
  { min: 51,        color: PALETTE.amber, tag: 'MODERAT', label: 'Moderat (51–100)' },
  { min: -Infinity, color: PALETTE.green, tag: 'BUN',     label: 'Bun (≤50)' },
]

export const TEMP_LEVELS = [
  { min: 30,        color: PALETTE.red,   label: '≥ 30°C' },
  { min: 20,        color: PALETTE.amber, label: '20–30°C' },
  { min: 10,        color: PALETTE.green, label: '10–20°C' },
  { min: 0,         color: PALETTE.blue,  label: '0–10°C' },
  { min: -Infinity, color: PALETTE.sky,   label: '< 0°C' },
]

const level = (levels, value) => levels.find(l => value >= l.min)

export const magColor  = m => level(MAG_LEVELS, m).color
export const aqiColor  = v => level(AQI_LEVELS, v).color
export const aqiTag    = v => level(AQI_LEVELS, v).tag
export const tempColor = t => level(TEMP_LEVELS, t).color
