import '../styles/Footer.css'

const SOURCES = [
  ['EMSC',           'https://www.emsc-csem.org'],
  ['Open-Meteo',     'https://open-meteo.com/en/docs/air-quality-api'],
  ['OpenWeatherMap', 'https://openweathermap.org'],
  ['INS',            'https://insse.ro'],
]

export default function Footer() {
  return (
    <footer className="footer boot-fade d5">
      {SOURCES.map(([name, href]) => (
        <a className="fSrc" key={name} href={href} target="_blank" rel="noreferrer">{name}</a>
      ))}
      <div className="fSpacer" />
      <div className="fTag">
        RoStats v1.0 ·{' '}
        <a href="https://github.com/florea8/RoStats" target="_blank" rel="noreferrer">
          <span>github.com/florea8/RoStats</span>
        </a>
      </div>
    </footer>
  )
}
