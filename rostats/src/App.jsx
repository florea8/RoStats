import { useEffect, useState } from 'react'
import TopBar from './components/TopBar'
import MapView from './components/map/MapView'
import SectionDetail from './components/SectionDetail'
import IndicatorBoard from './components/IndicatorBoard'

import { useEarthquakes } from './hooks/useEarthquakes'
import { useWeather } from './hooks/useWeather'
import { useAQI } from './hooks/useAQI'
import { useTraffic } from './hooks/useTraffic'
import { sourceStatus } from './utils/status'

export default function App() {
  const [activeSection, setActiveSection] = useState('seismic')
  // The row picked in the panel, which the map flies to: { id, points } or null.
  const [focus, setFocus] = useState(null)
  // Counts the replays of the 30 days of earthquakes; a new number starts one.
  const [replayId, setReplayId] = useState(0)

  // Surfaces marked data-spot are lit under the pointer: its position is
  // handed to CSS, which draws the light.
  useEffect(() => {
    const track = event => {
      const surface = event.target.closest?.('[data-spot]')
      if (!surface) return
      const box = surface.getBoundingClientRect()
      surface.style.setProperty('--spot-x', `${event.clientX - box.left}px`)
      surface.style.setProperty('--spot-y', `${event.clientY - box.top}px`)
    }
    document.addEventListener('pointermove', track)
    return () => document.removeEventListener('pointermove', track)
  }, [])

  const earthquakes = useEarthquakes()
  const weather = useWeather()
  const aqi = useAQI()
  const traffic = useTraffic()

  const status = {
    seismic: sourceStatus(earthquakes, 'live'),
    aqi:     sourceStatus(aqi, aqi.source),
    weather: sourceStatus(weather, weather.source),
  }

  const selectSection = id => {
    setActiveSection(id)
    setFocus(null)
  }

  return (
    <div className="app">
      <TopBar
        active={activeSection}
        onSelect={selectSection}
        status={status}
        updatedAt={Math.max(earthquakes.dataUpdatedAt, aqi.dataUpdatedAt, weather.dataUpdatedAt)}
        busy={earthquakes.isFetching || aqi.isFetching || weather.isFetching}
        earthquakes={earthquakes}
        aqi={aqi}
        weather={weather}
        traffic={traffic}
      />

      {/* Indicators are national figures with no location, so they get a board instead of the map. */}
      {activeSection === 'indicators' ? (
        <IndicatorBoard />
      ) : (
        <>
          <MapView
            activeSection={activeSection}
            quakes={earthquakes.data}
            quakesAt={earthquakes.dataUpdatedAt}
            replayId={replayId}
            aqiData={aqi.data}
            wxData={weather.data}
            roads={traffic.data}
            focus={focus}
          />
          <SectionDetail
            activeSection={activeSection}
            earthquakes={earthquakes}
            aqi={aqi}
            weather={weather}
            traffic={traffic}
            focus={focus}
            onFocus={setFocus}
            replayId={replayId}
            onReplay={() => setReplayId(id => id + 1)}
          />
        </>
      )}
    </div>
  )
}
