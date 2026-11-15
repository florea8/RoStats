/** True when the visitor has asked the system for less motion; animations then show their end state. */
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
