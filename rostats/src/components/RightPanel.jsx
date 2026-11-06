import SeismicSection from './sections/SeismicSection'
import AqiSection from './sections/AqiSection'
import WeatherSection from './sections/WeatherSection'
import TrafficSection from './sections/TrafficSection'
import IndicatorsSection from './sections/IndicatorsSection'
import '../styles/RightPanel.css'

/** Detail panel: renders the section picked in the left navigation. */
export default function RightPanel({ activeSection, earthquakes, aqi, weather, traffic }) {
  const sections = {
    seismic:    <SeismicSection earthquakes={earthquakes} />,
    aqi:        <AqiSection aqi={aqi} />,
    weather:    <WeatherSection weather={weather} />,
    traffic:    <TrafficSection traffic={traffic} />,
    indicators: <IndicatorsSection />,
  }

  return (
    // key re-mounts the panel so the fade-in animation replays on every switch
    <aside className="detailPanel boot-fade d4" key={activeSection}>
      {sections[activeSection] ?? sections.seismic}
    </aside>
  )
}
