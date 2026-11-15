import { magColor } from '../../utils/colors'
import { REPLAY_DAYS, REPLAY_S, quakeMoment } from '../../utils/replay'

const WIDTH = 1000         // drawn on a 1000 × 100 grid and stretched to fit
const MID = 50
const FULL_SCALE = 6       // magnitude that reaches the edge of the strip

/**
 * The last 30 days as a seismograph strip: one stroke per earthquake, placed
 * at its time and as tall as its magnitude. A pen crosses the strip and each
 * stroke is drawn as the pen reaches it, while the same events fire on the
 * map (see replay.js).
 *
 * replayId / onReplay: the current replay and the way to start a new one
 */
export default function Seismogram({ quakes, now, replayId, onReplay }) {
  const events = quakes.map(q => ({ ...q, at: quakeMoment(q, now) }))
  const strongest = events.reduce((max, q) => Math.max(max, q.magnitude), 0)

  return (
    <figure className="seismo">
      <figcaption className="seismoHead">
        <span className="label">Activity · last {REPLAY_DAYS} days · peak M {strongest.toFixed(1)}</span>
        <button type="button" className="replayBtn" onClick={onReplay}>
          <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>
          Replay
        </button>
      </figcaption>

      {/* Keyed by the replay, so its animations start over with each one. */}
      <div className="seismoPlot" key={replayId}>
        <svg
          className="seismoSvg"
          viewBox={`0 0 ${WIDTH} 100`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`${events.length} earthquakes in the last ${REPLAY_DAYS} days, the strongest of magnitude ${strongest.toFixed(1)}.`}
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
                style={{ animationDelay: `${q.at * REPLAY_S}s` }}
              />
            )
          })}
        </svg>
        <span className="seismoPen" style={{ animationDuration: `${REPLAY_S}s` }} aria-hidden="true" />
      </div>

      <div className="seismoSpan label" aria-hidden="true">
        <span>{REPLAY_DAYS} days ago</span>
        <span>Now</span>
      </div>
    </figure>
  )
}
