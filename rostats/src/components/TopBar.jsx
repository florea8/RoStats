import { useLayoutEffect, useRef } from 'react'
import SourceBadge from './SourceBadge'
import Swatch from './Swatch'
import { aqiColor, magColor, tempColor } from '../utils/colors'
import { overallStatus } from '../utils/status'
import '../styles/TopBar.css'

const SOURCES = [
  ['seismic', 'Quakes'],
  ['aqi',     'Air'],
  ['weather', 'Weather'],
]

const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })

// Headline figure shown beside each tab label; null while there is nothing to show.
function seismicFigure({ data }) {
  const latest = data?.[0]
  return latest ? { text: `M ${latest.magnitude.toFixed(1)}`, color: magColor(latest.magnitude) } : null
}

function aqiFigure({ data }) {
  const value = data?.bucuresti
  return value != null ? { text: String(value), color: aqiColor(value) } : null
}

function weatherFigure({ data }) {
  const now = data?.bucuresti
  return now ? { text: `${now.temp}°`, color: tempColor(now.temp) } : null
}

function trafficFigure({ data }) {
  if (!data) return null
  const slowed = data.filter(road => road.status !== 'FREE').length
  return { text: `${slowed}/${data.length}` }
}

/** Ring-and-epicentre mark; the same drawing as the favicon. */
function BrandMark() {
  return (
    <svg className="brandMark" viewBox="0 0 32 32" aria-hidden="true">
      <circle className="brandRing brandRing--outer" cx="16" cy="16" r="12" />
      <circle className="brandRing" cx="16" cy="16" r="7" />
      <circle className="brandCore" cx="16" cy="16" r="2.75" />
    </svg>
  )
}

/**
 * Brand, section switcher and the state of each live source.
 *
 * status:    { seismic, aqi, weather } each one of 'live' | 'demo' | 'error' | 'loading'
 * updatedAt: timestamp (ms) of the most recent successful data fetch, or 0
 * busy:      true while any source is being fetched
 */
export default function TopBar({ active, onSelect, status, updatedAt, busy, earthquakes, aqi, weather, traffic }) {
  const navRef = useRef(null)

  const tabs = [
    { id: 'seismic',    label: 'Earthquakes', figure: seismicFigure(earthquakes) },
    { id: 'aqi',        label: 'Air quality', figure: aqiFigure(aqi) },
    { id: 'weather',    label: 'Weather',     figure: weatherFigure(weather) },
    { id: 'traffic',    label: 'Traffic',     figure: trafficFigure(traffic) },
    { id: 'indicators', label: 'Indicators',  figure: null },
  ]

  // The highlight is one element that slides under the current tab. Its
  // position is measured after every render, because tab widths change as
  // figures arrive, and again whenever the bar is resized.
  useLayoutEffect(() => {
    const nav = navRef.current
    const place = () => {
      const current = nav.querySelector('[aria-current="true"]')
      if (!current) return
      nav.style.setProperty('--tab-x', `${current.offsetLeft}px`)
      nav.style.setProperty('--tab-w', `${current.offsetWidth}px`)
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(nav)
    return () => observer.disconnect()
  })

  return (
    <header className="topbar">
      <div className="brand">
        <BrandMark />
        <h1 className="brandName display">RoStats</h1>
        <p className="brandSub">Romania, live</p>
      </div>

      <nav className="nav" aria-label="Sections" ref={navRef}>
        <span className="navGlider" aria-hidden="true" />
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className="navTab"
            aria-current={active === tab.id ? 'true' : undefined}
            onClick={() => onSelect(tab.id)}
          >
            <span className="navLabel">{tab.label}</span>
            {tab.figure && (
              <span className="navFigure">
                {tab.figure.color && <Swatch color={tab.figure.color} />}
                {tab.figure.text}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="topMeta">
        <dl className="topSources">
          {SOURCES.map(([id, name]) => (
            <div className="topSource" key={id}>
              <dt>{name}</dt>
              <dd><SourceBadge source={status[id]} /></dd>
            </div>
          ))}
        </dl>
        {/* Narrow screens have no room for one badge per source, so they get one for all,
            showing the worst state; the per-source states are in its tooltip. */}
        <p
          className="topSummary"
          title={SOURCES.map(([id, name]) => `${name}: ${status[id]}`).join(' · ')}
        >
          <span className="topSummaryLabel">Sources</span>
          <SourceBadge source={overallStatus(status)} />
        </p>
        {updatedAt > 0 && (
          <p className="topUpdated">
            Updated <time dateTime={new Date(updatedAt).toISOString()}>{timeFormat.format(updatedAt)}</time>
          </p>
        )}
      </div>

      {/* A line that runs along the bar only while a source is being fetched. */}
      {busy && <span className="topProgress" role="status" aria-label="Refreshing data" />}
    </header>
  )
}
