import { useState, useEffect } from 'react'
import { formatTime, formatUpdated } from '../utils/time'
import '../styles/TopBar.css'

const STATUS_TITLE = {
  live:    'Sursă activă — date reale',
  demo:    'Sursă indisponibilă — valori demo',
  error:   'Sursă offline',
  loading: 'Se conectează…',
}

function SourceStatus({ label, status }) {
  return (
    <div className="tbOnlineItem" title={STATUS_TITLE[status]}>
      <span className={`tbODot tbODot--${status}`} />{label}
    </div>
  )
}

/**
 * status:    { seismic, aqi, weather } each one of 'live' | 'demo' | 'error' | 'loading'
 * updatedAt: timestamp (ms) of the most recent successful data fetch, or 0
 */
export default function TopBar({ status, updatedAt }) {
  const [clock, setClock] = useState(formatTime)
  const updated = updatedAt ? formatUpdated(new Date(updatedAt)) : ''

  useEffect(() => {
    const id = setInterval(() => setClock(formatTime()), 1000)
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
        <SourceStatus label="SEISMIC" status={status.seismic} />
        <SourceStatus label="AQI"     status={status.aqi} />
        <SourceStatus label="METEO"   status={status.weather} />
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
