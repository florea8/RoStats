// STATIC: entered by hand from INS publications (labelled as such in the UI).
// `favourable` says whether the latest change is good news for the country.
export const INDICATORS = [
  { id: 'unemployment', label: 'Unemployment',      value: '5.4',  unit: '%',     change: '▲ 0.2 vs Q3',    favourable: false },
  { id: 'inflation',    label: 'Inflation',         value: '5.1',  unit: '%',     change: '▼ 1.3 vs Q3',    favourable: true },
  { id: 'salary',       label: 'Net salary',        value: '5.18', unit: 'k RON', change: '▲ 8.2% y/y',     favourable: true },
  { id: 'gdp',          label: 'GDP per capita',    value: '14.8', unit: 'k €',   change: '▲ 3.1% vs 2022', favourable: true },
  { id: 'industry',     label: 'Industrial output', value: '+2.1', unit: '%',     change: '▲ 0.4 vs Q3',    favourable: true },
  { id: 'deficit',      label: 'Budget deficit',    value: '6.2',  unit: '%',     change: '▲ 0.8 vs Q3',    favourable: false },
]
