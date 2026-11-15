import { magColor } from '../../utils/colors'
import { summarize24h } from '../../utils/earthquakes'
import { timeAgo } from '../../utils/time'
import { nearCity } from '../../utils/geo'
import CountUp from '../CountUp'
import Odometer from '../Odometer'
import FocusRow from '../FocusRow'
import Swatch from '../Swatch'
import SectionHeader, { SectionSkeleton } from './SectionHeader'
import Seismogram from './Seismogram'

const ROWS = 12

/** Rings leaving a point: the same motion that marks the latest event on the map. */
function Waves({ color }) {
  return (
    <svg className="heroArt waves" viewBox="0 0 100 100" style={{ color }} aria-hidden="true">
      <circle className="wavesRing" cx="50" cy="50" r="46" />
      <circle className="wavesRing wavesRing--2" cx="50" cy="50" r="46" />
      <circle className="wavesRing wavesRing--3" cx="50" cy="50" r="46" />
      <circle className="wavesCore" cx="50" cy="50" r="5" />
    </svg>
  )
}

export default function SeismicSection({ earthquakes, focus, onFocus, replayId, onReplay }) {
  const { data: quakes, isLoading, isError, dataUpdatedAt } = earthquakes
  const latest = quakes?.[0]
  const day = quakes ? summarize24h(quakes, dataUpdatedAt) : null

  return (
    <>
      <SectionHeader
        title="Earthquakes"
        subtitle="Romania and its borders · last 30 days"
        source={isError ? 'error' : quakes && 'live'}
        href="https://www.emsc-csem.org"
        linkLabel="EMSC"
      />

      {isLoading && <SectionSkeleton label="Loading earthquakes" />}
      {isError && <p className="stateMsg" role="alert">EMSC could not be reached.</p>}
      {quakes?.length === 0 && <p className="stateMsg">No earthquakes recorded in the last 30 days.</p>}

      {latest && (
        <div className="hero" data-spot>
          <div className="heroText">
            <p className="label">Latest event</p>
            <p className="heroFigure display">
              <span className="heroUnit">M</span>
              <Odometer value={latest.magnitude} decimals={1} />
            </p>
            <p className="heroNote">
              {nearCity(latest.lat, latest.lng)}
              <span className="heroNoteDim">{timeAgo(latest.time)} · {latest.depth_km} km deep</span>
            </p>
          </div>
          <Waves color={magColor(latest.magnitude)} />
        </div>
      )}

      {quakes && (
        <dl className="stats">
          <div className="stat">
            <dt className="label">Events · 24 h</dt>
            <dd className="display"><CountUp value={day.count} /></dd>
          </div>
          <div className="stat">
            <dt className="label">Largest · 24 h</dt>
            <dd className="display">{day.maxMag != null ? `M ${day.maxMag.toFixed(1)}` : '—'}</dd>
          </div>
          <div className="stat">
            <dt className="label">Events · 30 d</dt>
            <dd className="display"><CountUp value={quakes.length} /></dd>
          </div>
        </dl>
      )}

      {quakes?.length > 0 && <Seismogram quakes={quakes} now={dataUpdatedAt} replayId={replayId} onReplay={onReplay} />}

      {quakes?.length > 0 && (
        <section className="list">
          <header className="listHead">
            <h3 className="label">Latest {Math.min(ROWS, quakes.length)} events</h3>
            <span className="listHint">Select one to find it on the map</span>
          </header>
          <ol className="rows">
            {quakes.slice(0, ROWS).map(q => (
              <FocusRow
                key={q.id}
                id={q.id}
                points={[[q.lat, q.lng]]}
                focus={focus}
                onFocus={onFocus}
                className="row--quake"
              >
                <span className="rowMag display">
                  <Swatch color={magColor(q.magnitude)} />
                  {q.magnitude.toFixed(1)}
                </span>
                <span className="rowMain">
                  <span className="rowTitle">{nearCity(q.lat, q.lng)}</span>
                  <span className="rowSub">{q.depth_km} km deep</span>
                </span>
                <time className="rowEnd" dateTime={q.time}>{timeAgo(q.time)}</time>
              </FocusRow>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}
