// National indicators for Romania from the Eurostat dissemination API
// (JSON-stat 2.0, no API key). Each series is filtered down to a single
// value per period, so only the time dimension is left to read.
const EUROSTAT = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/';

// better:  which direction is good news for the country (null: neither)
// scale:   multiplier from Eurostat's unit to the one shown
// signed:  show a + on positive values (rates of change)
const SERIES = [
  { id: 'gdpGrowth',    label: 'GDP growth',        unit: '% y/y',     better: 'higher', signed: true,
    dataset: 'namq_10_gdp',    filters: 'na_item=B1GQ&unit=CLV_PCH_SM&s_adj=SCA' },
  { id: 'gdpPerCapita', label: 'GDP per capita',    unit: 'k €',       better: 'higher', scale: 0.001,
    dataset: 'nama_10_pc',     filters: 'na_item=B1GQ&unit=CP_EUR_HAB' },
  { id: 'inflation',    label: 'Inflation',         unit: '% y/y',     better: 'lower',
    dataset: 'prc_hicp_minr',  filters: 'unit=RCH_A&coicop18=TOTAL' },
  { id: 'unemployment', label: 'Unemployment',      unit: '%',         better: 'lower',
    dataset: 'une_rt_m',       filters: 's_adj=SA&age=TOTAL&sex=T&unit=PC_ACT' },
  { id: 'netEarnings',  label: 'Net earnings',      unit: 'k € / year', better: 'higher', scale: 0.001,
    dataset: 'earn_nt_net',    filters: 'currency=EUR&estruct=NET&ecase=P1_NCH_AW100' },
  { id: 'industry',     label: 'Industrial output', unit: '% y/y',     better: 'higher', signed: true,
    dataset: 'sts_inpr_m',     filters: 'indic_bt=PRD&nace_r2=B-D&s_adj=CA&unit=PCH_SM' },
  // B9 is net lending (+) or borrowing (−); a deficit is shown as a positive share.
  { id: 'deficit',      label: 'Budget deficit',    unit: '% of GDP',  better: 'lower',  scale: -1,
    dataset: 'gov_10dd_edpt1', filters: 'na_item=B9&sector=S13&unit=PC_GDP' },
  { id: 'debt',         label: 'Public debt',       unit: '% of GDP',  better: 'lower',
    dataset: 'gov_10q_ggdebt', filters: 'na_item=GD&sector=S13&unit=PC_GDP' },
  { id: 'population',   label: 'Population',        unit: 'M',         better: null,     scale: 1e-6, decimals: 2,
    dataset: 'demo_gind',      filters: 'indic_de=JAN' },
];

// Latest published figures as of November 2026, served with source: 'demo'
// for any series Eurostat does not answer.
const FALLBACK = {
  gdpGrowth:    { value: 0.3,   previous: -1.9,  period: '2026-Q3', previousPeriod: '2026-Q2' },
  gdpPerCapita: { value: 20.1,  previous: 18.6,  period: '2025',    previousPeriod: '2024' },
  inflation:    { value: 6.5,   previous: 6.3,   period: '2026-09', previousPeriod: '2026-08' },
  unemployment: { value: 6.3,   previous: 6.4,   period: '2026-09', previousPeriod: '2026-08' },
  netEarnings:  { value: 13.9,  previous: 12.8,  period: '2025',    previousPeriod: '2024' },
  industry:     { value: -6.3,  previous: -2.5,  period: '2026-09', previousPeriod: '2026-08' },
  deficit:      { value: 7.8,   previous: 9.2,   period: '2025',    previousPeriod: '2024' },
  debt:         { value: 59.4,  previous: 59.7,  period: '2026-Q2', previousPeriod: '2026-Q1' },
  population:   { value: 19.04, previous: 19.04, period: '2026',    previousPeriod: '2025' },
};

/**
 * The two most recent periods that have a value, oldest first, from a
 * JSON-stat dataset whose only dimension left with several entries is time.
 */
function lastTwo(json) {
  const multi = json.id.filter((dim, i) => dim !== 'time' && json.size[i] !== 1);
  if (multi.length) throw new Error(`unfiltered dimensions: ${multi.join(', ')}`);

  const times = json.dimension.time.category.index;
  const points = Object.keys(times)
    .sort((a, b) => times[a] - times[b])
    .map(period => ({ period, value: json.value[times[period]] }))
    .filter(p => typeof p.value === 'number');
  if (points.length < 2) throw new Error('fewer than two values');
  return points.slice(-2);
}

const round = (value, decimals) => Number(value.toFixed(decimals));

async function fetchSeries(series) {
  // Monthly series are often a period or two behind, so a few are asked for.
  const url = `${EUROSTAT}${series.dataset}?format=JSON&lang=EN&geo=RO&lastTimePeriod=4&${series.filters}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${series.dataset}: Eurostat answered ${res.status}`);

  const [previous, latest] = lastTwo(await res.json());
  const decimals = series.decimals ?? 1;
  const scale = series.scale ?? 1;
  return {
    value:          round(latest.value * scale, decimals),
    previous:       round(previous.value * scale, decimals),
    period:         latest.period,
    previousPeriod: previous.period,
  };
}

/**
 * Returns { data: [{ id, label, unit, better, signed, decimals, value, previous,
 * period, previousPeriod, source }], source: 'live' | 'demo' }.
 * Never throws: a series Eurostat does not answer falls back to the last
 * known figures and is tagged source: 'demo', as is the whole response.
 */
async function getIndicators() {
  const results = await Promise.allSettled(SERIES.map(fetchSeries));

  let source = 'live';
  const data = SERIES.map((series, i) => {
    // What the page needs to show the figure; the query details stay here.
    const meta = {
      id: series.id, label: series.label, unit: series.unit, better: series.better,
      signed: Boolean(series.signed), decimals: series.decimals ?? 1,
    };
    const result = results[i];
    if (result.status === 'fulfilled') return { ...meta, ...result.value, source: 'live' };

    console.error(`Indicator ${series.id} failed, serving the fallback:`, result.reason.message);
    source = 'demo';
    return { ...meta, ...FALLBACK[series.id], source: 'demo' };
  });
  return { data, source };
}

module.exports = { getIndicators, lastTwo };
