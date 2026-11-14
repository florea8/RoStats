import { wxCode } from '../utils/weather'

const CLOUD = 'M7.5 18.5h9.75a3.75 3.75 0 0 0 .6-7.45 5.25 5.25 0 0 0-10.1-1.2A4.4 4.4 0 0 0 7.5 18.5z'
const CLOUD_HIGH = 'M7.5 15.5h9.75a3.75 3.75 0 0 0 .6-7.45 5.25 5.25 0 0 0-10.1-1.2A4.4 4.4 0 0 0 7.5 15.5z'

const Sun = ({ cx = 12, cy = 12, r = 4 }) => (
  <g className="wxSun" style={{ transformOrigin: `${cx}px ${cy}px` }}>
    <circle cx={cx} cy={cy} r={r} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
      <path key={angle} d={`M${cx} ${cy - r - 2.25}v-2`} transform={`rotate(${angle} ${cx} ${cy})`} />
    ))}
  </g>
)

// One drawing per code from utils/weather. The moving part of each is the
// weather itself: rays turn, clouds drift, rain and snow fall, fog slides.
const DRAWINGS = {
  CLR:  <Sun />,
  FEW:  <><Sun cx={8.5} cy={8.5} r={3} /><path className="wxCloud wxFill" d={CLOUD} /></>,
  CLD:  <path className="wxCloud" d={CLOUD} />,
  OVC:  <><path className="wxCloud wxBack" d="M9 9.2a4.2 4.2 0 0 1 8.1.9" /><path className="wxCloud" d={CLOUD} /></>,
  RAIN: (
    <>
      <path d={CLOUD_HIGH} />
      <path className="wxDrop" d="M9 18l-.8 2" />
      <path className="wxDrop wxDrop--2" d="M12.5 18l-.8 2" />
      <path className="wxDrop wxDrop--3" d="M16 18l-.8 2" />
    </>
  ),
  SNW: (
    <>
      <path d={CLOUD_HIGH} />
      <path className="wxFlake" d="M9 19.5h.01" />
      <path className="wxFlake wxDrop--2" d="M12.5 19.5h.01" />
      <path className="wxFlake wxDrop--3" d="M16 19.5h.01" />
    </>
  ),
  TSTM: <><path d={CLOUD_HIGH} /><path className="wxBolt" d="M12.5 15.5l-2 3.25h3l-2 3.25" /></>,
  FOG: (
    <>
      <path className="wxMist" d="M4 8.5h12" />
      <path className="wxMist wxMist--2" d="M7 12h13" />
      <path className="wxMist" d="M4 15.5h11" />
    </>
  ),
  WIND: (
    <>
      <path className="wxMist" d="M3.5 9h10a2.25 2.25 0 1 0-2.2-2.8" />
      <path className="wxMist wxMist--2" d="M3.5 13h14a2.5 2.5 0 1 1-2.4 3.2" />
    </>
  ),
}

/** Small line drawing of the sky for a weather description. Decorative: the text is always beside it. */
export default function WeatherGlyph({ description, className = '' }) {
  return (
    <svg className={`wxGlyph ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {DRAWINGS[wxCode(description)] ?? DRAWINGS.CLD}
    </svg>
  )
}
