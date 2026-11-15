import CountUp from './CountUp'
import DotField from './DotField'
import Footer from './Footer'
import SectionHeader from './sections/SectionHeader'
import { useIndicators } from '../hooks/useIndicators'
import { describeChange, periodLabel, splitSign } from '../utils/indicators'
import '../styles/Board.css'

const PLACEHOLDER_TILES = 9

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

function Tile({ indicator, index }) {
  const { sign, number } = splitSign(indicator)
  const change = describeChange(indicator)
  return (
    <div className="tile" data-spot style={{ animationDelay: `${index * 60}ms` }}>
      <dt className="tileHead">
        <span className="label">{indicator.label}</span>
        <span className="tilePeriod">{periodLabel(indicator.period)}</span>
      </dt>
      <dd>
        <span className="tileValue display">
          {sign}<CountUp value={number} decimals={indicator.decimals} />
          <span className="tileUnit">{indicator.unit}</span>
        </span>
        <span className="tileChange">
          <span>{change.text}</span>
          {change.favourable != null && <Verdict favourable={change.favourable} />}
        </span>
      </dd>
    </div>
  )
}

/**
 * National indicators. They have no location, so instead of the map and its
 * side panel this section fills the whole width with one board.
 */
export default function IndicatorBoard() {
  const { data: indicators, isLoading, isError, source } = useIndicators()

  return (
    <main className="board" aria-labelledby="section-title">
      <DotField />
      <div className="boardScroll">
        <div className="boardInner">
          <SectionHeader
            title="National indicators"
            subtitle="Romania · latest official figures"
            source={isError ? 'error' : source}
            href="https://ec.europa.eu/eurostat/web/main/data/database"
            linkLabel="Eurostat"
          />

          {isError && <p className="stateMsg" role="alert">Eurostat could not be reached.</p>}

          {isLoading && (
            <div className="tiles" role="status" aria-label="Loading indicators">
              {Array.from({ length: PLACEHOLDER_TILES }, (_, i) => (
                <div className="tile" key={i}><div className="skeleton tileSkeleton" /></div>
              ))}
            </div>
          )}

          {indicators && (
            <dl className="tiles">
              {indicators.map((indicator, i) => <Tile indicator={indicator} index={i} key={indicator.id} />)}
            </dl>
          )}

          <p className="note">
            {source === 'demo'
              ? 'Eurostat did not answer for every figure, so some show the last values known to this site.'
              : 'Fetched from Eurostat. Each figure is the latest period published, so monthly, quarterly and yearly figures sit side by side.'}
          </p>
        </div>
        <Footer />
      </div>
    </main>
  )
}
