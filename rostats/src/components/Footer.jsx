import { APP_VERSION } from '../data/app'
import '../styles/Footer.css'

const SOURCES = [
  ['EMSC',           'https://www.emsc-csem.org'],
  ['Open-Meteo',     'https://open-meteo.com/en/docs/air-quality-api'],
  ['OpenWeatherMap', 'https://openweathermap.org'],
  ['INS',            'https://insse.ro'],
]

export default function Footer() {
  return (
    <footer className="footer">
      <p>
        Sources:{' '}
        {SOURCES.map(([name, href], i) => (
          <span key={name}>
            {i > 0 && ', '}
            <a href={href} target="_blank" rel="noreferrer">{name}</a>
          </span>
        ))}
      </p>
      <p>
        RoStats {APP_VERSION} ·{' '}
        <a href="https://github.com/florea8/RoStats" target="_blank" rel="noreferrer">Source code on GitHub</a>
      </p>
    </footer>
  )
}
