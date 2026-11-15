const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Eurostat period code as text: "2026-09" → "Sep 2026", "2026-Q3" → "Q3 2026", "2025" → "2025". */
export function periodLabel(period) {
  const month = /^(\d{4})-(\d{2})$/.exec(period)
  if (month) return `${MONTHS[Number(month[2]) - 1]} ${month[1]}`
  const quarter = /^(\d{4})-(Q\d)$/.exec(period)
  if (quarter) return `${quarter[2]} ${quarter[1]}`
  return period
}

/** Sign and magnitude to show: a minus for negative values, a plus only where the series is a rate of change. */
export function splitSign({ value, signed }) {
  const sign = value < 0 ? '−' : signed && value > 0 ? '+' : ''
  return { sign, number: Math.abs(value) }
}

/**
 * Change since the previous period, and whether it is good news.
 * Rates (units in %) change by points; amounts change by a percentage.
 * favourable is null when the figure did not move or has no better direction.
 */
export function describeChange({ value, previous, previousPeriod, unit, decimals, better }) {
  const since = `vs ${periodLabel(previousPeriod)}`
  const diff = value - previous
  if (Math.abs(diff) < 0.5 * 10 ** -decimals) return { text: `Unchanged ${since}`, favourable: null }

  const arrow = diff > 0 ? '▲' : '▼'
  const amount = unit.startsWith('%')
    ? `${Math.abs(diff).toFixed(decimals)} pts`
    : `${Math.abs((diff / previous) * 100).toFixed(1)}%`
  const favourable = better === 'higher' ? diff > 0 : better === 'lower' ? diff < 0 : null
  return { text: `${arrow} ${amount} ${since}`, favourable }
}
