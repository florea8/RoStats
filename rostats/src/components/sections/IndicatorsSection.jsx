import SectionHeader from './SectionHeader'

// STATIC: entered manually from INS publications (labelled in the UI).
// `good` says whether the latest change is good news for the country.
const STATS = [
  { label: 'Unemployment',      value: '5.4',  unit: '%',     trend: '▲ 0.2 vs Q3',    good: false },
  { label: 'Inflation',         value: '5.1',  unit: '%',     trend: '▼ 1.3 vs Q3',    good: true },
  { label: 'Net Salary',        value: '5.18', unit: 'k RON', trend: '▲ 8.2% y/y',     good: true },
  { label: 'GDP per Capita',    value: '14.8', unit: 'k€',    trend: '▲ 3.1% vs 2022', good: true },
  { label: 'Industrial Output', value: '+2.1', unit: '%',     trend: '▲ 0.4 vs Q3',    good: true },
  { label: 'Budget Deficit',    value: '6.2',  unit: '%',     trend: '▲ 0.8 vs Q3',    good: false },
]

export default function IndicatorsSection() {
  return (
    <>
      <SectionHeader
        icon="indicators"
        title="National Indicators"
        subtitle="Economic data · INS Romania"
        source="static"
        href="https://insse.ro"
        linkLabel="INS"
      />

      <div className="msGrid">
        {STATS.map(s => (
          <div className="msCell" key={s.label}>
            <div className="msLabel">{s.label}</div>
            <div className="msVal" style={{ color: s.good ? 'var(--teal)' : 'var(--amber)' }}>
              {s.value}<span style={{ fontSize: 13 }}>{s.unit}</span>
            </div>
            <div className="msTrend" style={{ color: s.good ? 'var(--green)' : 'var(--red)' }}>{s.trend}</div>
          </div>
        ))}
      </div>

      <div className="trNote">
        Values entered manually from INS publications; they are not updated automatically.
      </div>
    </>
  )
}
