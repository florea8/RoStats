export function magColor(m) {
  if (m >= 4) return 'var(--red)';
  if (m >= 3) return 'var(--warn)';
  return 'var(--a)';
}

export function magHex(m) {
  if (m >= 4) return '#ff3b3b';
  if (m >= 3) return '#f5a400';
  return '#00e0aa';
}

export function aqiColor(v) {
  if (v <= 50)  return 'var(--a)';
  if (v <= 100) return 'var(--warn)';
  return 'var(--red)';
}

export function aqiHex(v) {
  if (v <= 50)  return '#00e0aa';
  if (v <= 100) return '#f5a400';
  return '#ff3b3b';
}

export function aqiTag(v) {
  if (v <= 50)  return 'BUN';
  if (v <= 100) return 'MODERAT';
  if (v <= 150) return 'RIDICAT';
  return 'PERICOL';
}
