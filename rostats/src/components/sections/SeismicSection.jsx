import { PALETTE, magColor } from '../../utils/colors'
import { dailyCounts } from '../../utils/earthquakes'
import { timeAgo } from '../../utils/time'
import SectionHeader from './SectionHeader'
import Sparkline from './Sparkline'

export default function SeismicSection({ earthquakes }) {
  const { data: quakes, isLoading, isError, dataUpdatedAt } = earthquakes
  const counts = quakes ? dailyCounts(quakes, dataUpdatedAt) : []

  return (
    <>
      <SectionHeader
        icon="seismic"
        title="Seismic Activity"
        subtitle="Romania region · last 30 days"
        source={isError ? 'error' : quakes && 'live'}
        href="https://www.emsc-csem.org"
        linkLabel="EMSC"
      />

      {isLoading && <div className="loading"><div className="spin" />Loading seismic data…</div>}
      {isError && <div className="loading" style={{ color: 'var(--red)' }}>Could not reach EMSC</div>}
      {quakes?.length === 0 && <div className="loading">No earthquakes recorded in the last 30 days.</div>}

      <div className="eqList">
        {quakes?.slice(0, 10).map(q => {
          const { magnitude: mag, place, time } = q
          return (
            <div className="eqRow" key={q.id}>
              <div className="eqBar" style={{ background: magColor(mag) }} />
              <div className="eqMag" style={{ color: magColor(mag) }}>{mag.toFixed(1)}</div>
              <div className="eqBody">
                <div className="eqPlace">{place ?? '—'}</div>
                <div className="eqMeta">↓{q.depth_km}km · {timeAgo(time)}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="panel">
        <div className="panelHead">
          <span className="phTitle">Seismic frequency · 7 days</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--red)', letterSpacing: 1 }}>
            {counts.length ? Math.max(...counts) : 0}/DAY MAX
          </span>
        </div>
        <div className="sparkWrap">
          <div className="sparkLabel"><span>events per day</span></div>
          <Sparkline values={counts} color={PALETTE.red} />
        </div>
      </div>
    </>
  )
}
