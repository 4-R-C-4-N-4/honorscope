import * as Astronomy from 'astronomy-engine';
import { PLANETS, ZODIAC_SIGNS } from './types';
import type { PlanetPosition, ZodiacSign } from './types';

// Bodies natively supported by astronomy-engine
const NATIVE_BODIES = new Set(['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']);

// Keplerian orbital elements for dwarf planets (J2000 epoch)
// Sources: JPL Small-Body Database
interface OrbitalElements {
  a: number;       // semi-major axis (AU)
  e: number;       // eccentricity
  i: number;       // inclination (degrees)
  omega: number;   // argument of perihelion (degrees)
  Omega: number;   // longitude of ascending node (degrees)
  M0: number;      // mean anomaly at epoch (degrees)
  n: number;       // mean motion (degrees/day)
  epoch: number;   // epoch as Julian Date
}

const DWARF_PLANET_ELEMENTS: Record<string, OrbitalElements> = {
  Ceres: {
    a: 2.7691651545,
    e: 0.0760090291,
    i: 10.59406704,
    omega: 73.59769486,
    Omega: 80.30553156,
    M0: 77.37209589,
    n: 0.21408165,
    epoch: 2451545.0,
  },
  Eris: {
    a: 67.864,
    e: 0.44068,
    i: 44.04,
    omega: 151.639,
    Omega: 35.877,
    M0: 205.989,
    n: 0.001771,
    epoch: 2451545.0,
  },
  Haumea: {
    a: 43.218,
    e: 0.19126,
    i: 28.213,
    omega: 239.041,
    Omega: 122.167,
    M0: 218.205,
    n: 0.003467,
    epoch: 2451545.0,
  },
  Makemake: {
    a: 45.430,
    e: 0.16126,
    i: 28.983,
    omega: 297.240,
    Omega: 79.382,
    M0: 165.514,
    n: 0.003231,
    epoch: 2451545.0,
  },
};

// J2000 obliquity for ecliptic/equatorial conversions
const OBLIQUITY_RAD = 23.4393 * (Math.PI / 180);
const COS_OBL = Math.cos(OBLIQUITY_RAD);
const SIN_OBL = Math.sin(OBLIQUITY_RAD);

// Solve Kepler's equation M = E - e*sin(E) using Newton-Raphson
function solveKepler(M: number, e: number, tolerance: number = 1e-10): number {
  const Mrad = M * (Math.PI / 180);
  let E = Mrad;
  for (let iter = 0; iter < 100; iter++) {
    const dE = (E - e * Math.sin(E) - Mrad) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < tolerance) break;
  }
  return E;
}

// Compute heliocentric position from Keplerian elements
// Returns equatorial {x,y,z} in AU and ecliptic longitude in degrees
function keplerianPosition(elements: OrbitalElements, jd: number): { x: number; y: number; z: number; eclX: number; eclY: number; eclZ: number } {
  const daysSinceEpoch = jd - elements.epoch;
  const M = (elements.M0 + elements.n * daysSinceEpoch) % 360;
  const E = solveKepler(M, elements.e);

  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const sqrt1me2 = Math.sqrt(1 - elements.e * elements.e);
  const cosV = (cosE - elements.e) / (1 - elements.e * cosE);
  const sinV = (sqrt1me2 * sinE) / (1 - elements.e * cosE);
  const v = Math.atan2(sinV, cosV);

  const r = elements.a * (1 - elements.e * cosE);

  const omegaRad = elements.omega * (Math.PI / 180);
  const OmegaRad = elements.Omega * (Math.PI / 180);
  const iRad = elements.i * (Math.PI / 180);

  const cosOmega = Math.cos(OmegaRad);
  const sinOmega = Math.sin(OmegaRad);
  const cosI = Math.cos(iRad);
  const sinI = Math.sin(iRad);
  const cosWV = Math.cos(omegaRad + v);
  const sinWV = Math.sin(omegaRad + v);

  // Heliocentric ecliptic coordinates
  const eclX = r * (cosOmega * cosWV - sinOmega * sinWV * cosI);
  const eclY = r * (sinOmega * cosWV + cosOmega * sinWV * cosI);
  const eclZ = r * (sinWV * sinI);

  // Convert ecliptic to equatorial
  const x = eclX;
  const y = eclY * COS_OBL - eclZ * SIN_OBL;
  const z = eclY * SIN_OBL + eclZ * COS_OBL;

  return { x, y, z, eclX, eclY, eclZ };
}

// Convert equatorial vector to ecliptic longitude (degrees 0-360)
function equatorialToEclipticLongitude(x: number, y: number, z: number): number {
  // Convert equatorial back to ecliptic
  const eclX = x;
  const eclY = y * COS_OBL + z * SIN_OBL;
  // eclZ not needed for longitude
  let longitude = Math.atan2(eclY, eclX) * (180 / Math.PI);
  return ((longitude % 360) + 360) % 360;
}

// Convert a JS Date to Julian Date
function dateToJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

