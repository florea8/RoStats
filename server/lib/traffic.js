// Traffic on the main roads from the TomTom Traffic Flow API (needs
// TOMTOM_KEY). Each road is measured at one point taken from its
// OpenStreetMap geometry, on a stretch where traffic usually builds up;
// TomTom answers with the speed on the road segment at that point.
// One point per road keeps a refresh at eight requests, inside the free
// allowance of 20,000 a month with the 30-minute cache in handlers.js.
const FLOW_URL = 'https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json';

// typical: the state assumed for each time of day when no live data is available.
const ROADS = [
  { id: 'a1-east', name: 'A1  BUC – PITEȘTI',      point: [44.47019, 25.70027],
    typical: { offPeak: 'FREE', normal: 'FREE', rush: 'SLOW' } },
  { id: 'a1-west', name: 'A1  SIBIU – TIMIȘOARA',  point: [45.94658, 22.69672],
    typical: { offPeak: 'FREE', normal: 'FREE', rush: 'FREE' } },
  { id: 'a2',      name: 'A2  BUC – CONSTANȚA',    point: [44.44269, 26.78527],
    typical: { offPeak: 'FREE', normal: 'SLOW', rush: 'HEAVY' } },
  { id: 'a3',      name: 'A3  BUC – PLOIEȘTI',     point: [44.62644, 26.18719],
    typical: { offPeak: 'FREE', normal: 'FREE', rush: 'SLOW' } },
  { id: 'a7',      name: 'A7  PLOIEȘTI – BACĂU',   point: [45.37825, 27.09380],
    typical: { offPeak: 'FREE', normal: 'FREE', rush: 'SLOW' } },
  { id: 'a10',     name: 'A10 SEBEȘ – TURDA',      point: [46.25550, 23.70242],
    typical: { offPeak: 'FREE', normal: 'FREE', rush: 'FREE' } },
  { id: 'dn1',     name: 'DN1 BUC – BRAȘOV',       point: [45.29047, 25.61237],
    typical: { offPeak: 'FREE', normal: 'SLOW', rush: 'HEAVY' } },
  { id: 'dn7',     name: 'DN7 RM.VÂL – SIBIU',     point: [45.26734, 24.31828],
    typical: { offPeak: 'FREE', normal: 'FREE', rush: 'SLOW' } },
];

/** State from current speed as a share of free-flow speed. */
function stateFor(ratio) {
  if (ratio >= 0.8) return 'FREE';
  if (ratio >= 0.5) return 'SLOW';
  return 'HEAVY';
}

/** Rush hour, daytime or night, by the hour in Romania (the server runs in UTC). */
function period(date = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric', hourCycle: 'h23', timeZone: 'Europe/Bucharest',
  }).format(date));
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) return 'rush';
  if (hour >= 22 || hour <= 5) return 'offPeak';
  return 'normal';
}

async function measurePoint([lat, lng], key) {
  const url = `${FLOW_URL}?point=${lat},${lng}&unit=KMPH&key=${encodeURIComponent(key)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`TomTom answered ${res.status}`);
  const { flowSegmentData: flow } = await res.json();
  if (!flow || !(flow.freeFlowSpeed > 0)) throw new Error('TomTom returned no flow data');
  return {
    speed: flow.currentSpeed,
    freeFlow: flow.freeFlowSpeed,
    ratio: flow.roadClosure ? 0 : flow.currentSpeed / flow.freeFlowSpeed,
  };
}

async function measureRoad(road, key) {
  const { speed, freeFlow, ratio } = await measurePoint(road.point, key);
  return { status: stateFor(ratio), speed, freeFlow };
}

/**
 * Returns { data: [{ id, name, status, speed?, freeFlow? }], source: 'live' | 'simulated' }.
 * Never throws: without a key, or if any road can't be measured, every road
 * gets its typical state for the time of day and the response says so.
 */
async function getTraffic(now = new Date()) {
  const key = process.env.TOMTOM_KEY;
  if (key) {
    try {
      const measured = await Promise.all(ROADS.map(road => measureRoad(road, key)));
      return { data: ROADS.map((road, i) => ({ id: road.id, name: road.name, ...measured[i] })), source: 'live' };
    } catch (err) {
      console.error('Traffic fetch failed, serving typical states:', err.message);
    }
  }
  const p = period(now);
  return { data: ROADS.map(road => ({ id: road.id, name: road.name, status: road.typical[p] })), source: 'simulated' };
}

module.exports = { getTraffic, stateFor, period };
