import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  PALETTE, MAG_LEVELS, AQI_LEVELS, TEMP_LEVELS,
  magColor, aqiColor, aqiTag, tempColor,
} from '../utils/colors'
import { CITIES } from '../data/cities'
import { timeAgo } from '../utils/time'
import '../styles/MapCenter.css'

function Legend({ title, levels }) {
  return (
    <div className="legSection">
      <div className="legTitle">{title}</div>
      {levels.map(l => (
        <div className="leg" key={l.label}><span className="ldot" style={{ background: l.color }} />{l.label}</div>
      ))}
    </div>
  )
}

function mkIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:11px;height:11px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.55);box-shadow:0 0 0 3px ${color}33,0 0 14px ${color}66;"></div>`,
    iconSize: [11, 11],
    iconAnchor: [5, 5],
  })
}

function CoordTracker({ setCoords }) {
  useMapEvents({
    mousemove(e) {
      setCoords(`${e.latlng.lat.toFixed(3)}° N  ${e.latlng.lng.toFixed(3)}° E`)
    },
  })
  return null
}

export default function MapCenter({ earthquakes, aqi, weather, activeSection }) {
  const [coords, setCoords] = useState('45.940° N  24.970° E')
  const { data: quakes } = earthquakes
  const { data: aqiData } = aqi
  const { data: wxData } = weather

  // "Last 24h" is measured from when the data was fetched, which keeps render pure.
  const fetchedAt = earthquakes.dataUpdatedAt
  const last24h   = quakes?.filter(q => fetchedAt - q.properties.time < 86400000) ?? []
  const maxMag24h = last24h.length > 0 ? Math.max(...last24h.map(q => parseFloat(q.properties.mag))) : null
  const latestQ   = quakes?.[0]

  return (
    <div className="mapCenter boot-fade d3">

      {/* ── MAP PANE ── */}
      <div className="mapPane">
        <MapContainer
          center={[45.94, 24.97]}
          zoom={7}
          minZoom={6}
          maxZoom={12}
          maxBounds={[[43.3, 19.7], [48.6, 30.3]]}
          maxBoundsViscosity={1.0}
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" maxZoom={19} attribution="&copy; CartoDB" />
          <CoordTracker setCoords={setCoords} />

          {/* ── Seismic markers ── */}
          {activeSection === 'seismic' && quakes?.slice(0, 12).map((q, i) => {
            const p   = q.properties
            const mag = parseFloat(p.mag)
            const dep = q.depth_km
            const loc = p.place ?? '—'
            const r   = mag >= 4 ? 10 : mag >= 3 ? 7 : 4
            return (
              <CircleMarker
                key={i}
                center={[q.geometry.coordinates[1], q.geometry.coordinates[0]]}
                radius={r}
                pathOptions={{ color: magColor(mag), fillColor: magColor(mag), fillOpacity: 0.85, weight: 1.5 }}
              >
                <Popup>
                  <div className="popup-head">CUTREMUR M{mag.toFixed(1)}</div>
                  <div className="popup-row"><span>LOCAȚIE</span><span>{loc}</span></div>
                  <div className="popup-row"><span>ADÂNCIME</span><span>{dep} km</span></div>
                  <div className="popup-row"><span>TIMP</span><span>{timeAgo(p.time)}</span></div>
                </Popup>
              </CircleMarker>
            )
          })}

          {/* ── AQI markers ── */}
          {activeSection === 'aqi' && CITIES.map(c => {
            const v = aqiData?.[c.id]
            const color = v != null ? aqiColor(v) : PALETTE.muted
            return (
              <Marker key={c.id} position={[c.lat, c.lng]} icon={mkIcon(color)}>
                <Popup>
                  <div className="popup-head">{c.label}</div>
                  <div className="popup-row"><span>AQI</span><span>{v ?? '—'}</span></div>
                  <div className="popup-row"><span>CALITATE</span><span>{v ? aqiTag(v) : '—'}</span></div>
                </Popup>
              </Marker>
            )
          })}

          {/* ── Weather markers ── */}
          {activeSection === 'weather' && CITIES.map(c => {
            const w = wxData?.[c.id]
            const t = w?.temp
            const color = t != null ? tempColor(t) : PALETTE.muted
            return (
              <Marker key={c.id} position={[c.lat, c.lng]} icon={mkIcon(color)}>
                <Popup>
                  <div className="popup-head">{c.label}</div>
                  <div className="popup-row"><span>TEMP</span><span>{t != null ? `${t}°C` : '—'}</span></div>
                  <div className="popup-row"><span>VREME</span><span>{w?.description ?? '—'}</span></div>
                  <div className="popup-row"><span>UMIDITATE</span><span>{w?.humidity != null ? `${w.humidity}%` : '—'}</span></div>
                  <div className="popup-row"><span>VÂNT</span><span>{w?.wind != null ? `${w.wind} m/s` : '—'}</span></div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>

        <div className="mapChip mapChipTitle">HARTA INTERACTIVĂ · ROMÂNIA</div>
        <div className="mapChip mapChipCoords">{coords}</div>

        <div className="mapLegend">
          {activeSection === 'seismic' && <Legend title="MAGNITUDINE" levels={MAG_LEVELS} />}
          {activeSection === 'aqi'     && <Legend title="AQI ORAȘ"    levels={AQI_LEVELS} />}
          {activeSection === 'weather' && <Legend title="TEMPERATURĂ" levels={TEMP_LEVELS} />}
        </div>
      </div>

      {/* ── DATA PANEL ── */}
      <div className="mapDataPanel">

        {/* Col 1 — Seismic */}
        <div className="mdpCol">
          <div className="mdpColHead">ACTIVITATE SEISMICĂ · 24H</div>
          <div className="mdpSeismicStats">
            <div className="mdpStat">
              <div className="mdpStatVal" style={{
                color: last24h.length > 10 ? 'var(--red)' : last24h.length > 5 ? 'var(--amber)' : 'var(--green)',
              }}>{last24h.length}</div>
              <div className="mdpStatLabel">EVENIMENTE</div>
            </div>
            <div className="mdpStat">
              <div className="mdpStatVal" style={{
                color: maxMag24h ? magColor(maxMag24h) : 'var(--txt4)',
              }}>{maxMag24h ? `M ${maxMag24h.toFixed(1)}` : '—'}</div>
              <div className="mdpStatLabel">MAG MAX</div>
            </div>
            <div className="mdpStat">
              <div className="mdpStatVal" style={{ color: 'var(--txt2)' }}>{quakes?.length ?? '—'}</div>
              <div className="mdpStatLabel">TOTAL 30Z</div>
            </div>
          </div>
          {latestQ && (
            <div className="mdpLatestQuake">
              <span className="mdpLqMag" style={{ color: magColor(parseFloat(latestQ.properties.mag)) }}>
                M{parseFloat(latestQ.properties.mag).toFixed(1)}
              </span>
              <span className="mdpLqLoc">
                {latestQ.properties.place?.substring(0, 24) ?? '—'}
              </span>
              <span className="mdpLqTime">{timeAgo(latestQ.properties.time)}</span>
            </div>
          )}
        </div>

        <div className="mdpDivider" />

        {/* Col 2 — AQI */}
        <div className="mdpCol">
          <div className="mdpColHead">CALITATEA AERULUI · AQI</div>
          <div className="mdpAqiList">
            {CITIES.map(c => {
              const v = aqiData?.[c.id]
              if (v == null) return null
              const color = aqiColor(v)
              const pct   = Math.min(100, (v / 150) * 100)
              return (
                <div className="mdpAqiRow" key={c.id}>
                  <span className="mdpAqiCity">{c.short}</span>
                  <div className="mdpAqiBarWrap">
                    <div className="mdpAqiBarFill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="mdpAqiVal" style={{ color }}>{v}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mdpDivider" />

        {/* Col 3 — Weather */}
        <div className="mdpCol">
          <div className="mdpColHead">TEMPERATURI · °C</div>
          <div className="mdpWxList">
            {CITIES.map(c => {
              const w = wxData?.[c.id]
              return (
                <div className="mdpWxRow" key={c.id}>
                  <span className="mdpWxCity">{c.label}</span>
                  <span className="mdpWxDesc">{w?.description?.substring(0, 11) ?? '—'}</span>
                  <span className="mdpWxTemp" style={{
                    color: w ? tempColor(w.temp) : 'var(--txt4)',
                  }}>{w ? `${w.temp}°` : '—'}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
