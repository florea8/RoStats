import '../styles/Footer.css'

export default function Footer() {
  return (
    <footer className="footer boot-fade d5">
      <a className="fSrc" href="https://earthquake.usgs.gov" target="_blank" rel="noreferrer">USGS</a>
      <a className="fSrc" href="https://openaq.org" target="_blank" rel="noreferrer">OpenAQ</a>
      <a className="fSrc" href="https://openweathermap.org" target="_blank" rel="noreferrer">OpenWeatherMap</a>
      <a className="fSrc" href="https://insse.ro" target="_blank" rel="noreferrer">INSSE</a>
      <a className="fSrc" href="https://data.gov.ro" target="_blank" rel="noreferrer">data.gov.ro</a>
      <div className="fSpacer" />
      <div className="fTag">
        RoStats v1.0 · <span>github.com/florea8/rostats</span>
      </div>
    </footer>
  )
}
