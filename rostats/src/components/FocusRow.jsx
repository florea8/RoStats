/**
 * A list row that can be picked to find its subject on the map. Picking it
 * again releases the map back to the whole country.
 *
 * id:     unique within the page, e.g. a quake id or "city-cluj"
 * points: [[lat, lng], …]; one point for a place, several for a road
 * focus:  the current pick from App ({ id, points } or null)
 */
export default function FocusRow({ id, points, focus, onFocus, className = '', children }) {
  const picked = focus?.id === id
  return (
    <li>
      <button
        type="button"
        className={`row ${className}`}
        aria-pressed={picked}
        onClick={() => onFocus(picked ? null : { id, points })}
      >
        {children}
      </button>
    </li>
  )
}
