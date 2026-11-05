import '../styles/SourceBadge.css'

const LABELS = {
  live:      { text: 'LIVE',    title: 'Date reale, actualizate automat' },
  demo:      { text: 'DEMO',    title: 'Sursa nu este disponibilă — se afișează valori demonstrative' },
  simulated: { text: 'SIMULAT', title: 'Valori estimate, nu provin dintr-o sursă live' },
  static:    { text: 'STATIC',  title: 'Valori introduse manual, nu se actualizează automat' },
  error:     { text: 'OFFLINE', title: 'Sursa nu răspunde' },
}

/** Small pill that tells the viewer whether a panel shows real data. */
export default function SourceBadge({ source }) {
  const label = LABELS[source]
  if (!label) return null
  return (
    <span className={`srcBadge srcBadge--${source}`} title={label.title}>
      {label.text}
    </span>
  )
}
