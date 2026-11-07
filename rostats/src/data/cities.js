// Same list the API uses (shared/cities.json), plus an uppercase label for the UI.
import cities from '@shared/cities.json'

export const CITIES = cities.map(c => ({ ...c, label: c.name.toUpperCase() }))
