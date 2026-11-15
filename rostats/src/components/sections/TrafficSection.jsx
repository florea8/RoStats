import { describeRoad } from '../traffic'
import Odometer from '../Odometer'
import FocusRow from '../FocusRow'
import SectionHeader from './SectionHeader'

/** A short stretch of road whose dashes move as fast as its traffic does. */
function Flow({ state }) {
  return (
    <svg className={`flowMini flow--${state.key}`} viewBox="0 0 44 6" style={{ color: state.color }} aria-hidden="true">
      <path className="flowMiniBase" d="M1 3h42" />
      <path className="flowDash" d="M1 3h42" />
    </svg>
  )
}

export default function TrafficSection({ traffic, focus, onFocus }) {
  const { data, source } = traffic
  const roads = data?.map(describeRoad)
  const slowed = roads?.filter(road => road.state.key !== 'FREE').length

  return (
    <>
      <SectionHeader title="Traffic" subtitle="Five main roads · estimated" source={source} />

      {roads && (
        <div className="hero hero--stacked" data-spot>
          <div className="heroText">
            <p className="label">Main roads slowed, now</p>
            <p className="heroFigure display">
              <Odometer value={slowed} />
              <span className="heroUnit heroUnit--after">of {roads.length}</span>
            </p>
          </div>
          {/* One segment per road, in the color of its state. */}
          <div className="segments" aria-hidden="true">
            {roads.map((road, i) => (
              <span
                key={road.code}
                className="segment"
                style={{ background: road.state.color, animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      <p className="note">
        These are not measurements. Each road is given a typical state for the time of day
        (rush hour, daytime, night); no live traffic source is connected.
      </p>

      {roads && (
        <section className="list">
          <header className="listHead">
            <h3 className="label">State by road</h3>
            <span className="listHint">Select one to find it on the map</span>
          </header>
          <ol className="rows">
            {roads.map(road => (
              <FocusRow
                key={road.code}
                id={`road-${road.code}`}
                points={road.path ?? []}
                focus={focus}
                onFocus={onFocus}
                className="row--road"
              >
                <span className="roadCode">{road.code}</span>
                <span className="rowTitle">{road.label.slice(road.code.length).trim()}</span>
                <Flow state={road.state} />
                <span className="rowLevel">{road.state.label}</span>
              </FocusRow>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}
