/** Small outlined square showing the scale color of a data value. */
export default function Swatch({ color }) {
  return <span className="swatch" style={{ background: color }} aria-hidden="true" />
}
