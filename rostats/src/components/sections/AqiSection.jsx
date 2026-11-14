import { AQI_LEVELS, aqiColor, aqiTag } from '../../utils/colors'
import { CITIES } from '../../data/cities'
import { sentenceCase } from '../text'
import CountUp from '../CountUp'
import FocusRow from '../FocusRow'
import Swatch from '../Swatch'
import SectionHeader, { SectionSkeleton } from './SectionHeader'
import TrendChart from './TrendChart'

// Bars and the scale are drawn up to the top of the "Poor" band plus one more
// band; higher values fill the track.
const SCALE_MAX = 200
const share = value => `${Math.min(100, (value / SCALE_MAX) * 100)}%`

// Lowest level first, each as wide as its range of the index.
const BANDS = [...AQI_LEVELS].reverse().map((level, i, all) => {
  const from = Math.max(0, level.min - 1)
  const to = all[i + 1] ? all[i + 1].min - 1 : SCALE_MAX
  return { ...level, width: `${((to - from) / SCALE_MAX) * 100}%` }
})

/** The index scale with a pointer where the reading sits. */
function AqiScale({ value }) {
  return (
    <div className="scale" aria-hidden="true">
      <div className="scaleTrack">
        {BANDS.map(band => (
          <span key={band.tag} className="scaleBand" style={{ width: band.width, background: band.color }} />
        ))}
        <span className="scalePointer" style={{ '--at': share(value) }} />
      </div>
      <div className="scaleMarks label">
        <span>0</span><span>50</span><span>100</span><span>150</span><span>200+</span>
      </div>
    </div>
  )
}

export default function AqiSection({ aqi, focus, onFocus }) {
  const { data: aqiData, aqiHistory, isLoading, isError, source } = aqi
  const now = aqiData?.bucuresti
  const readings = CITIES.filter(c => aqiData?.[c.id] != null)

  return (
    <>
      <SectionHeader
        title="Air quality"
        subtitle="US AQI · CAMS European model"
        source={isError ? 'error' : source}
        href="https://open-meteo.com/en/docs/air-quality-api"
        linkLabel="Open-Meteo"
      />

      {isLoading && <SectionSkeleton label="Loading air quality" />}
      {isError && <p className="stateMsg" role="alert">The air quality API could not be reached.</p>}

      {now != null && (
        <div className="hero hero--stacked">
          <div className="heroText">
            <p className="label">Bucharest, now</p>
            <p className="heroFigure display">
              <CountUp value={now} />
              <span className="heroTag" style={{ color: aqiColor(now) }}>{sentenceCase(aqiTag(now))}</span>
            </p>
          </div>
          <AqiScale value={now} />
        </div>
      )}

      {source === 'demo' && (
        <p className="note">
          The air quality source is unavailable, so these are demo values, not current readings.
        </p>
      )}

      {readings.length > 0 && (
        <section className="list">
          <header className="listHead">
            <h3 className="label">Index by city</h3>
            <span className="listHint">Select one to find it on the map</span>
          </header>
          <ol className="rows">
            {readings.map(({ id, name, lat, lng }, i) => {
              const v = aqiData[id]
              return (
                <FocusRow
                  key={id}
                  id={`city-${id}`}
                  points={[[lat, lng]]}
                  focus={focus}
                  onFocus={onFocus}
                  className="row--aqi"
                >
                  <span className="rowTitle">{name}</span>
                  <span className="bar">
                    <span
                      className="barFill"
                      style={{ width: share(v), background: aqiColor(v), animationDelay: `${i * 60}ms` }}
                    />
                  </span>
                  <span className="rowValue display">{v}</span>
                  <span className="rowLevel"><Swatch color={aqiColor(v)} />{sentenceCase(aqiTag(v))}</span>
                </FocusRow>
              )
            })}
          </ol>
        </section>
      )}

      <figure className="chartFigure">
        <figcaption className="listHead">
          <span className="label">Bucharest · hourly average, last 24 hours</span>
        </figcaption>
        {aqiHistory.length >= 2 ? (
          <TrendChart
            values={aqiHistory}
            startLabel="24 h ago"
            endLabel="Now"
            color={aqiColor(Number(aqiHistory.at(-1)))}
            summary={`Hourly AQI in Bucharest over the last 24 hours, from ${Math.round(aqiHistory[0])} to ${Math.round(aqiHistory.at(-1))}.`}
          />
        ) : (
          <p className="stateMsg">
            Not enough stored readings yet. One is saved every hour, so the trend appears after a few hours.
          </p>
        )}
      </figure>
    </>
  )
}
