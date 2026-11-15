import { Fragment, useEffect, useRef } from 'react'
import {
  MapContainer, TileLayer, AttributionControl, ZoomControl, CircleMarker, Marker, Polyline, Popup, useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  PALETTE, MAG_LEVELS, AQI_LEVELS, TEMP_LEVELS,
  magColor, aqiColor, aqiTag, tempColor,
} from '../../utils/colors'
import { markerRadius } from '../../utils/earthquakes'
import { CITIES } from '../../data/cities'
import { timeAgo } from '../../utils/time'
import { nearCity } from '../geo'
import { sentenceCase } from '../text'
import { TRAFFIC_STATES, describeRoad } from '../traffic'
import Swatch from '../Swatch'
import { REPLAY_STEPS, quakeMoment } from '../replay'
import FxLayer from './FxLayer'
import '../../styles/Map.css'

const ROMANIA = L.latLngBounds([43.6, 20.2], [48.3, 29.8])
const PAN_LIMIT = [[38.5, 10.0], [53.0, 40.0]]
const INK = PALETTE.ink
const MAX_QUAKE_MARKERS = 150
const INTRO_ZOOM_OUT = 1.6   // how far above the country the opening flight starts

// Esri Dark Gray Canvas: a keyless, quiet basemap with labels on a separate layer.
const ESRI_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas'
const BASEMAP_URL = `${ESRI_TILES}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`
const LABELS_URL  = `${ESRI_TILES}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`
const BASEMAP_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
const LEAFLET_CREDIT = '<a href="https://leafletjs.com" target="_blank" rel="noreferrer">Leaflet</a>'

// Scales are stored from the highest level down; legends read from low to high.
const ascending = levels => [...levels].reverse()

