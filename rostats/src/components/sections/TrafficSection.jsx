import { describeRoad } from '../../utils/traffic'
import Odometer from '../Odometer'
import FocusRow from '../FocusRow'
import SectionHeader, { SectionSkeleton } from './SectionHeader'

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
  const { data, source, isLoading, isError } = traffic
  const live = source === 'live'
  const roads = data?.map(describeRoad)
  const slowed = roads?.filter(road => road.state.key !== 'FREE').length

  return (
    <>
      <SectionHeader
        title="Traffic"
        subtitle={live ? 'Main roads · measured speeds' : 'Main roads · estimated'}
        source={isError ? 'error' : source}
        href={live ? 'https://developer.tomtom.com/traffic-api' : undefined}
        linkLabel={live ? 'TomTom' : undefined}
      />

      {isLoading && <SectionSkeleton label="Loading traffic" />}
      {isError && <p className="stateMsg" role="alert">The traffic API could not be reached.</p>}

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
                key={road.id}
                className="segment"
                style={{ background: road.state.color, animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {source && (
        <p className="note">
          {live
            ? 'Speeds measured by TomTom on a busy stretch of each road, against the usual speed there when the road is clear.'
            : 'These are not measurements. Live traffic is unavailable right now, so each road shows its typical state for the time of day (rush hour, daytime, night).'}
        </p>
      )}

      {roads && (
        <section className="list">
          <header className="listHead">
            <h3 className="label">State by road</h3>
            <span className="listHint">Select one to find it on the map</span>
          </header>
          <ol className="rows">
            {roads.map(road => (
              <FocusRow
                key={road.id}
                id={`road-${road.id}`}
                points={road.path ?? []}
                focus={focus}
                onFocus={onFocus}
                className="row--road"
              >
                <span className="roadCode">{road.code}</span>
                <span className="rowMain">
                  <span className="rowTitle">{road.label.slice(road.code.length).trim()}</span>
                  {road.speed != null && (
                    <span className="rowSub">{road.speed} km/h · usual {road.freeFlow}</span>
                  )}
                </span>
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
