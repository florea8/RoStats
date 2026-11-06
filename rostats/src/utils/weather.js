// Short aviation-style code for an OpenWeatherMap description.
// Order matters: "few clouds" must be checked before the generic "cloud".
const RULES = [
  ['TSTM', ['thunder', 'storm']],
  ['SNW',  ['snow', 'sleet']],
  ['RAIN', ['rain', 'drizzle', 'shower']],
  ['FOG',  ['fog', 'mist', 'haze']],
  ['WIND', ['wind']],
  ['OVC',  ['overcast']],
  ['FEW',  ['few clouds', 'partly']],
  ['CLD',  ['cloud']],
  ['CLR',  ['clear']],
]

export function wxCode(description) {
  if (!description) return 'VAR'
  const d = description.toLowerCase()
  const match = RULES.find(([, words]) => words.some(w => d.includes(w)))
  return match ? match[0] : 'VAR'
}
