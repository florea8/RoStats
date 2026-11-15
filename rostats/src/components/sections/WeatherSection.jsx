import { tempColor } from '../../utils/colors'
import { CITIES } from '../../data/cities'
import { sentenceCase } from '../text'
import Odometer from '../Odometer'
import FocusRow from '../FocusRow'
import Swatch from '../Swatch'
import WeatherGlyph from '../WeatherGlyph'
import SectionHeader, { SectionSkeleton } from './SectionHeader'

export default function WeatherSection({ weather, focus, onFocus }) {
  const { data: wxData, isLoading, isError, source } = weather
  const now = wxData?.bucuresti

  return (
    <>
      <SectionHeader
        title="Weather"
        subtitle="Current conditions · six cities"
        source={isError ? 'error' : source}
        href="https://open-meteo.com/en/docs"
        linkLabel="Open-Meteo"
      />

      {isLoading && <SectionSkeleton label="Loading weather" />}
      {isError && <p className="stateMsg" role="alert">The weather API could not be reached.</p>}

      {now && (
        <div className="hero" data-spot>
          <div className="heroText">
            <p className="label">Bucharest, now</p>
            <p className="heroFigure display">
              <Odometer value={now.temp} />
              <span className="heroUnit heroUnit--after">°C</span>
            </p>
            <p className="heroNote">{sentenceCase(now.description)}</p>
          </div>
          <WeatherGlyph description={now.description} className="heroArt" />
        </div>
      )}

      {now && (
        <dl className="stats">
          <div className="stat">
            <dt className="label">Feels like</dt>
            <dd className="display">{now.feels_like}°</dd>
          </div>
          <div className="stat">
            <dt className="label">Humidity</dt>
            <dd className="display">{now.humidity}<span className="statUnit">%</span></dd>
          </div>
          <div className="stat">
            <dt className="label">Wind</dt>
            <dd className="display">{now.wind}<span className="statUnit">m/s</span></dd>
          </div>
        </dl>
      )}

      {source === 'demo' && (
        <p className="note">
          The weather source is unavailable, so these are demo values, not current readings.
        </p>
      )}

      {wxData && (
        <section className="list">
          <header className="listHead">
            <h3 className="label">Conditions by city</h3>
            <span className="listHint">Select one to find it on the map</span>
          </header>
          <ol className="rows">
            {CITIES.map(({ id, name, lat, lng }) => {
              const w = wxData[id]
              if (!w) return null
              return (
                <FocusRow
                  key={id}
                  id={`city-${id}`}
                  points={[[lat, lng]]}
                  focus={focus}
                  onFocus={onFocus}
                  className="row--wx"
                >
                  <WeatherGlyph description={w.description} />
                  <span className="rowMain">
                    <span className="rowTitle">{name}</span>
                    <span className="rowSub">{sentenceCase(w.description)}</span>
                  </span>
                  <span className="rowMeta">
                    <span><span className="visuallyHidden">Humidity </span>{w.humidity}%</span>
                    <span><span className="visuallyHidden">Wind </span>{w.wind} m/s</span>
                  </span>
                  <span className="rowValue display">
                    <Swatch color={tempColor(w.temp)} />{w.temp}°
                  </span>
                </FocusRow>
              )
            })}
          </ol>
        </section>
      )}
    </>
  )
}
