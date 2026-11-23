# RoStats

**Romania in live data.** Earthquakes, air quality, weather and traffic across Romania on one dark, animated map, plus a board of national economic indicators. Every figure is labelled with where it comes from.

**Live site:** https://ro-stats.vercel.app

## What it shows

| Section | What you see | Source | Refreshes |
| --- | --- | --- | --- |
| Earthquakes | The last 30 days of events in and around Romania, a seismogram strip and a replay of the month on the map | [EMSC](https://www.emsc-csem.org) | every 5 min |
| Air quality | Current US AQI for the 15 largest cities and a 24-hour trend for Bucharest | [Open-Meteo](https://open-meteo.com) (CAMS Europe) | every 10 min |
| Weather | Temperature, feels-like, humidity, wind and conditions for the same 15 cities | [Open-Meteo](https://open-meteo.com) | every 10 min |
| Traffic | Free / slow / heavy state on eight main roads (A1, A2, A3, A7, A10, DN1, DN7) | [TomTom Traffic Flow](https://developer.tomtom.com) | every 30 min (cached) |
| Indicators | GDP growth, GDP per capita, inflation, unemployment, net earnings, industrial output, budget deficit, public debt, population | [Eurostat](https://ec.europa.eu/eurostat) | every 6 h (cached) |

Each section shows a source badge: **Live** for real data, **Demo** when the upstream source is unreachable and typical values are shown instead. The site never shows a blank panel because one provider is down.

## How it is built

```
RoStats/
├── rostats/      React 19 + Vite frontend (Leaflet map, TanStack Query)
├── server/       API logic, plus an Express server for local development
│   ├── handlers.js   one handler per endpoint, shared by Express and Vercel
│   ├── lib/          one module per data source, PostgreSQL access
│   └── db/schema.sql
├── api/          Vercel serverless functions, thin wrappers around server/handlers.js
├── shared/       cities.json, used by both the frontend and the API
└── .github/      CI and the hourly AQI snapshot workflow
```

- **One implementation per endpoint.** `server/handlers.js` is used both by the Express dev server and by the Vercel functions in `api/`, so local and production behave the same.
- **No keys for most data.** EMSC, Open-Meteo, Eurostat and the Esri basemap need no API key. Only live traffic needs a TomTom key; without it, `/api/traffic` serves the typical state for the time of day.
- **CDN caching instead of a cache layer.** Responses set `Cache-Control: s-maxage`, so Vercel's edge serves repeat requests without calling the upstream APIs. Traffic is cached for 30 minutes to stay inside TomTom's free allowance.
- **Optional history in PostgreSQL.** With `DATABASE_URL` set, the API stores earthquakes and AQI readings, which power the 24-hour AQI trend. Without it, everything else works and the history endpoints return empty lists.

## API

All endpoints are `GET` and return JSON shaped `{ ok, data, source }`, where `source` is `live` or `demo`.

| Endpoint | Returns |
| --- | --- |
| `/api/earthquakes` | Events from the last 30 days, newest first |
| `/api/aqi` | Current US AQI per city |
| `/api/weather?city=<id>` | Current weather for one city, or all cities without `city` |
| `/api/traffic` | State and speed for each road |
| `/api/indicators` | Latest and previous value of each national indicator |
| `/api/history/aqi?city=<id>&hours=24` | Hourly average AQI (1–168 hours, needs a database) |
| `/api/history/earthquakes?days=7` | Daily earthquake count and magnitudes (1–30 days, needs a database) |
| `/api/health` | `{ status: "ok" }` |

City ids are listed in [shared/cities.json](shared/cities.json) (`bucuresti`, `cluj`, `iasi`, …).

## Running locally

Requires Node.js 22.12 or newer (CI uses Node 24).

```bash
# 1. API on http://localhost:3001
cd server
cp .env.example .env      # all values are optional, see below
npm install
npm run dev

# 2. Frontend on http://localhost:5173 (in a second terminal)
cd rostats
npm install
npm run dev
```

Vite proxies `/api` to the Express server, so no frontend configuration is needed.

### Environment variables (`server/.env`)

| Variable | Needed for | Default |
| --- | --- | --- |
| `TOMTOM_KEY` | Live traffic ([free key](https://developer.tomtom.com)) | typical traffic by time of day |
| `DATABASE_URL` | AQI and earthquake history | history endpoints return `[]` |
| `PORT` | Express port | `3001` |
| `CLIENT_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

To set up the database, create a PostgreSQL database (Neon, Supabase or local) and apply the schema. It is safe to run more than once:

```bash
psql "$DATABASE_URL" -f server/db/schema.sql
```

## Tests and checks

```bash
cd rostats && npm run lint && npm test && npm run build   # Vitest unit tests for src/utils
cd server  && npm run lint && npm test                    # node:test API tests, upstream calls mocked
```

GitHub Actions runs the same checks on every push to `main` and on every pull request ([ci.yml](.github/workflows/ci.yml)).

## Deployment

The site runs on Vercel from the repository root:

- [vercel.json](vercel.json) builds `rostats/` and serves `rostats/dist`; every path except `/api/*` falls back to the single-page app.
- Each file in `api/` becomes a serverless function. Their dependencies come from the root `package.json`.
- In the Vercel project settings, set `TOMTOM_KEY` and `DATABASE_URL` as needed. Leave `VITE_API_BASE` unset: the frontend and API share one origin, and pointing it elsewhere causes CORS errors.

An hourly GitHub Actions job ([aqi-snapshot.yml](.github/workflows/aqi-snapshot.yml)) requests `/api/aqi` so the AQI history has no gaps when the site has no visitors.

## Data credits

Earthquake data from EMSC, air quality and weather from Open-Meteo (CAMS), traffic from TomTom, statistics from Eurostat, basemap tiles from Esri, map rendering by Leaflet.
