import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { magColor, magHex, aqiHex } from '../utils/colors'
import { timeAgo } from '../utils/time'
import '../styles/MapCenter.css'

const CITIES = [
  { name: 'București',   lat: 44.4268, lng: 26.1025, id: 'bucuresti' },
  { name: 'Cluj-Napoca', lat: 46.7712, lng: 23.6236, id: 'cluj' },
  { name: 'Timișoara',   lat: 45.7489, lng: 21.2087, id: 'timisoara' },
  { name: 'Iași',        lat: 47.1585, lng: 27.6014, id: 'iasi' },
  { name: 'Constanța',   lat: 44.1733, lng: 28.6383, id: 'constanta' },
  { name: 'Brașov',      lat: 45.6427, lng: 25.5887, id: 'brasov' },
  { name: 'Craiova',     lat: 44.3302, lng: 23.7949, id: 'craiova' },
  { name: 'Galați',      lat: 45.4353, lng: 28.0078, id: 'galati' },
]

const PANEL_CITIES = ['bucuresti', 'cluj', 'timisoara', 'iasi', 'constanta', 'brasov']
const CITY_SHORT = { bucuresti: 'BUC', cluj: 'CLJ', timisoara: 'TIM', iasi: 'IAS', constanta: 'CTN', brasov: 'BRV' }
const CITY_FULL  = { bucuresti: 'BUCUREȘTI', cluj: 'CLUJ', timisoara: 'TIMIȘOARA', iasi: 'IAȘI', constanta: 'CONSTANȚA', brasov: 'BRAȘOV' }

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

  const last24h   = quakes?.filter(q => Date.now() - q.properties.time < 86400000) ?? []
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
            const dep = Math.round(q.geometry.coordinates[2])
            const loc = p.place?.split(' of ').pop() ?? '—'
            const r   = mag >= 4 ? 10 : mag >= 3 ? 7 : 4
            return (
              <CircleMarker
                key={i}
                center={[q.geometry.coordinates[1], q.geometry.coordinates[0]]}
                radius={r}
                pathOptions={{ color: magHex(mag), fillColor: magHex(mag), fillOpacity: 0.85, weight: 1.5 }}
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
            const color = v ? (v <= 50 ? '#10b981' : v <= 100 ? '#f59e0b' : '#ef4444') : '#3b82f6'
            return (
              <Marker key={c.id} position={[c.lat, c.lng]} icon={mkIcon(color)}>
                <Popup>
                  <div className="popup-head">{c.name.toUpperCase()}</div>
                  <div className="popup-row"><span>AQI</span><span>{v ?? '—'}</span></div>
                  <div className="popup-row"><span>CALITATE</span><span>{v ? (v <= 50 ? 'Bun' : v <= 100 ? 'Moderat' : 'Ridicat') : '—'}</span></div>
                </Popup>
              </Marker>
            )
          })}

          {/* ── Weather markers ── */}
          {activeSection === 'weather' && CITIES.map(c => {
            const w = wxData?.[c.id]
            const t = w?.temp
            const color = t == null ? '#3b82f6' : t < 0 ? '#93c5fd' : t < 10 ? '#60a5fa' : t < 20 ? '#10b981' : t < 30 ? '#f59e0b' : '#ef4444'
            return (
              <Marker key={c.id} position={[c.lat, c.lng]} icon={mkIcon(color)}>
                <Popup>
                  <div className="popup-head">{c.name.toUpperCase()}</div>
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
          {activeSection === 'seismic' && (
            <div className="legSection">
              <div className="legTitle">MAGNITUDINE</div>
              {[['M ≥ 4', '#ef4444'], ['M 3–4', '#f59e0b'], ['M < 3', '#10b981']].map(([l, c]) => (
                <div className="leg" key={l}><span className="ldot" style={{ background: c }} />{l}</div>
              ))}
            </div>
          )}
          {activeSection === 'aqi' && (
            <div className="legSection">
              <div className="legTitle">AQI ORAȘ</div>
              {[['Bun (≤50)', '#10b981'], ['Moderat (≤100)', '#f59e0b'], ['Ridicat (>100)', '#ef4444']].map(([l, c]) => (
                <div className="leg" key={l}><span className="ldot" style={{ background: c }} />{l}</div>
              ))}
            </div>
          )}
          {activeSection === 'weather' && (
            <div className="legSection">
              <div className="legTitle">TEMPERATURĂ</div>
              {[['≥ 30°C', '#ef4444'], ['20–30°C', '#f59e0b'], ['10–20°C', '#10b981'], ['< 10°C', '#60a5fa']].map(([l, c]) => (
                <div className="leg" key={l}><span className="ldot" style={{ background: c }} />{l}</div>
              ))}
            </div>
          )}
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
                color: maxMag24h ? (maxMag24h >= 4 ? 'var(--red)' : maxMag24h >= 3 ? 'var(--amber)' : 'var(--teal)') : 'var(--txt4)',
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
              <span className="mdpLqMag" style={{ color: magHex(parseFloat(latestQ.properties.mag)) }}>
                M{parseFloat(latestQ.properties.mag).toFixed(1)}
              </span>
              <span className="mdpLqLoc">
                {latestQ.properties.place?.split(' of ').pop()?.substring(0, 24) ?? '—'}
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
            {PANEL_CITIES.map(id => {
              const v = aqiData?.[id]
              if (!v) return null
              const color = v <= 50 ? 'var(--green)' : v <= 100 ? 'var(--amber)' : 'var(--red)'
              const pct   = Math.min(100, (v / 150) * 100)
              return (
                <div className="mdpAqiRow" key={id}>
                  <span className="mdpAqiCity">{CITY_SHORT[id]}</span>
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
            {PANEL_CITIES.map(id => {
              const w = wxData?.[id]
              return (
                <div className="mdpWxRow" key={id}>
                  <span className="mdpWxCity">{CITY_FULL[id]}</span>
                  <span className="mdpWxDesc">{w?.description?.substring(0, 11) ?? '—'}</span>
                  <span className="mdpWxTemp" style={{
                    color: w ? (w.temp > 25 ? 'var(--amber)' : w.temp < 5 ? 'var(--blue)' : 'var(--teal)') : 'var(--txt4)',
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
