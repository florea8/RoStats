import MapView from './map/MapView'
import MapDataPanel from './map/MapDataPanel'
import '../styles/MapCenter.css'

/** Center column: the interactive map with a summary strip underneath. */
export default function MapCenter({ earthquakes, aqi, weather, activeSection }) {
  return (
    <div className="mapCenter boot-fade d3">
      <MapView
        activeSection={activeSection}
        quakes={earthquakes.data}
        aqiData={aqi.data}
        wxData={weather.data}
      />
      <MapDataPanel
        quakes={earthquakes.data}
        fetchedAt={earthquakes.dataUpdatedAt}
        aqiData={aqi.data}
        wxData={weather.data}
      />
    </div>
  )
}
