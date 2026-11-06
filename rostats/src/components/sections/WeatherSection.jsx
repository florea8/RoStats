import { CITIES } from '../../data/cities'
import { wxCode } from '../../utils/weather'
import SectionHeader from './SectionHeader'

export default function WeatherSection({ weather }) {
  const { data: wxData, isLoading, isError, source } = weather

  return (
    <>
      <SectionHeader
        icon="weather"
        title="Weather"
        subtitle="Current conditions · major cities"
        source={isError ? 'error' : source}
        href="https://openweathermap.org"
        linkLabel="OWM"
      />

      {isLoading && <div className="loading"><div className="spin" />Loading weather…</div>}
      {isError && <div className="loading" style={{ color: 'var(--red)' }}>Could not reach the weather API</div>}

      <div className="wxGrid">
        {CITIES.map(({ id, label }) => {
          const w = wxData?.[id]
          return (
            <div className="wxCard" key={id}>
              <div className="wxCity">{label}</div>
              <div className="wxTempRow">
                <span className="wxCode">{wxCode(w?.description)}</span>
                <span className="wxTemp">{w ? `${w.temp}°` : '—'}</span>
              </div>
              <div className="wxDesc">{w?.description ?? '—'}</div>
              {w && <div className="wxMeta">HUM {w.humidity}% · WIND {w.wind} m/s</div>}
            </div>
          )
        })}
      </div>

      <div className="wxLegend">
        <div className="wxLegendItem"><span className="wxLegTag">HUM</span> Humidity</div>
        <div className="wxLegendItem"><span className="wxLegTag">WIND</span> Wind (m/s)</div>
        <div className="wxLegendItem"><span className="wxLegTag">°C</span> Temperature</div>
      </div>
    </>
  )
}
