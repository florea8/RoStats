/** "MODERATE" → "Moderate", "light rain" → "Light rain". */
export function sentenceCase(text) {
  if (!text) return ''
  return text[0].toUpperCase() + text.slice(1).toLowerCase()
}
