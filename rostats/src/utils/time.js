/** Compact relative time ("5m ago"); accepts an ISO string, Date or ms timestamp. */
export function timeAgo(value) {
  const s = (Date.now() - new Date(value).getTime()) / 1000;
  if (s < 3600)  return Math.round(s / 60) + 'm ago';
  if (s < 86400) return Math.round(s / 3600) + 'h ago';
  return Math.round(s / 86400) + 'd ago';
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString('en-GB');
}

export function formatUpdated(date = new Date()) {
  return 'UPDATED ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
