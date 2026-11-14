import '../styles/SourceBadge.css'

// Where a figure comes from. Each state has its own glyph and word, so it
// reads without color and never borrows the data-severity colors.
const STATES = {
  live:      { text: 'Live',      title: 'Real data, refreshed automatically' },
  demo:      { text: 'Demo',      title: 'Source unavailable: showing demo values' },
  simulated: { text: 'Simulated', title: 'Estimated values, not from a live source' },
  static:    { text: 'Static',    title: 'Entered by hand, not updated automatically' },
  error:     { text: 'Offline',   title: 'Source is not responding' },
  loading:   { text: 'Loading',   title: 'Waiting for the first response' },
}

const GLYPHS = {
  live: (
    <>
      <rect className="srcPulse" x="2" y="2" width="6" height="6" rx="1" />
      <rect x="2" y="2" width="6" height="6" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  demo:      <rect x="2" y="2" width="6" height="6" rx="1" />,
  simulated: <path d="M2 2h6v6h-6zM2 6l4-4M4 8l4-4" />,
  static:    <path d="M1.5 5h7" strokeWidth="2" />,
  error:     <path d="M2 2l6 6M8 2l-6 6" strokeWidth="1.5" />,
  loading:   <circle className="srcSpin" cx="5" cy="5" r="3.25" strokeDasharray="12 9" />,
}

/** Glyph plus word stating whether the data shown is live, demo, simulated or static. */
export default function SourceBadge({ source }) {
  const state = STATES[source]
  if (!state) return null
  return (
    <span className={`srcBadge srcBadge--${source}`} title={state.title}>
      <svg className="srcGlyph" viewBox="0 0 10 10" fill="none" stroke="currentColor" aria-hidden="true">
        {GLYPHS[source]}
      </svg>
      {state.text}
    </span>
  )
}
