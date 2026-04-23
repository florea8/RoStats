import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { magColor, magHex } from '../utils/colors'
import { timeAgo } from '../utils/time'

const CITIES = [
  { name: 'Bucharest',   lat: 44.4268, lng: 26.1025, id: 'bucuresti' },
  { name: 'Cluj-Napoca', lat: 46.7712, lng: 23.6236, id: 'cluj' },
  { name: 'Timișoara',   lat: 45.7489, lng: 21.2087, id: 'timisoara' },
  { name: 'Iași',        lat: 47.1585, lng: 27.6014, id: 'iasi' },
  { name: 'Constanța',   lat: 44.1733, lng: 28.6383, id: 'constanta' },
  { name: 'Brașov',      lat: 45.6427, lng: 25.5887, id: 'brasov' },
  { name: 'Craiova',     lat: 44.3302, lng: 23.7949, id: 'craiova' },
  { name: 'Galați',      lat: 45.4353, lng: 28.0078, id: 'galati' },
]

function mkIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:9px;height:9px;border-radius:50%;background:${color};border:1px solid rgba(255,255,255,0.2);box-shadow:0 0 10px ${color}88;"></div>`,
    iconSize: [9, 9],
    iconAnchor: [4.5, 4.5],
  })
}

function CoordTracker({ setCoords }) {
  useMapEvents({
    mousemove(e) {
      setCoords(`LAT ${e.latlng.lat.toFixed(3)} · LNG ${e.latlng.lng.toFixed(3)}`)
    },
  })
  return null
}

export default function MapCenter({ earthquakes, aqi }) {
  const [coords, setCoords] = useState('LAT 45.940 · LNG 24.970')
  const { data: quakes } = earthquakes
  const { data: aqiData } = aqi

  return (
    <div className="map-center boot-fade d3">
      <MapContainer
        center={[45.94, 24.97]}
        zoom={7}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={13} />
        <CoordTracker setCoords={setCoords} />

        {/* City markers */}
        {CITIES.map(c => (
          <Marker key={c.id} position={[c.lat, c.lng]} icon={mkIcon('#00b8d9')}>
            <Popup>
              <div className="popup-head">{c.name.toUpperCase()}</div>
              <div className="popup-row"><span>WEATHER</span><span>{aqi?.data?.[c.id] ?? '—'}</span></div>
              <div className="popup-row"><span>AQI</span><span>{aqiData?.[c.id] ?? '—'}</span></div>
            </Popup>
          </Marker>
        ))}

        {/* Earthquake markers */}
        {quakes?.slice(0, 12).map((q, i) => {
          const p = q.properties
          const mag = parseFloat(p.mag)
          const depth = Math.round(q.geometry.coordinates[2])
          const loc = p.place?.split(' of ').pop() ?? '—'
          const r = mag >= 4 ? 9 : mag >= 3 ? 7 : 4
          return (
            <CircleMarker
              key={i}
              center={[q.geometry.coordinates[1], q.geometry.coordinates[0]]}
              radius={r}
              pathOptions={{
                color: magHex(mag),
                fillColor: magHex(mag),
                fillOpacity: 0.85,
                weight: 1.5,
              }}
            >
              <Popup>
                <div className="popup-head">EARTHQUAKE M{mag.toFixed(1)}</div>
                <div className="popup-row"><span>LOCATION</span><span>{loc}</span></div>
                <div className="popup-row"><span>DEPTH</span><span>{depth} km</span></div>
                <div className="popup-row"><span>TIME</span><span>{timeAgo(p.time)}</span></div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      <div className="map-chip map-chip-title">INTERACTIVE MAP · ROMANIA · OSM</div>
      <div className="map-chip map-chip-coords">{coords}</div>

      <div className="map-legend">
        <div className="leg"><div className="ldot" style={{ background: 'var(--a)' }} />AQI Stations</div>
        <div className="leg"><div className="ldot" style={{ background: 'var(--red)' }} />Earthquake ≥ M3</div>
        <div className="leg"><div className="ldot" style={{ background: 'var(--warn)' }} />Earthquake &lt; M3</div>
        <div className="leg"><div className="ldot" style={{ background: 'var(--a2)' }} />Weather Stations</div>
      </div>
    </div>
  )
}
