import '../styles/SourceBadge.css'

const LABELS = {
  live:      { text: 'LIVE',    title: 'Real data, refreshed automatically' },
  demo:      { text: 'DEMO',    title: 'Source unavailable — showing demo values' },
  simulated: { text: 'SIMULATED', title: 'Estimated values, not from a live source' },
  static:    { text: 'STATIC',  title: 'Entered manually, not updated automatically' },
  error:     { text: 'OFFLINE', title: 'Source is not responding' },
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
