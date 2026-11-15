import SeismicSection from './sections/SeismicSection'
import AqiSection from './sections/AqiSection'
import WeatherSection from './sections/WeatherSection'
import TrafficSection from './sections/TrafficSection'
import Footer from './Footer'
import '../styles/Panel.css'

/**
 * Side panel with the readings of the section picked in the top bar.
 * focus / onFocus: the row picked to be shown on the map (see FocusRow).
 * replayId / onReplay: the replay of the last 30 days of earthquakes (see replay.js).
 */
export default function SectionDetail({
  activeSection, earthquakes, aqi, weather, traffic, focus, onFocus, replayId, onReplay,
}) {
  const pick = { focus, onFocus }
  const sections = {
    seismic: <SeismicSection earthquakes={earthquakes} replayId={replayId} onReplay={onReplay} {...pick} />,
    aqi:     <AqiSection aqi={aqi} {...pick} />,
    weather: <WeatherSection weather={weather} {...pick} />,
    traffic: <TrafficSection traffic={traffic} {...pick} />,
  }

  return (
    <main className="panel" aria-labelledby="section-title">
      {/* Keyed by section, so a new section's content rises into place. */}
      <div className="panelBody" key={activeSection}>
        {sections[activeSection] ?? sections.seismic}
      </div>
      <Footer />
    </main>
  )
}
