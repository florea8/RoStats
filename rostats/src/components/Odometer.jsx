const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/**
 * A figure whose digits roll into place like a counter: each digit is a
 * strip of 0–9 moved up to the right one, when the figure appears and again
 * whenever its value changes. Screen readers get the plain number.
 */
export default function Odometer({ value, decimals = 0 }) {
  const text = Number(value).toFixed(decimals)

  return (
    <span className="odo">
      <span className="visuallyHidden">{text}</span>
      {[...text].map((char, i) => (
        /\d/.test(char) ? (
          <span className="odoDigit" key={i} aria-hidden="true">
            <span className="odoStrip" style={{ '--digit': char, animationDelay: `${i * 90}ms` }}>
              {DIGITS.map(d => <span key={d}>{d}</span>)}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden="true">{char}</span>
        )
      ))}
    </span>
  )
}
