import { aqiTag } from '../utils/colors'
import '../styles/MetricsStrip.css'

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
        <div className="mLabel">air quality · buc</div>
        <div className={`mVal ${bucAqi <= 50 ? 'c-a' : bucAqi <= 100 ? 'c-warn' : 'c-red'}`}>
          {bucAqi ?? '—'}
        </div>
        <div className="mSub">
          AQI · {bucAqi ? aqiTag(bucAqi).toLowerCase() : 'loading'}
        </div>
      </div>

      <div className="metric">
        <div className="mLabel">latest earthquake</div>
        <div className={`mVal ${eqColor}`}>
          {latestEq ? `M ${eqMag}` : '—'}
        </div>
        <div className="mSub">
          {latestEq
            ? (latestEq.properties.place?.split(' of ').pop() ?? 'Romania').substring(0, 22)
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
