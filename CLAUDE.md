# FlightWatch — Agent Instructions

## What This Project Is

FlightWatch is a live flight tracker that runs as a single `index.html` file in the browser. It fetches real-time flight data from the OpenSky Network public API, renders aircraft as SVG icons on an interactive Leaflet map, and shows flight details (altitude, speed, heading, vertical rate, squawk) in a slide-in panel when a plane is clicked.

No build step. No server. Open `index.html` in a browser and it works.

---

## How to Run

1. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).
2. The app fetches live flights for the current map viewport on load.
3. Pan or zoom the map to see flights in other regions.
4. Click any plane icon to open the detail panel.
5. Use the search box to filter by callsign or ICAO24 address.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| UI         | Vanilla HTML/CSS/JavaScript — no frameworks     |
| Map        | [Leaflet.js 1.9.4](https://leafletjs.com) via CDN |
| Tile layer | CartoDB Dark Matter (dark theme, free, no key)  |
| Flight data | [OpenSky Network REST API](https://opensky-network.org/apidoc) |

---

## Architecture

Everything lives in `index.html` in three sections:

- **`<style>`** — all CSS; dark theme using GitHub-style color tokens (`#0d1117`, `#161b22`, `#30363d`, `#58a6ff`, etc.)
- **`<body>`** — header bar, Leaflet map div, loading overlay, flight detail panel
- **`<script>`** — all application logic; no modules, no bundler

### Key objects

```
flightData   object   icao24 → { marker: L.Marker, state: Array }
selectedIcao string   ICAO24 of currently highlighted flight, or null
map          L.Map    the Leaflet map instance
```

---

## OpenSky API Reference

**Endpoint:** `GET https://opensky-network.org/api/states/all`

**Query params (all required for bounding-box queries):**

| Param  | Description              |
|--------|--------------------------|
| lamin  | Min latitude (south)     |
| lomin  | Min longitude (west)     |
| lamax  | Max latitude (north)     |
| lomax  | Max longitude (east)     |

**Rate limits (unauthenticated):**
- Minimum 10 s between requests for the same bounding box
- The app uses 60 s auto-refresh; do not lower this below 15 s or you risk 429 errors
- 429 responses are caught and displayed as an error message

**Response shape:**

```json
{
  "time": 1710000000,
  "states": [
    ["abc123", "UAL123  ", "United States", 1710000000, 1710000000,
     -87.63, 41.88, 10668, false, 231.0, 270.0, 0.0, null, 11278, "1200", false, 0],
    ...
  ]
}
```

Each state is a fixed-length array. The `F` constant in the script maps names to indices:

| Constant        | Index | Field           | Unit / Notes                        |
|-----------------|-------|-----------------|-------------------------------------|
| `F.ICAO24`      | 0     | ICAO 24-bit address | hex string, e.g. `"abc123"`    |
| `F.CALLSIGN`    | 1     | Callsign        | padded with spaces — always `.trim()` |
| `F.COUNTRY`     | 2     | Origin country  | string                              |
| `F.TIME_POS`    | 3     | Last position timestamp | Unix seconds                |
| `F.LAST_CONTACT`| 4     | Last contact    | Unix seconds                        |
| `F.LON`         | 5     | Longitude       | WGS-84 degrees                      |
| `F.LAT`         | 6     | Latitude        | WGS-84 degrees                      |
| `F.BARO_ALT`    | 7     | Barometric altitude | **metres** → multiply by 3.28084 for feet |
| `F.ON_GROUND`   | 8     | On ground       | boolean                             |
| `F.VELOCITY`    | 9     | Ground speed    | **m/s** → multiply by 1.94384 for knots |
| `F.HEADING`     | 10    | True track      | degrees, 0 = north, used to rotate SVG icon |
| `F.VERT_RATE`   | 11    | Vertical rate   | **m/s**, positive = climbing, negative = descending |
| `F.GEO_ALT`     | 13    | Geometric altitude | **metres** (index 12 is sensors array, often null) |
| `F.SQUAWK`      | 14    | Squawk code     | string, e.g. `"7500"` (hijack), `"1200"` (VFR) |

Any field can be `null` — always null-check before using.

---

## How the Map & Markers Work

`initMap()` creates the Leaflet map and attaches a `moveend` listener so new flights are fetched whenever the user pans or zooms.

`makePlaneIcon(heading, selected)` returns a `L.divIcon` containing an inline SVG polygon rotated `heading` degrees. Selected planes are gold (`#ffd700`) with a glow filter; unselected planes are blue (`#58a6ff`).

`renderFlights(states)` is the main render loop:
1. Iterates the API response, skipping states with null lat/lon.
2. Applies the callsign search filter if the search box has text.
3. Updates existing markers (move + re-icon) or creates new ones.
4. Removes markers whose ICAO24 is no longer in the response.
5. Refreshes the detail panel if the selected flight was updated.

Marker click calls `selectFlight(icao)`, which highlights the icon and calls `renderPanel(icao)`.

---

## Detail Panel

`renderPanel(icao)` reads from `flightData[icao].state` and builds the rows array:

```js
const rows = [
    ['Country',  ..., ''],
    ['ICAO24',   ..., ''],
    ['Altitude', ..., ''],
    ['Speed',    ..., ''],
    ['Heading',  ..., ''],
    ['Vertical', ..., 'climbing' | 'descending' | 'on-ground'],
    ['Squawk',   ..., ''],
];
```

**To add a new data field to the panel**, add an entry to the `rows` array inside `renderPanel()`. The third element is a CSS class applied to the value span (use `''` for default white, or one of the existing classes).

Example — adding geometric altitude:
```js
['Geo Alt', s[F.GEO_ALT] != null ? Math.round(s[F.GEO_ALT] * 3.28084).toLocaleString() + ' ft' : 'N/A', ''],
```

---

## Auto-Refresh

`scheduleRefresh()` sets a 60 s `setTimeout` for the next fetch and a 1 s `setInterval` that counts down in the panel footer. Both are cleared and reset after every fetch (success or failure). The manual Refresh button also clears and restarts the timers.

Do not reduce `REFRESH_MS` below 15 000 without adding authentication to the API call.

---

## Coding Conventions

- All logic is in the single `<script>` block; keep it that way.
- CSS colour tokens are inline hex values matching GitHub's dark palette. Do not introduce CSS variables — keep the file self-contained.
- Never use `innerHTML` to render user-supplied text without escaping (callsigns and country names come from the API, not user input, so they are safe as-is, but be careful if you add features that render user input).
- Null-check every OpenSky field before using it. The API frequently returns `null` for altitude, velocity, and vertical rate.
- Units from the API are always metric (metres, m/s). Convert to imperial in the display layer only.
- Keep `F` as the single source of truth for array indices. Never hard-code index numbers in other functions.

---

## What Not to Break

- The `F` constant — if you renumber indices, all data reads will silently return wrong values.
- The `flightData` structure — both `marker` and `state` must stay in sync; `renderPanel` reads from `state`, Leaflet reads from `marker`.
- The `moveend` listener — removing it means the map never refreshes when panned.
- The `AbortSignal.timeout` on the fetch — without it, a stalled request will block the refresh loop indefinitely.
- The marker removal loop at the end of `renderFlights` — skipping it causes ghost markers to accumulate.
