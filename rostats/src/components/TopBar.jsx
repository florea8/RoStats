import { useState, useEffect } from 'react'
import { formatTime, formatUpdated } from '../utils/time'

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
      <div className="tb-logo">
        <span className="dot" />
        RoStats
      </div>
      <div className="tb-div" />
      <div className="tb-sub">National Monitoring System</div>
      <div className="tb-spacer" />
      <div className="tb-status">
        <span className="upd">{updated}</span>
        <div className="live-badge">
          <div className="live-ring" />
          LIVE
        </div>
        <span className="clock">{clock}</span>
      </div>
    </header>
  )
}
