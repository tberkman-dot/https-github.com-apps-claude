# Product Requirements Document
## FlightWatch — Live Flight Tracker

**Author:** [Your Name]
**Date:** April 2026
**Status:** Complete

---

## 1. Problem Statement

Most flight tracking tools require an account, a subscription, or a mobile app download. There is no quick, zero-friction way to open a browser, see what planes are overhead right now, and click one to learn more — without signing up for anything or installing anything.

---

## 2. Goal

Build a live flight tracker that runs entirely in the browser as a single HTML file. The user should be able to open the file, see real aircraft on a map, click any plane to view its details, and search for a specific flight — all with no login, no server, and no installation.

---

## 3. Target User

- Students or curious people who want to know what that plane flying overhead is
- Aviation enthusiasts who want a lightweight, always-available tracker
- Anyone who wants instant access to live flight data without signing up for Flightradar24 or similar services

---

## 4. Core Features (Must Have)

| Feature | Description |
|---|---|
| Live flight map | Display real aircraft as icons on an interactive map, loaded from the OpenSky Network public API |
| Viewport-based loading | Only fetch flights within the current map view; update automatically when the user pans or zooms |
| Rotated plane icons | Each aircraft icon is rotated to match the plane's actual heading |
| Flight detail panel | Clicking a plane opens a panel showing callsign, country, altitude, speed, heading, vertical rate, and squawk code |
| Callsign search / filter | A search box filters visible markers by callsign or ICAO24 address in real time |
| Auto-refresh | Flights refresh automatically every 60 seconds to stay current |
| Manual refresh | A Refresh button lets the user force an immediate update |
| Error handling | Rate limit errors, timeouts, and API failures are displayed clearly instead of silently failing |

---

## 5. Nice-to-Have Features

| Feature | Description |
|---|---|
| Refresh countdown | A timer in the panel footer shows seconds until the next auto-refresh |
| Selected flight highlight | The clicked plane turns gold with a glow effect so it is easy to track visually |
| Loading overlay | A spinner covers the map during the first fetch so the user knows data is loading |
| Responsive dark theme | The interface uses a dark color scheme that works on desktop and most mobile browsers |

---

## 6. Non-Requirements (Out of Scope)

- User accounts or saved flights
- Historical flight data or playback
- Push notifications for flight status changes
- Native mobile app
- Paid API tiers or authentication

---

## 7. Technical Requirements

- Must work as a single `index.html` file with no local dependencies
- Must run in any modern browser (Chrome, Firefox, Safari, Edge) without installation
- Must use the OpenSky Network unauthenticated REST API (`/api/states/all`)
- Must respect the API rate limit: no more than one request per 10 seconds (app uses 60 s)
- Map must use Leaflet.js loaded from CDN
- All unit conversions (metres → feet, m/s → knots) must happen at display time only

---

## 8. Success Criteria

- The app loads and displays live flights within 15 seconds of opening
- Clicking a plane shows accurate data matching the OpenSky API response
- Panning the map to a new region fetches and displays flights in that region
- Typing a callsign in the search box filters markers without making a new API request
- The app shows a meaningful error message if the API is rate-limited or unavailable
- Closing and reopening the file starts fresh with no stale data
