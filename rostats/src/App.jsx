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

export default function App() {
  const [activeSection, setActiveSection] = useState('seismic')

  const earthquakes = useEarthquakes()
  const weather = useWeather()
  const aqi = useAQI()
  const traffic = useTraffic()

  return (
    <div className="root-layout">
      <TopBar />
      <MetricsStrip earthquakes={earthquakes} weather={weather} aqi={aqi} />
      <div className="main-layout">
        <LeftNav active={activeSection} onSelect={setActiveSection} />
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

