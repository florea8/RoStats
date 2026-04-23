import { useState, useEffect } from 'react'
import { formatTime, formatUpdated } from '../utils/time'
import '../styles/TopBar.css'

export default function TopBar() {
  const [clock, setClock] = useState(formatTime())
  const [updated, setUpdated] = useState('')

  useEffect(() => {
    const id = setInterval(() => setClock(formatTime()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setUpdated(formatUpdated())
    const id = setInterval(() => setUpdated(formatUpdated()), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="topbar boot-fade">
      <div className="tbBrand">
        <div className="tbLogoMark">
          <span className="dot" />
        </div>
        <div className="tbLogoText">
          <span className="tbLogo">RoStats</span>
          <span className="tbTagline">Sistem Național de Monitorizare</span>
        </div>
      </div>
      <div className="tbDiv" />
      <div className="tbOnlineIndicators">
        <div className="tbOnlineItem"><span className="tbODot" />SEISMIC</div>
        <div className="tbOnlineItem"><span className="tbODot" />AQI</div>
        <div className="tbOnlineItem"><span className="tbODot" />METEO</div>
      </div>
      <div className="tbSpacer" />
      <div className="tbStatus">
        <span className="upd">{updated}</span>
        <div className="liveBadge">
          <div className="liveRing" />
          LIVE
        </div>
        <span className="clock">{clock}</span>
      </div>
    </header>
  )
}
