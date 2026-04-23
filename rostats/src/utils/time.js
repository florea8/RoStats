export function timeAgo(timestamp) {
  const s = (Date.now() - timestamp) / 1000;
  if (s < 3600)  return Math.round(s / 60) + 'min';
  if (s < 86400) return Math.round(s / 3600) + 'h';
  return Math.round(s / 86400) + 'zile';
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString('ro-RO');
}

export function formatUpdated(date = new Date()) {
  return 'ACTUALIZAT ' + date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
}
