import { useState } from 'react'
import TopBar from './components/TopBar'
import MetricsStrip from './components/MetricsStrip'
import LeftNav from './components/LeftNav'
import MapCenter from './components/MapCenter'
import RightPanel from './components/RightPanel'
import Footer from './components/Footer'

import { useEarthquakes } from './hooks/useEarthquakes'
import { useWeather } from './hooks/useWeather'
import { useAQI } from './hooks/useAQI'
import { useTraffic } from './hooks/useTraffic'

// Maps a React Query result to the status shown in the top bar.
function sourceStatus(query, source) {
  if (query.isError && !query.data) return 'error'
  if (query.isPending) return 'loading'
  return source ?? 'live'
}

export default function App() {
  const [activeSection, setActiveSection] = useState('seismic')

  const earthquakes = useEarthquakes()
  const weather = useWeather()
  const aqi = useAQI()
  const traffic = useTraffic()

  const status = {
    seismic: sourceStatus(earthquakes, 'live'),
    aqi:     sourceStatus(aqi, aqi.source),
    weather: sourceStatus(weather, weather.source),
  }

  return (
    <div className="root-layout">
      <TopBar
        status={status}
        updatedAt={Math.max(earthquakes.dataUpdatedAt, aqi.dataUpdatedAt, weather.dataUpdatedAt)}
      />
      <MetricsStrip earthquakes={earthquakes} weather={weather} aqi={aqi} />
      <div className="main-layout">
        <LeftNav active={activeSection} onSelect={setActiveSection} status={status} />
        <MapCenter earthquakes={earthquakes} aqi={aqi} weather={weather} activeSection={activeSection} />
        <RightPanel
          activeSection={activeSection}
          earthquakes={earthquakes}
          aqi={aqi}
          weather={weather}
          traffic={traffic}
        />
      </div>
      <Footer />
    </div>
  )
}

