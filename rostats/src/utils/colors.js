// Data colors. These are the only saturated colors in the interface and they
// are applied from JS (swatches, bars, map markers), so this file is their
// single source; index.css holds only the neutrals.
// Every scale also steps in lightness, so adjacent levels stay apart under
// deuteranopia and protanopia. Markers are outlined in the page background
// so that overlapping ones stay separate on the dark map.
export const PALETTE = {
  // sequential, light to dark
  ochre:   '#FFD34D',
  orange:  '#FF8A1F',
  crimson: '#FF3B30',
  plum:    '#D946A8',
  sage:    '#5AD1B3',
  // diverging, cold to hot
  navy:    '#4F7CFF',
  steel:   '#7FC4FF',
  sand:    '#D9D3BD',
  apricot: '#FFA94D',
  brick:   '#FF5A47',
  // no data
  muted:   '#6B6D73',
  // outline of every swatch and marker; same value as --bg in index.css
  ink:     '#0C0D0F',
}

/** Hex color plus alpha (0–1) as rgba(), for translucent fills. */
export function withAlpha(hex, alpha) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

// Each scale drives both the colors and the map legend, so they can't drift apart.
// Levels are ordered from highest to lowest threshold.
export const MAG_LEVELS = [
  { min: 4,         color: PALETTE.crimson, label: 'M ≥ 4' },
  { min: 3,         color: PALETTE.orange,  label: 'M 3–4' },
  { min: -Infinity, color: PALETTE.ochre,   label: 'M < 3' },
]

export const AQI_LEVELS = [
  { min: 151,       color: PALETTE.plum,   tag: 'UNHEALTHY', label: 'Unhealthy (>150)' },
  { min: 101,       color: PALETTE.orange, tag: 'POOR',      label: 'Poor (101–150)' },
  { min: 51,        color: PALETTE.ochre,  tag: 'MODERATE',  label: 'Moderate (51–100)' },
  { min: -Infinity, color: PALETTE.sage,   tag: 'GOOD',      label: 'Good (≤50)' },
]

export const TEMP_LEVELS = [
  { min: 30,        color: PALETTE.brick,   label: '≥ 30°C' },
  { min: 20,        color: PALETTE.apricot, label: '20–30°C' },
  { min: 10,        color: PALETTE.sand,    label: '10–20°C' },
  { min: 0,         color: PALETTE.steel,   label: '0–10°C' },
  { min: -Infinity, color: PALETTE.navy,    label: '< 0°C' },
]

const level = (levels, value) => levels.find(l => value >= l.min)

export const magColor  = m => level(MAG_LEVELS, m).color
export const aqiColor  = v => level(AQI_LEVELS, v).color
export const aqiTag    = v => level(AQI_LEVELS, v).tag
export const tempColor = t => level(TEMP_LEVELS, t).color
