export function magColor(m) {
  if (m >= 4) return 'var(--red)';
  if (m >= 3) return 'var(--warn)';
  return 'var(--a)';
}

export function magHex(m) {
  if (m >= 4) return '#ef4444';
  if (m >= 3) return '#f59e0b';
  return '#10b981';
}

export function aqiColor(v) {
  if (v <= 50)  return 'var(--green)';
  if (v <= 100) return 'var(--amber)';
  return 'var(--red)';
}

export function aqiHex(v) {
  if (v <= 50)  return '#10b981';
  if (v <= 100) return '#f59e0b';
  return '#ef4444';
}

export function aqiTag(v) {
  if (v <= 50)  return 'BUN';
  if (v <= 100) return 'MODERAT';
  if (v <= 150) return 'RIDICAT';
  return 'PERICOL';
}