const LAYERS = {
  seismic: { title: 'Magnitude', legend: ascending(MAG_LEVELS) },
  aqi:     { title: 'US AQI', legend: ascending(AQI_LEVELS), ownLabels: true },
  weather: { title: 'Temperature', legend: ascending(TEMP_LEVELS), ownLabels: true },
  traffic: { title: 'Traffic', legend: TRAFFIC_STATES },
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
// The wheel zooms the map only where the page itself does not scroll.
const fixedLayout = () => window.matchMedia('(min-width: 961px)').matches

// Fractional zoom offsets at which a 256px tile is drawn 160, 192, 224 or 256px
// wide. At other zoom levels tile edges fall between pixels and show as seams.
const CRISP_STEPS = [5, 6, 7, 8].map(eighths => Math.log2(eighths / 8))

/** Largest zoom not above `zoom` at which tiles land on whole pixels. */
function crispZoom(zoom) {
  const top = Math.ceil(zoom)
  const options = [top - 1, ...CRISP_STEPS.map(step => top + step)]
  return Math.max(...options.filter(z => z <= zoom))
}

/** Center and zoom that show the whole country, clear of the legend (bottom on wide stages, top on narrow ones). */
function countryView(map) {
  const small = map.getSize().x < 600
  const side = small ? 12 : 40
  const top = small ? 72 : 40
  const bottom = small ? 48 : 96
  const zoom = crispZoom(map.getBoundsZoom(ROMANIA, false, L.point(side * 2, top + bottom)))
  const middle = map.project(ROMANIA.getSouthWest(), zoom)
    .add(map.project(ROMANIA.getNorthEast(), zoom))
    .divideBy(2)
  return { center: map.unproject(middle.add([0, (bottom - top) / 2]), zoom), zoom }
}

// The opening flight plays once per page load, not every time the map returns.
let introPlayed = false

/**
 * Moves the map: the whole country by default, a flight to the row picked
 * in the panel, and a flight back when the pick is released.
 */
function Camera({ focus }) {
  const map = useMap()
  const focusRef = useRef(focus)
  const away = useRef(false)

  useEffect(() => {
    focusRef.current = focus
  }, [focus])

  useEffect(() => {
    const fit = () => {
      if (focusRef.current) return
      const { center, zoom } = countryView(map)
      map.setView(center, zoom, { animate: false })
    }
    fit()
    // First view of the page: start high above the region and descend onto the country.
    if (!introPlayed && !reducedMotion()) {
      const { center, zoom } = countryView(map)
      map.setView(center, Math.max(map.getMinZoom(), zoom - INTRO_ZOOM_OUT), { animate: false })
      map.flyTo(center, zoom, { duration: 2.4, easeLinearity: 0.2 })
    }
    introPlayed = true
    map.on('resize', fit)
    // Leaflet only hears window resizes; the stage can also change size on its
    // own (layout switch, rotation), so its box is watched directly.
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => {
      observer.disconnect()
      map.off('resize', fit)
    }
  }, [map])

  useEffect(() => {
    const animate = !reducedMotion()
    const points = focus?.points ?? []
    if (points.length === 1) {
      away.current = true
      map.flyTo(points[0], Math.max(map.getZoom(), 8), { animate, duration: 1.1 })
    } else if (points.length > 1) {
      away.current = true
      // Room around a road, less of it where the stage is small.
      const room = map.getSize().x < 600 ? 40 : 96
      map.flyToBounds(L.latLngBounds(points), { animate, duration: 1.1, padding: [room, room], maxZoom: 9 })
    } else if (away.current) {
      away.current = false
      const { center, zoom } = countryView(map)
      map.flyTo(center, zoom, { animate, duration: 0.9 })
    }
  }, [map, focus])

  return null
}

// Icons are cached by their markup: a new icon object would make Leaflet
// rebuild the marker and restart its animation on every render.
const icons = new Map()
function htmlIcon(className, html) {
  const key = className + html
  if (!icons.has(key)) icons.set(key, L.divIcon({ className, html, iconSize: [0, 0] }))
  return icons.get(key)
}

/** City marker: a dot in the scale color, an optional disc sized by the value, and a tag with the reading. */
function cityIcon({ color, name, text, disc = 0, picked }) {
  return htmlIcon('pinIcon', `
    <span class="cityPin${picked ? ' is-picked' : ''}" style="--c:${color};--disc:${disc}px">
      ${disc ? '<i class="cityDisc"></i>' : ''}
      <i class="cityDot"></i>
      <span class="cityTag"><span>${name}</span><b>${text}</b></span>
    </span>`)
}

function PopupRow({ label, children }) {
  return <div className="mapPopupRow"><dt>{label}</dt><dd>{children}</dd></div>
}

function EarthquakeMarkers({ quakes, quakesAt, replayId }) {
  // Oldest first, so the most recent events are drawn on top.
  const shown = quakes.slice(0, MAX_QUAKE_MARKERS).reverse()

  return (
    <>
      {shown.map(q => (
        // Keyed by the replay as well, so every replay makes the markers appear again,
        // each at its moment in the 30 days (see replay.js and the .quake--N rules).
        <CircleMarker
          key={`${replayId}-${q.id}`}
          center={[q.lat, q.lng]}
          radius={markerRadius(q.magnitude)}
          pathOptions={{
            className: `quake quake--${Math.min(REPLAY_STEPS - 1, Math.floor(quakeMoment(q, quakesAt) * REPLAY_STEPS))}`,
            color: INK,
            weight: 1.5,
            fillColor: magColor(q.magnitude),
            fillOpacity: 0.95,
          }}
        >
          <Popup>
            <h3 className="mapPopupTitle">Magnitude {q.magnitude.toFixed(1)}</h3>
            <dl>
              <PopupRow label="Location">{nearCity(q.lat, q.lng)}</PopupRow>
              <PopupRow label="Depth">{q.depth_km} km</PopupRow>
              <PopupRow label="Time">{timeAgo(q.time)}</PopupRow>
            </dl>
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}

function AqiMarkers({ aqiData, focus }) {
  return CITIES.map(c => {
    const v = aqiData?.[c.id]
    const icon = cityIcon({
      color: v != null ? aqiColor(v) : PALETTE.muted,
      name: c.name,
      text: v ?? '–',
      // The disc grows with the index, up to the top of the scale.
      disc: v != null ? 28 + (Math.min(v, 200) / 200) * 72 : 0,
      picked: focus?.id === `city-${c.id}`,
    })
    return (
      <Marker key={c.id} position={[c.lat, c.lng]} icon={icon}>
        <Popup>
          <h3 className="mapPopupTitle">{c.name}</h3>
          <dl>
            <PopupRow label="US AQI">{v ?? '—'}</PopupRow>
            <PopupRow label="Level">{v != null ? sentenceCase(aqiTag(v)) : '—'}</PopupRow>
          </dl>
        </Popup>
      </Marker>
    )
  })
}

function WeatherMarkers({ wxData, focus }) {
  return CITIES.map(c => {
    const w = wxData?.[c.id]
    const icon = cityIcon({
      color: w ? tempColor(w.temp) : PALETTE.muted,
      name: c.name,
      text: w ? `${w.temp}°` : '–',
      picked: focus?.id === `city-${c.id}`,
    })
    return (
      <Marker key={c.id} position={[c.lat, c.lng]} icon={icon}>
        <Popup>
          <h3 className="mapPopupTitle">{c.name}</h3>
          <dl>
            <PopupRow label="Temperature">{w ? `${w.temp}°C` : '—'}</PopupRow>
            <PopupRow label="Conditions">{w ? sentenceCase(w.description) : '—'}</PopupRow>
            <PopupRow label="Humidity">{w ? `${w.humidity}%` : '—'}</PopupRow>
            <PopupRow label="Wind">{w ? `${w.wind} m/s` : '—'}</PopupRow>
          </dl>
        </Popup>
      </Marker>
    )
  })
}

function TrafficLines({ roads, focus }) {
  const pickedRoad = focus?.id.startsWith('road-') ? focus.id : null

  return roads.map(describeRoad).filter(road => road.path).map(road => {
    // While one road is picked the others step back.
    const dim = pickedRoad && pickedRoad !== `road-${road.code}` ? 0.25 : 1
    return (
      <Fragment key={road.code}>
        {/* A dark casing keeps the line clear of the basemap's own roads. */}
        <Polyline positions={road.path} pathOptions={{ color: INK, weight: 9, opacity: dim }}>
          <Popup>
            <h3 className="mapPopupTitle">{road.label}</h3>
            <dl>
              <PopupRow label="State">{road.state.label}</PopupRow>
              <PopupRow label="Source">Simulated</PopupRow>
            </dl>
          </Popup>
        </Polyline>
        <Polyline
          positions={road.path}
          pathOptions={{ color: road.state.color, weight: 4, opacity: 0.22 * dim }}
          interactive={false}
        />
      </Fragment>
    )
  })
}

function note(activeSection, quakes) {
  if (activeSection === 'seismic' && quakes) {
    return `${quakes.length} events in 30 days · larger circles are stronger`
  }
  if (activeSection === 'aqi') return 'Larger discs mean a higher index'
  if (activeSection === 'traffic') return 'Roads drawn schematically · states are simulated'
  return null
}

/**
 * Map of Romania showing the markers and legend of the active section.
 * focus:    the row picked in the panel ({ id, points } or null), which the map flies to
 * quakesAt: time the earthquakes were fetched (ms), the "now" of the 30-day replay
 * replayId: changes whenever the replay is started again
 */
export default function MapView({ activeSection, quakes, quakesAt, aqiData, wxData, roads, focus, replayId }) {
  const layer = LAYERS[activeSection]
  const caption = note(activeSection, quakes)
  // A picked city is marked by its own tag, so the target ring is for earthquakes only.
  const spot = activeSection === 'seismic' && focus?.points.length === 1 ? focus.points[0] : null

  return (
    <figure className="stage" aria-label={`Map of Romania: ${layer.title}`}>
      <div className="mapCanvas">
        <MapContainer
          center={ROMANIA.getCenter()}
          zoom={6}
          zoomSnap={0}
          minZoom={4.5}
          maxZoom={12}
          maxBounds={PAN_LIMIT}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={fixedLayout()}
          zoomControl={false}
          attributionControl={false}
          dragging={!L.Browser.mobile}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer className="basemap" url={BASEMAP_URL} maxNativeZoom={16} attribution={BASEMAP_ATTRIBUTION} />
          {/* City sections name the places themselves, so the basemap labels would only repeat them. */}
          {!layer.ownLabels && <TileLayer className="basemapLabels" url={LABELS_URL} maxNativeZoom={16} />}
          <AttributionControl prefix={LEAFLET_CREDIT} />
          <ZoomControl position="topright" />
          <Camera focus={focus} />
          <FxLayer
            scene={activeSection}
            replayId={replayId}
            data={{ quakes, quakesAt, aqiData, wxData, focus, roads: roads?.map(describeRoad) }}
          />

          {activeSection === 'seismic' && quakes && (
            <EarthquakeMarkers quakes={quakes} quakesAt={quakesAt} replayId={replayId} />
          )}
          {activeSection === 'aqi'     && <AqiMarkers aqiData={aqiData} focus={focus} />}
          {activeSection === 'weather' && <WeatherMarkers wxData={wxData} focus={focus} />}
          {activeSection === 'traffic' && roads && <TrafficLines roads={roads} focus={focus} />}

          {/* Target ring on the earthquake picked in the panel. */}
          {spot && (
            <Marker
              key={focus.id}
              position={spot}
              icon={htmlIcon('pinIcon', '<span class="target"></span>')}
              interactive={false}
              keyboard={false}
            />
          )}
        </MapContainer>
        <div className="mapVignette" aria-hidden="true" />
      </div>

      <figcaption className="legend" key={activeSection}>
        <span className="legendTitle label">{layer.title}</span>
        <ul className="legendItems">
          {layer.legend.map(item => (
            <li key={item.label}><Swatch color={item.color} />{item.label}</li>
          ))}
        </ul>
        {caption && <span className="legendNote">{caption}</span>}
      </figcaption>
    </figure>
  )
}
