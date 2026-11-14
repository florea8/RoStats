import { magColor } from '../../utils/colors'

const DAY_MS = 86400000
const DAYS = 30
const WIDTH = 1000         // drawn on a 1000 × 100 grid and stretched to fit
const MID = 50
const FULL_SCALE = 6       // magnitude that reaches the edge of the strip
const SWEEP_S = 1.1        // time the trace takes to draw, left to right

/**
 * The last 30 days as a seismograph strip: one stroke per earthquake, placed
 * at its time and as tall as its magnitude. Strokes appear in the order the
 * events happened.
 */
export default function Seismogram({ quakes, now }) {
  const start = now - DAYS * DAY_MS
  const events = quakes
    .map(q => ({ ...q, at: (Date.parse(q.time) - start) / (DAYS * DAY_MS) }))
    .filter(q => q.at >= 0 && q.at <= 1)
  const strongest = events.reduce((max, q) => Math.max(max, q.magnitude), 0)

  return (
    <figure className="seismo">
      <figcaption className="seismoHead">
        <span className="label">Activity · last 30 days</span>
        {events.length > 0 && <span className="seismoPeak">Peak M {strongest.toFixed(1)}</span>}
      </figcaption>

      <div className="seismoPlot">
        <svg
          className="seismoSvg"
          viewBox={`0 0 ${WIDTH} 100`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`${events.length} earthquakes in the last 30 days, the strongest of magnitude ${strongest.toFixed(1)}.`}
        >
          {/* One tick every five days. */}
          {[1, 2, 3, 4, 5].map(i => (
            <line key={i} className="seismoTick" x1={(i / 6) * WIDTH} x2={(i / 6) * WIDTH} y1="0" y2="100" />
          ))}
          <line className="seismoBase" x1="0" x2={WIDTH} y1={MID} y2={MID} />
          {events.map(q => {
            const reach = Math.min(1, q.magnitude / FULL_SCALE) * MID
            return (
              <line
                key={q.id}
                className="seismoStroke"
                x1={q.at * WIDTH}
                x2={q.at * WIDTH}
                y1={MID - reach}
                y2={MID + reach}
                stroke={magColor(q.magnitude)}
                style={{ animationDelay: `${q.at * SWEEP_S}s` }}
              />
            )
          })}
        </svg>
        <span className="seismoNow" aria-hidden="true" />
      </div>

      <div className="seismoSpan label" aria-hidden="true">
        <span>30 days ago</span>
        <span>Now</span>
      </div>
    </figure>
  )
}
