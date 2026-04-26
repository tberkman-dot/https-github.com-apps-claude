# Project Description
## FlightWatch — Live Flight Tracker

### What I Built

I built a live flight tracker called FlightWatch using Claude Code (Anthropic's AI coding assistant). The app is a single HTML file that runs entirely in the browser — no sign-up, no server, no installation required.

Open the file in Chrome or Firefox and you immediately see a dark interactive map with real aircraft on it. Every plane is represented by a small icon rotated to match its actual heading. You can:

- Pan and zoom the map to any region of the world
- Click any aircraft to open a detail panel showing its callsign, country of origin, altitude, ground speed, heading, vertical rate (climbing or descending), and squawk code
- Search for a specific flight by typing a callsign or ICAO24 code in the search bar
- Hit Refresh to pull the latest data immediately, or let the app auto-refresh every 60 seconds

Flight data comes from the **OpenSky Network**, a free public API that aggregates real-time ADS-B transponder data from a global network of volunteer receivers. No API key is needed.

### How I Built It

I used **Claude Code**, Anthropic's AI coding tool. I described what I wanted — a live flight map that works in the browser with no backend — and Claude wrote the full application as a single `index.html` using HTML, CSS, and vanilla JavaScript, with Leaflet.js for the map and the OpenSky API for flight data.

I also worked with Claude to write a `CLAUDE.md` file that serves as a complete instruction manual for any AI agent that works on this codebase in the future. That file documents the API's data format, explains how every part of the code works, and tells the agent exactly what to do (and what not to break) when making changes.

### What the CLAUDE.md Does

The `CLAUDE.md` is not a description of the project — it is a set of instructions written for an AI agent. It explains:

- How to run the app
- How the OpenSky API works (endpoint, parameters, response format, rate limits)
- The complete field index reference for the API's state-vector array
- How the Leaflet map and SVG plane icons work
- How to add new data fields to the flight detail panel
- How the auto-refresh and timer logic works
- Coding conventions to follow
- Specific things the agent must not break

The idea is that if I hand this project to Claude (or another AI agent) and say "add a feature," the agent can read `CLAUDE.md` and understand exactly how the codebase works before touching anything.

### What I Learned

This project taught me how a well-written `CLAUDE.md` changes the quality of AI-assisted development. When the agent has clear documentation about the data structures, the API, and the invariants it must preserve, it makes much better decisions — and makes far fewer mistakes — than when it is working blind.

I also learned about real-time ADS-B data, how unit conversions work between the metric API and the imperial display, and how Leaflet.js handles dynamic map markers.
