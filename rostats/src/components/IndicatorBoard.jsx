import CountUp from './CountUp'
import DotField from './DotField'
import Footer from './Footer'
import SectionHeader from './sections/SectionHeader'
import { INDICATORS } from './sections/indicators'
import '../styles/Board.css'

// "+2.1" → sign "+", number 2.1, one decimal; the sign is kept as written.
function parseValue(value) {
  const sign = /^[+-]/.test(value) ? value[0] : ''
  const digits = sign ? value.slice(1) : value
  return { sign, number: Number(digits), decimals: (digits.split('.')[1] ?? '').length }
}

/** Tick for a change that is good news for the country, mark for one that is not. */
function Verdict({ favourable }) {
  return (
    <span className="tileVerdict">
      <svg viewBox="0 0 12 12" aria-hidden="true">
        {favourable
          ? <path d="M2.5 6.5l2.5 2.5 4.5-5.5" />
          : <path d="M6 2.5v4.5M6 9.4v.1" />}
      </svg>
      {favourable ? 'Favourable' : 'Unfavourable'}
    </span>
  )
}

/**
 * National indicators. They have no location, so instead of the map and its
 * side panel this section fills the whole width with one board.
 */
export default function IndicatorBoard() {
  return (
    <main className="board" aria-labelledby="section-title">
      <DotField />
      <div className="boardScroll">
        <div className="boardInner">
          <SectionHeader
            title="National indicators"
            subtitle="Economy · National Institute of Statistics"
            source="static"
            href="https://insse.ro"
            linkLabel="INS"
          />

        <dl className="tiles">
          {INDICATORS.map((indicator, i) => {
            const { sign, number, decimals } = parseValue(indicator.value)
            return (
              <div className="tile" key={indicator.id} style={{ animationDelay: `${i * 60}ms` }}>
                <dt className="label">{indicator.label}</dt>
                <dd>
                  <span className="tileValue display">
                    {sign}<CountUp value={number} decimals={decimals} />
                    <span className="tileUnit">{indicator.unit}</span>
                  </span>
                  <span className="tileChange">
                    <span>{indicator.change}</span>
                    <Verdict favourable={indicator.favourable} />
                  </span>
                </dd>
              </div>
            )
          })}
        </dl>

          <p className="note">
            Copied by hand from INS publications. These figures do not update on their own
            and may be older than the latest release.
          </p>
        </div>
        <Footer />
      </div>
    </main>
  )
}
