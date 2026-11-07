import { aqiColor, aqiTag, magColor } from '../utils/colors'
import '../styles/MetricsStrip.css'

export default function MetricsStrip({ earthquakes, weather, aqi }) {
  const latestEq = earthquakes.data?.[0]
  const bucWeather = weather.data?.bucuresti
  const bucAqi = aqi.data?.bucuresti

  const eqMag = latestEq ? latestEq.magnitude.toFixed(1) : '—'

  return (
    <div className="metrics boot-fade d1">
      <div className="metric">
        <div className="mLabel">air quality · buc</div>
        <div className="mVal c-txt" style={bucAqi != null ? { color: aqiColor(bucAqi) } : undefined}>
          {bucAqi ?? '—'}
        </div>
        <div className="mSub">
          AQI · {bucAqi ? aqiTag(bucAqi).toLowerCase() : 'loading'}
        </div>
      </div>

      <div className="metric">
        <div className="mLabel">latest earthquake</div>
        <div className="mVal c-txt" style={latestEq ? { color: magColor(latestEq.magnitude) } : undefined}>
          {latestEq ? `M ${eqMag}` : '—'}
        </div>
        <div className="mSub">
          {latestEq
            ? (latestEq.place ?? 'ROMANIA').substring(0, 22)
            : 'loading'}
        </div>
      </div>

      <div className="metric">
        <div className="mLabel">temperature · buc</div>
        <div className="mVal c-a2">
          {bucWeather ? `${bucWeather.temp}°` : '—'}
        </div>
        <div className="mSub">
          {bucWeather?.description ?? 'loading'}
        </div>
      </div>

      <div className="metric">
        <div className="mLabel">population ro</div>
        <div className="mVal c-txt">
          19.0<span style={{ fontSize: 16, fontWeight: 400 }}> M</span>
        </div>
        <div className="mSub">census 2021</div>
      </div>

      <div className="metric">
        <div className="mLabel">active counties</div>
        <div className="mVal c-txt">
          41<span style={{ fontSize: 16, fontWeight: 400 }}> +1</span>
        </div>
        <div className="mSub">+ Municipality Bucharest</div>
      </div>
    </div>
  )
}
