const SIZE = 100   // the plot is drawn on a 100 × 100 grid and stretched to fit

/**
 * Small line chart of a continuous reading, with a labelled scale spanning
 * the observed range. The line is revealed from left to right when it
 * appears. Needs at least two values.
 *
 * summary: sentence read by screen readers in place of the drawing
 * color:   scale color of the latest value, used for the line's end point
 */
export default function TrendChart({ values, startLabel, endLabel, summary, color }) {
  const numbers = values.map(Number)
  const max = Math.max(...numbers)
  const min = Math.min(...numbers)
  const y = v => (max === min ? SIZE / 2 : SIZE - ((v - min) / (max - min)) * SIZE)
  const step = SIZE / (numbers.length - 1)
  const line = numbers.map((v, i) => `${i * step},${y(v)}`).join(' ')

  return (
    <div className="chart">
      <div className="chartScale label" aria-hidden="true">
        <span>{Math.round(max)}</span>
        <span>{Math.round(min)}</span>
      </div>
      <div className="chartPlot">
        <svg
          className="chartSvg"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={summary}
        >
          <polygon className="chartArea" points={`0,${SIZE} ${line} ${SIZE},${SIZE}`} />
          <polyline className="chartLine" points={line} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="chartDot" style={{ top: `${y(numbers.at(-1))}%`, background: color }} aria-hidden="true" />
      </div>
      <div className="chartSpan label" aria-hidden="true">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  )
}
