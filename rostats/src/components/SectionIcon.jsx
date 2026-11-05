// Line icons for the dashboard sections, shared by LeftNav and RightPanel.
const PATHS = {
  seismic: <polyline points="2 12 5 12 8 4 11 20 14 9 17 14 20 14 22 14" />,
  aqi: <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />,
  weather: <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />,
  traffic: (
    <>
      <rect x="9" y="2" width="6" height="15" rx="3" />
      <circle cx="12" cy="6"  r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="1.2" fill="currentColor" stroke="none" />
      <line x1="12" y1="17" x2="12" y2="22" />
      <line x1="8"  y1="22" x2="16" y2="22" />
    </>
  ),
  indicators: (
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
      <line x1="2"  y1="20" x2="22" y2="20" />
    </>
  ),
}

export default function SectionIcon({ id, size = 18, strokeWidth = 1.8 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      {PATHS[id]}
    </svg>
  )
}
