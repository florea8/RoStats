import { aqiTag } from '../utils/colors'

export default function MetricsStrip({ earthquakes, weather, aqi }) {
  const latestEq = earthquakes.data?.[0]
  const bucWeather = weather.data?.bucuresti
  const bucAqi = aqi.data?.bucuresti

  const eqMag = latestEq ? parseFloat(latestEq.properties.mag).toFixed(1) : '—'
  const eqColor = latestEq
    ? latestEq.properties.mag >= 4 ? 'c-red' : latestEq.properties.mag >= 3 ? 'c-warn' : 'c-a'
    : 'c-txt'

  return (
    <div className="metrics boot-fade d1">
      <div className="metric">
        <div className="m-label">air quality · buc</div>
        <div className={`m-val ${bucAqi <= 50 ? 'c-a' : bucAqi <= 100 ? 'c-warn' : 'c-red'}`}>
          {bucAqi ?? '—'}
        </div>
        <div className="m-sub">
          AQI · {bucAqi ? aqiTag(bucAqi).toLowerCase() : 'loading'}
        </div>
      </div>

      <div className="metric">
        <div className="m-label">latest earthquake</div>
        <div className={`m-val ${eqColor}`}>
          {latestEq ? `M ${eqMag}` : '—'}
        </div>
        <div className="m-sub">
          {latestEq
            ? (latestEq.properties.place?.split(' of ').pop() ?? 'Romania').substring(0, 22)
            : 'loading'}
        </div>
      </div>

      <div className="metric">
        <div className="m-label">temperature · buc</div>
        <div className="m-val c-a2">
          {bucWeather ? `${bucWeather.temp}°` : '—'}
        </div>
        <div className="m-sub">
          {bucWeather?.description ?? 'loading'}
        </div>
      </div>

      <div className="metric">
        <div className="m-label">population ro</div>
        <div className="m-val c-txt">
          19.0<span style={{ fontSize: 16, fontWeight: 400 }}> M</span>
        </div>
        <div className="m-sub">census 2021</div>
      </div>

      <div className="metric">
        <div className="m-label">active counties</div>
        <div className="m-val c-txt">
          41<span style={{ fontSize: 16, fontWeight: 400 }}> +1</span>
        </div>
        <div className="m-sub">+ Municipality Bucharest</div>
      </div>
    </div>
  )
}