// Get heliocentric equatorial position for any body
function getHelioPosition(body: string, time: Astronomy.AstroTime, jd: number): { x: number; y: number; z: number } | null {
  if (NATIVE_BODIES.has(body)) {
    const vec = Astronomy.HelioVector(body as Astronomy.Body, time);
    return { x: vec.x, y: vec.y, z: vec.z };
  } else if (DWARF_PLANET_ELEMENTS[body]) {
    const pos = keplerianPosition(DWARF_PLANET_ELEMENTS[body], jd);
    return { x: pos.x, y: pos.y, z: pos.z };
  }
  return null;
}

// Map ecliptic longitude (0-360) to zodiac sign
function getZodiacSign(longitude: number): ZodiacSign {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  return ZODIAC_SIGNS[index];
}

function getDegreeInSign(longitude: number): number {
  const normalized = ((longitude % 360) + 360) % 360;
  return normalized % 30;
}

function formatPosition(longitude: number, sign: ZodiacSign): string {
  const degInSign = getDegreeInSign(longitude);
  const degrees = Math.floor(degInSign);
  const minutes = Math.floor((degInSign - degrees) * 60);
  return `${degrees}°${minutes.toString().padStart(2, '0')}' ${sign.name}`;
}

// Get all planetary positions for a given date, as seen from the observer body
// observer = 'Earth' by default (geocentric), but can be any body
// For the Sun as observer, this falls back to heliocentric
export function getPlanetaryPositions(date: Date, observer: string = 'Earth'): PlanetPosition[] {
  const time = Astronomy.MakeTime(date);
  const jd = dateToJulianDate(date);
  const positions: PlanetPosition[] = [];

  // Get the observer's heliocentric position (null for Sun = origin)
  const observerHelio = observer === 'Sun' ? { x: 0, y: 0, z: 0 } : getHelioPosition(observer, time, jd);
  if (!observerHelio) return positions;

  for (const planet of PLANETS) {
    // Skip the observer body itself
    if (planet.body === observer) continue;

    try {
      // Get the target's heliocentric position
      let targetHelio: { x: number; y: number; z: number } | null;
      if (planet.body === 'Sun') {
        targetHelio = { x: 0, y: 0, z: 0 };
      } else {
        targetHelio = getHelioPosition(planet.body, time, jd);
      }
      if (!targetHelio) continue;

      // Heliocentric position (for 3D rendering - always physical position)
      const helioX = targetHelio.x;
      const helioY = targetHelio.y;
      const helioZ = targetHelio.z;

      // Apparent position vector: from observer to target
      const relX = targetHelio.x - observerHelio.x;
      const relY = targetHelio.y - observerHelio.y;
      const relZ = targetHelio.z - observerHelio.z;

      // Ecliptic longitude as seen from the observer (this determines the zodiac sign)
      const eclipticLong = equatorialToEclipticLongitude(relX, relY, relZ);

      const zodiacSign = getZodiacSign(eclipticLong);
      const degreeInSign = getDegreeInSign(eclipticLong);

      positions.push({
        name: planet.name,
        x: helioX,
        y: helioY,
        z: helioZ,
        eclipticLongitude: eclipticLong,
        zodiacSign,
        degreeInSign,
        formattedPosition: formatPosition(eclipticLong, zodiacSign),
      });
    } catch (e) {
      console.warn(`Failed to compute position for ${planet.name}:`, e);
    }
  }

  return positions;
}

// Generate orbit path points for a planet over one full orbit
export function getOrbitPath(planetBody: string, referenceDate: Date, steps: number = 360): { x: number; y: number; z: number }[] {
  const orbitalPeriods: Record<string, number> = {
    Mercury: 87.97,
    Venus: 224.7,
    Earth: 365.25,
    Mars: 687.0,
    Jupiter: 4332.59,
    Saturn: 10759.22,
    Uranus: 30688.5,
    Neptune: 60182.0,
    Pluto: 90560.0,
    Ceres: 1680.5,
    Eris: 203830.0,
    Haumea: 103774.0,
    Makemake: 111845.0,
  };

  const period = orbitalPeriods[planetBody] || 365.25;
  const points: { x: number; y: number; z: number }[] = [];
  const startTime = referenceDate.getTime();

  for (let i = 0; i <= steps; i++) {
    const dayOffset = (i / steps) * period;
    const date = new Date(startTime + dayOffset * 24 * 60 * 60 * 1000);

    try {
      if (NATIVE_BODIES.has(planetBody)) {
        const t = Astronomy.MakeTime(date);
        const vec = Astronomy.HelioVector(planetBody as Astronomy.Body, t);
        points.push({ x: vec.x, y: vec.y, z: vec.z });
      } else if (DWARF_PLANET_ELEMENTS[planetBody]) {
        const jd = dateToJulianDate(date);
        const pos = keplerianPosition(DWARF_PLANET_ELEMENTS[planetBody], jd);
        points.push({ x: pos.x, y: pos.y, z: pos.z });
      }
    } catch (e) {
      // skip point on error
    }
  }

  return points;
}

// List of all available vantage bodies
export function getAvailableBodies(): string[] {
  return ['Earth', 'Sun', ...PLANETS.map(p => p.name).filter(n => n !== 'Earth')];
}
