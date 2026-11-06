import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  PALETTE, MAG_LEVELS, AQI_LEVELS, TEMP_LEVELS,
  magColor, aqiColor, aqiTag, tempColor,
} from '../../utils/colors'
import { markerRadius } from '../../utils/earthquakes'
import { CITIES } from '../../data/cities'
import { timeAgo } from '../../utils/time'

const ROMANIA_CENTER = [45.94, 24.97]
const ROMANIA_BOUNDS = [[43.3, 19.7], [48.6, 30.3]]

const LEGENDS = {
  seismic: { title: 'MAGNITUDE',   levels: MAG_LEVELS },
  aqi:     { title: 'CITY AQI',    levels: AQI_LEVELS },
  weather: { title: 'TEMPERATURE', levels: TEMP_LEVELS },
}

function cityIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:11px;height:11px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.55);box-shadow:0 0 0 3px ${color}33,0 0 14px ${color}66;"></div>`,
    iconSize: [11, 11],
    iconAnchor: [5, 5],
  })
}

function PopupRow({ label, children }) {
  return <div className="popup-row"><span>{label}</span><span>{children}</span></div>
}

function CoordTracker({ onMove }) {
  useMapEvents({
    mousemove(e) {
      onMove(`${e.latlng.lat.toFixed(3)}° N  ${e.latlng.lng.toFixed(3)}° E`)
    },
  })
  return null
}

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

function EarthquakeMarkers({ quakes }) {
  return quakes.slice(0, 12).map(q => {
    const { mag, place, time } = q.properties
    const color = magColor(mag)
    return (
      <CircleMarker
        key={q.id}
        center={[q.lat, q.lng]}
        radius={markerRadius(mag)}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 1.5 }}
      >
        <Popup>
          <div className="popup-head">EARTHQUAKE M{mag.toFixed(1)}</div>
          <PopupRow label="LOCATION">{place ?? '—'}</PopupRow>
          <PopupRow label="DEPTH">{q.depth_km} km</PopupRow>
          <PopupRow label="TIME">{timeAgo(time)}</PopupRow>
        </Popup>
      </CircleMarker>
    )
  })
}

function AqiMarkers({ aqiData }) {
  return CITIES.map(c => {
    const v = aqiData?.[c.id]
    return (
      <Marker key={c.id} position={[c.lat, c.lng]} icon={cityIcon(v != null ? aqiColor(v) : PALETTE.muted)}>
        <Popup>
          <div className="popup-head">{c.label}</div>
          <PopupRow label="AQI">{v ?? '—'}</PopupRow>
          <PopupRow label="QUALITY">{v != null ? aqiTag(v) : '—'}</PopupRow>
        </Popup>
      </Marker>
    )
  })
}

function WeatherMarkers({ wxData }) {
  return CITIES.map(c => {
    const w = wxData?.[c.id]
    return (
      <Marker key={c.id} position={[c.lat, c.lng]} icon={cityIcon(w ? tempColor(w.temp) : PALETTE.muted)}>
        <Popup>
          <div className="popup-head">{c.label}</div>
          <PopupRow label="TEMP">{w ? `${w.temp}°C` : '—'}</PopupRow>
          <PopupRow label="WEATHER">{w?.description ?? '—'}</PopupRow>
          <PopupRow label="HUMIDITY">{w ? `${w.humidity}%` : '—'}</PopupRow>
          <PopupRow label="WIND">{w ? `${w.wind} m/s` : '—'}</PopupRow>
        </Popup>
      </Marker>
    )
  })
}

/** Leaflet map of Romania showing the markers and legend of the active section. */
export default function MapView({ activeSection, quakes, aqiData, wxData }) {
  const [coords, setCoords] = useState('45.940° N  24.970° E')
  const legend = LEGENDS[activeSection]

  return (
    <div className="mapPane">
      <MapContainer
        center={ROMANIA_CENTER}
        zoom={7}
        minZoom={6}
        maxZoom={12}
        maxBounds={ROMANIA_BOUNDS}
        maxBoundsViscosity={1.0}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" maxZoom={19} attribution="&copy; CartoDB" />
        <CoordTracker onMove={setCoords} />

        {activeSection === 'seismic' && quakes && <EarthquakeMarkers quakes={quakes} />}
        {activeSection === 'aqi'     && <AqiMarkers aqiData={aqiData} />}
        {activeSection === 'weather' && <WeatherMarkers wxData={wxData} />}
      </MapContainer>

      <div className="mapChip mapChipTitle">INTERACTIVE MAP · ROMANIA</div>
      <div className="mapChip mapChipCoords">{coords}</div>

      <div className="mapLegend">
        {legend && <Legend title={legend.title} levels={legend.levels} />}
      </div>
    </div>
  )
}
