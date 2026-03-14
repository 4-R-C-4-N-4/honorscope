# Honorscope

An interactive 3D astrology app that calculates and visualizes real-time planetary positions across the zodiac. Unlike traditional astrology tools locked to an Earth-centric view, Honorscope lets you place yourself on any celestial body in the solar system — see the sky from the surface of Mars, the orbit of Pluto, or the heart of the Sun.

## Features

- **Any vantage point** — View planetary positions from Earth, the Sun, or any planet and dwarf planet in the solar system (Mercury through Makemake)
- **Real-time 3D visualization** — Interactive solar system rendered with Three.js, with logarithmically scaled orbits so every body stays visible
- **Accurate astronomy** — Positions computed using the astronomy-engine library and Keplerian orbital elements with Newton-Raphson solving
- **Time travel** — Scrub to any date, play forward or backward at up to 10,000x speed
- **Zodiac overlay** — See which sign each planet occupies with degree-minute precision and astrological interpretations
- **Zodiac ring** — Color-coded zodiac segments projected onto the 3D ecliptic plane

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Tech Stack

- **TypeScript** + **Vite**
- **Three.js** — 3D rendering, orbit controls, CSS2D labels
- **astronomy-engine** — Planetary position calculations

## License

MIT
