// ============================================================
// Bright star catalog (subset of Yale Bright Star Catalog)
// Coordinates: RA (right ascension) in hours, Dec (declination) in degrees
// Magnitude: lower = brighter
// Source: public domain Bright Star Catalogue (5th ed.)
// ============================================================

export interface Star {
  name: string
  con: string // constellation
  ra: number // hours 0..24
  dec: number // degrees -90..90
  mag: number // visual magnitude
  bayer?: string // Bayer designation (alpha, beta...)
}

// ~80 brightest stars — enough for a readable sky map
export const BRIGHT_STARS: Star[] = [
  { name: 'Sirius', con: 'CMa', ra: 6.7525, dec: -16.7161, mag: -1.46 },
  { name: 'Canopus', con: 'Car', ra: 6.3992, dec: -52.6957, mag: -0.74 },
  { name: 'Arcturus', con: 'Boo', ra: 14.2610, dec: 19.1825, mag: -0.05 },
  { name: 'Rigel Kentaurus', con: 'Cen', ra: 14.6599, dec: -60.8354, mag: -0.27 },
  { name: 'Vega', con: 'Lyr', ra: 18.6156, dec: 38.7837, mag: 0.03 },
  { name: 'Capella', con: 'Aur', ra: 5.2782, dec: 45.9979, mag: 0.08 },
  { name: 'Rigel', con: 'Ori', ra: 5.2423, dec: -8.2016, mag: 0.13 },
  { name: 'Procyon', con: 'CMi', ra: 7.6550, dec: 5.2250, mag: 0.34 },
  { name: 'Achernar', con: 'Eri', ra: 1.6286, dec: -57.2367, mag: 0.46 },
  { name: 'Betegeuse', con: 'Ori', ra: 5.9195, dec: 7.4071, mag: 0.42 },
  { name: 'Hadar', con: 'Cen', ra: 14.0637, dec: -60.3730, mag: 0.61 },
  { name: 'Altair', con: 'Aql', ra: 19.8463, dec: 8.8683, mag: 0.77 },
  { name: 'Acrux', con: 'Cru', ra: 12.4433, dec: -63.0991, mag: 0.77 },
  { name: 'Aldebaran', con: 'Tau', ra: 4.5987, dec: 16.5093, mag: 0.85 },
  { name: 'Antares', con: 'Sco', ra: 16.4901, dec: -26.4320, mag: 0.96 },
  { name: 'Spica', con: 'Vir', ra: 13.4199, dec: -11.1614, mag: 0.98 },
  { name: 'Pollux', con: 'Gem', ra: 7.7553, dec: 28.0262, mag: 1.14 },
  { name: 'Fomalhaut', con: 'PsA', ra: 22.9608, dec: -29.6222, mag: 1.16 },
  { name: 'Deneb', con: 'Cyg', ra: 20.6905, dec: 45.2803, mag: 1.25 },
  { name: 'Mimosa', con: 'Cru', ra: 12.7953, dec: -59.6886, mag: 1.25 },
  { name: 'Regulus', con: 'Leo', ra: 10.1395, dec: 11.9672, mag: 1.35 },
  { name: 'Adhara', con: 'CMa', ra: 6.9770, dec: -28.9721, mag: 1.50 },
  { name: 'Castor', con: 'Gem', ra: 7.5766, dec: 31.8883, mag: 1.57 },
  { name: 'Shaula', con: 'Sco', ra: 17.5601, dec: -37.1038, mag: 1.62 },
  { name: 'Bellatrix', con: 'Ori', ra: 5.4188, dec: 6.3497, mag: 1.64 },
  { name: 'Elnath', con: 'Tau', ra: 5.4382, dec: 28.6075, mag: 1.65 },
  { name: 'Alnilam', con: 'Ori', ra: 5.6036, dec: -1.2019, mag: 1.69 },
  { name: 'Alnitak', con: 'Ori', ra: 5.6793, dec: -1.9426, mag: 1.74 },
  { name: 'Alioth', con: 'UMa', ra: 12.9005, dec: 55.9598, mag: 1.76 },
  { name: 'Mirfak', con: 'Per', ra: 3.4054, dec: 49.8612, mag: 1.79 },
  { name: 'Dubhe', con: 'UMa', ra: 11.0621, dec: 61.7508, mag: 1.79 },
  { name: 'Wezen', con: 'CMa', ra: 7.1399, dec: -26.3932, mag: 1.83 },
  { name: 'Kaus Australis', con: 'Sgr', ra: 18.4029, dec: -34.3846, mag: 1.85 },
  { name: 'Avior', con: 'Car', ra: 8.3753, dec: -59.5095, mag: 1.86 },
  { name: 'Alkaid', con: 'UMa', ra: 13.7923, dec: 49.3133, mag: 1.86 },
  { name: 'Sargas', con: 'Sco', ra: 17.6219, dec: -42.9978, mag: 1.87 },
  { name: 'Menkalinan', con: 'Aur', ra: 5.9921, dec: 44.9474, mag: 1.90 },
  { name: 'Atria', con: 'TrA', ra: 16.8111, dec: -69.0277, mag: 1.91 },
  { name: 'Alhena', con: 'Gem', ra: 6.6285, dec: 16.3992, mag: 1.93 },
  { name: 'Peacock', con: 'Pav', ra: 20.4275, dec: -56.7350, mag: 1.94 },
  { name: 'Alsephina', con: 'Vel', ra: 8.1583, dec: -47.3367, mag: 1.96 },
  { name: 'Mirzam', con: 'CMa', ra: 6.3783, dec: -17.9559, mag: 1.98 },
  { name: 'Alphard', con: 'Hya', ra: 9.4598, dec: -8.6586, mag: 1.99 },
  { name: 'Hamal', con: 'Ari', ra: 2.1196, dec: 23.4624, mag: 2.0 },
  { name: 'Polaris', con: 'UMi', ra: 2.5302, dec: 89.2641, mag: 1.97 },
  { name: 'Diphda', con: 'Cet', ra: 0.7265, dec: -17.9866, mag: 2.04 },
  { name: 'Alnair', con: 'Gru', ra: 22.1372, dec: -46.9609, mag: 1.74 },
  { name: 'Mizar', con: 'UMa', ra: 13.3988, dec: 54.9254, mag: 2.27 },
  { name: 'Kochab', con: 'UMi', ra: 14.8451, dec: 74.1555, mag: 2.08 },
  { name: 'Rasalhague', con: 'Oph', ra: 17.5823, dec: 12.5601, mag: 2.08 },
  { name: 'Algol', con: 'Per', ra: 3.1361, dec: 40.9556, mag: 2.12 },
  { name: 'Almach', con: 'And', ra: 2.0649, dec: 42.3296, mag: 2.1 },
  { name: 'Denebola', con: 'Leo', ra: 11.8177, dec: 14.5720, mag: 2.14 },
  { name: 'Naos', con: 'Pup', ra: 8.0597, dec: -40.0031, mag: 2.21 },
  { name: 'Phecda', con: 'UMa', ra: 11.8972, dec: 53.6948, mag: 2.44 },
  { name: 'Sadr', con: 'Cyg', ra: 20.3704, dec: 40.2566, mag: 2.23 },
  { name: 'Schedar', con: 'Cas', ra: 0.6751, dec: 56.5373, mag: 2.24 },
  { name: 'Caph', con: 'Cas', ra: 0.1531, dec: 59.1498, mag: 2.27 },
  { name: 'Merak', con: 'UMa', ra: 11.0307, dec: 56.3824, mag: 2.37 },
  { name: 'Algieba', con: 'Leo', ra: 10.3329, dec: 19.8415, mag: 2.61 },
  { name: 'Zubeneschamali', con: 'Lib', ra: 15.2762, dec: -9.3829, mag: 2.61 },
  { name: 'Zubenelgenubi', con: 'Lib', ra: 14.8479, dec: -16.0418, mag: 2.75 },
  { name: 'Eltanin', con: 'Dra', ra: 17.9434, dec: 51.4889, mag: 2.23 },
  { name: 'Etamin', con: 'Dra', ra: 17.9434, dec: 51.4889, mag: 2.23 },
  { name: 'Nunki', con: 'Sgr', ra: 18.9211, dec: -26.2967, mag: 2.05 },
  { name: 'Mirach', con: 'And', ra: 1.1623, dec: 35.6206, mag: 2.05 },
  { name: 'Alpheratz', con: 'And', ra: 0.1398, dec: 29.0904, mag: 2.06 },
  { name: 'Kraz', con: 'CrB', ra: 15.2748, dec: 26.7147, mag: 2.23 },
  { name: 'Alphecca', con: 'CrB', ra: 15.5781, dec: 26.7147, mag: 2.22 },
  { name: 'Sabik', con: 'Oph', ra: 17.1729, dec: -15.7249, mag: 2.43 },
  { name: 'Markab', con: 'Peg', ra: 23.0793, dec: 15.2052, mag: 2.49 },
  { name: 'Scheat', con: 'Peg', ra: 23.0629, dec: 28.0828, mag: 2.42 },
  { name: 'Algenib', con: 'Peg', ra: 0.2206, dec: 15.1836, mag: 2.83 },
  { name: 'Enif', con: 'Peg', ra: 21.7364, dec: 9.8750, mag: 2.39 },
  { name: 'Ankaa', con: 'Phe', ra: 0.4380, dec: -42.3061, mag: 2.4 },
  { name: 'Yed Prior', con: 'Oph', ra: 16.0934, dec: -3.6943, mag: 2.74 },
  { name: 'Cebalrai', con: 'Oph', ra: 16.3067, dec: 4.5673, mag: 2.76 },
  { name: 'Rasalgethi', con: 'Her', ra: 17.2443, dec: 14.3903, mag: 3.06 },
  { name: 'Kornephoros', con: 'Her', ra: 16.8336, dec: 21.4896, mag: 2.78 },
]

// ============================================================
// Constellation lines: pairs of star names to connect
// (Based on common asterism patterns)
// ============================================================

export interface ConstellationLine {
  con: string
  from: string
  to: string
}

export const CONSTELLATION_LINES: ConstellationLine[] = [
  // Ursa Major (Big Dipper)
  { con: 'UMa', from: 'Dubhe', to: 'Merak' },
  { con: 'UMa', from: 'Merak', to: 'Phecda' },
  { con: 'UMa', from: 'Phecda', to: 'Megrez' },
  { con: 'UMa', from: 'Megrez', to: 'Alioth' },
  { con: 'UMa', from: 'Alioth', to: 'Mizar' },
  { con: 'UMa', from: 'Mizar', to: 'Alkaid' },
  { con: 'UMa', from: 'Megrez', to: 'Dubhe' },
  // Orion
  { con: 'Ori', from: 'Betegeuse', to: 'Bellatrix' },
  { con: 'Ori', from: 'Bellatrix', to: 'Mintaka' },
  { con: 'Ori', from: 'Mintaka', to: 'Alnilam' },
  { con: 'Ori', from: 'Alnilam', to: 'Alnitak' },
  { con: 'Ori', from: 'Alnitak', to: 'Saiph' },
  { con: 'Ori', from: 'Saiph', to: 'Rigel' },
  { con: 'Ori', from: 'Rigel', to: 'Mintaka' },
  // Cassiopeia (W shape)
  { con: 'Cas', from: 'Caph', to: 'Schedar' },
  { con: 'Cas', from: 'Schedar', to: 'Gamma Cas' },
  { con: 'Cas', from: 'Gamma Cas', to: 'Ruchbah' },
  { con: 'Cas', from: 'Ruchbah', to: 'Segin' },
  // Leo
  { con: 'Leo', from: 'Regulus', to: 'Algieba' },
  { con: 'Leo', from: 'Algieba', to: 'Zosma' },
  { con: 'Leo', from: 'Zosma', to: 'Denebola' },
  { con: 'Leo', from: 'Denebola', to: 'Regulus' },
  // Scorpius
  { con: 'Sco', from: 'Antares', to: 'Shaula' },
  { con: 'Sco', from: 'Shaula', to: 'Sargas' },
  // Lyra
  { con: 'Lyr', from: 'Vega', to: 'Sheliak' },
  { con: 'Lyr', from: 'Sheliak', to: 'Sulafat' },
  { con: 'Lyr', from: 'Sulafat', to: 'Vega' },
  // Cygnus (Northern Cross)
  { con: 'Cyg', from: 'Deneb', to: 'Sadr' },
  { con: 'Cyg', from: 'Sadr', to: 'Albireo' },
  // Pegasus square
  { con: 'Peg', from: 'Markab', to: 'Scheat' },
  { con: 'Peg', from: 'Scheat', to: 'Alpheratz' },
  { con: 'Peg', from: 'Alpheratz', to: 'Algenib' },
  { con: 'Peg', from: 'Algenib', to: 'Markab' },
  // Gemini
  { con: 'Gem', from: 'Castor', to: 'Pollux' },
  { con: 'Gem', from: 'Pollux', to: 'Alhena' },
  // Canis Major
  { con: 'CMa', from: 'Sirius', to: 'Mirzam' },
  { con: 'CMa', from: 'Sirius', to: 'Adhara' },
  { con: 'CMa', from: 'Adhara', to: 'Wezen' },
  // Crux (Southern Cross)
  { con: 'Cru', from: 'Acrux', to: 'Gacrux' },
  // Centaurus
  { con: 'Cen', from: 'Rigel Kentaurus', to: 'Hadar' },
]

// Add missing stars referenced by constellations
export const EXTRA_STARS: Star[] = [
  { name: 'Mintaka', con: 'Ori', ra: 5.5334, dec: -0.2991, mag: 2.23 },
  { name: 'Saiph', con: 'Ori', ra: 5.7959, dec: -9.6696, mag: 2.09 },
  { name: 'Gamma Cas', con: 'Cas', ra: 0.9451, dec: 60.7167, mag: 2.47 },
  { name: 'Ruchbah', con: 'Cas', ra: 1.4302, dec: 60.2353, mag: 2.68 },
  { name: 'Segin', con: 'Cas', ra: 1.9063, dec: 63.6701, mag: 3.38 },
  { name: 'Zosma', con: 'Leo', ra: 11.2352, dec: 20.5237, mag: 2.56 },
  { name: 'Sheliak', con: 'Lyr', ra: 18.8343, dec: 33.3627, mag: 3.52 },
  { name: 'Sulafat', con: 'Lyr', ra: 18.9826, dec: 32.6896, mag: 3.25 },
  { name: 'Albireo', con: 'Cyg', ra: 19.5121, dec: 27.9597, mag: 3.18 },
  { name: 'Gacrux', con: 'Cru', ra: 12.5194, dec: -57.1131, mag: 1.63 },
]

// All stars merged (bright + extra)
export const ALL_STARS: Star[] = [...BRIGHT_STARS, ...EXTRA_STARS]

// ============================================================
// Planets — simplified ephemeris (approximate positions for demo)
// RA/Dec are approximate for a generic epoch; real apps would compute
// ============================================================

export interface Planet {
  name: string
  ra: number
  dec: number
  mag: number
  color: string
  symbol: string
}

// Static approximate positions (J2000-ish, demo only)
export const PLANETS: Planet[] = [
  { name: 'Merkúr', ra: 15.2, dec: -18.5, mag: -0.4, color: '#b8b8c8', symbol: '☿' },
  { name: 'Venuša', ra: 14.8, dec: -16.2, mag: -4.2, color: '#f5e6c8', symbol: '♀' },
  { name: 'Mars', ra: 7.4, dec: 24.8, mag: 0.8, color: '#e07856', symbol: '♂' },
  { name: 'Jupiter', ra: 5.1, dec: 22.0, mag: -2.5, color: '#e8c898', symbol: '♃' },
  { name: 'Saturn', ra: 22.8, dec: -8.5, mag: 0.4, color: '#dcc8a0', symbol: '♄' },
]

// ============================================================
// Milky Way — approximate band points (galactic plane in RA/Dec)
// ============================================================

/** Generate points along the galactic plane for the Milky Way band */
export function generateMilkyWayPoints(): { ra: number; dec: number; intensity: number }[] {
  const pts: { ra: number; dec: number; intensity: number }[] = []
  // Galactic plane roughly: l=0..360 → approximate RA/Dec
  // Simplified: a great circle inclined ~63° to celestial equator
  for (let l = 0; l < 360; l += 2) {
    const lRad = (l * Math.PI) / 180
    // Galactic center at RA~17.76h, Dec~-28.94°
    const node = 282.85 * (Math.PI / 180) // RA of ascending node
    const incl = 62.6 * (Math.PI / 180) // inclination
    const raRad = node + Math.atan2(
      Math.sin(lRad) * Math.cos(incl),
      Math.cos(lRad),
    )
    const decRad = Math.asin(Math.sin(lRad) * Math.sin(incl))
    // intensity peaks near galactic center (l~0) and anti-center (l~180)
    const intensity = 0.4 + 0.6 * Math.abs(Math.cos(lRad))
    pts.push({
      ra: ((raRad * 12) / Math.PI + 24) % 24,
      dec: (decRad * 180) / Math.PI,
      intensity,
    })
  }
  return pts
}

// ============================================================
// Constellation metadata (names, visibility season)
// ============================================================

export interface ConstellationInfo {
  abbr: string
  name: string
  nameSk: string
  bestMonth: string
}

export const CONSTELLATIONS_INFO: ConstellationInfo[] = [
  { abbr: 'UMa', name: 'Ursa Major', nameSk: 'Veľký medveď', bestMonth: 'Apríl' },
  { abbr: 'Ori', name: 'Orion', nameSk: 'Orion', bestMonth: 'Január' },
  { abbr: 'Cas', name: 'Cassiopeia', nameSk: 'Kasiopea', bestMonth: 'November' },
  { abbr: 'Leo', name: 'Leo', nameSk: 'Lev', bestMonth: 'Apríl' },
  { abbr: 'Sco', name: 'Scorpius', nameSk: 'Škorpión', bestMonth: 'Júl' },
  { abbr: 'Lyr', name: 'Lyra', nameSk: 'Lýra', bestMonth: 'August' },
  { abbr: 'Cyg', name: 'Cygnus', nameSk: 'Labuť', bestMonth: 'September' },
  { abbr: 'Peg', name: 'Pegasus', nameSk: 'Pegas', bestMonth: 'Október' },
  { abbr: 'Gem', name: 'Gemini', nameSk: 'Blíženci', bestMonth: 'Február' },
  { abbr: 'CMa', name: 'Canis Major', nameSk: 'Veľký pes', bestMonth: 'Január' },
  { abbr: 'Cru', name: 'Crux', nameSk: 'Južný kríž', bestMonth: 'Máj' },
  { abbr: 'Cen', name: 'Centaurus', nameSk: 'Kentaur', bestMonth: 'Máj' },
  { abbr: 'Tau', name: 'Taurus', nameSk: 'Býk', bestMonth: 'December' },
  { abbr: 'Boo', name: 'Bootes', nameSk: 'Pastier', bestMonth: 'Jún' },
  { abbr: 'Vir', name: 'Virgo', nameSk: 'Panna', bestMonth: 'Máj' },
  { abbr: 'Aur', name: 'Auriga', nameSk: 'Auriga', bestMonth: 'Január' },
  { abbr: 'Per', name: 'Perseus', nameSk: 'Perzeus', bestMonth: 'December' },
  { abbr: 'And', name: 'Andromeda', nameSk: 'Androméda', bestMonth: 'November' },
  { abbr: 'Sgr', name: 'Sagittarius', nameSk: 'Strelec', bestMonth: 'August' },
]

// ============================================================
// Simple celestial coordinate -> projected (x,y) on a circular sky map
// Uses stereographic projection centered on zenith (azimuthal equidistant)
// Input: observer's local sidereal time (LST in hours), observer latitude
// ============================================================

export interface SkyView {
  az: number // azimuth degrees 0..360 (center of view)
  alt: number // altitude degrees 0..90 (center of view)
  zoom: number // 1 = default
}

/** Convert RA/Dec to horizontal (alt/az) coordinates for observer */
export function equatorialToHorizontal(
  ra: number,
  dec: number,
  lstHours: number,
  latDeg: number,
): { az: number; alt: number } {
  const ha = (lstHours - ra) * 15 // hour angle in degrees
  const haRad = (ha * Math.PI) / 180
  const decRad = (dec * Math.PI) / 180
  const latRad = (latDeg * Math.PI) / 180

  const sinAlt =
    Math.sin(decRad) * Math.sin(latRad) +
    Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad)
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)))

  const cosAz =
    (Math.sin(decRad) - Math.sin(alt) * Math.sin(latRad)) /
    (Math.cos(alt) * Math.cos(latRad))
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz)))
  if (Math.sin(haRad) > 0) az = 2 * Math.PI - az

  return { az: (az * 180) / Math.PI, alt: (alt * 180) / Math.PI }
}

/** Project alt/az to screen x,y for an azimuthal map of given radius */
export function projectAltAz(
  altAz: { az: number; alt: number },
  centerAz: number,
  radius: number,
  centerAlt = 45,
): { x: number; y: number; visible: boolean } {
  const azDiff = (((altAz.az - centerAz + 540) % 360) - 180) * (Math.PI / 180)
  const altRad = (altAz.alt * Math.PI) / 180
  const centerAltRad = (centerAlt * Math.PI) / 180

  // Stereographic from nadir-ish: r = radius * (90 - alt) / 90
  const r = radius * ((90 - altAz.alt) / 90)
  const x = radius + r * Math.sin(azDiff)
  const y = radius - r * Math.cos(azDiff) * 0.9 // slight vertical squash

  const visible = altAz.alt > -1
  return { x, y, visible }
}

/** Compute local sidereal time (hours) from date and longitude (east positive) */
export function localSiderealTime(date: Date, longitudeEastDeg: number): number {
  // J2000.0 epoch
  const jd = date.getTime() / 86400000 + 2440587.5
  const T = (jd - 2451545.0) / 36525
  // Greenwich Sidereal Time in hours
  let gst =
    6.697374558 +
    0.06570982441908 * (jd - 2451545.0) +
    0.000026 * T * T +
    1.00273790935 * (((date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) % 24))
  gst = ((gst % 24) + 24) % 24
  // LST = GST + longitude/15
  const lst = (gst + longitudeEastDeg / 15) % 24
  return (lst + 24) % 24
}

/** Star size (radius in px) from magnitude */
export function magnitudeToRadius(mag: number, zoom: number): number {
  // brighter = bigger; clamp
  const base = Math.max(0.6, 4.0 - mag * 0.7)
  return base * Math.sqrt(zoom)
}

/** Star color approximation from B-V index (here simplified by magnitude) */
export function starColor(mag: number): string {
  if (mag < 0) return '#cfe8ff'
  if (mag < 1) return '#dceaff'
  if (mag < 2) return '#ffffff'
  if (mag < 3) return '#fff7e8'
  return '#ffe9c4'
}

/** Generate background field stars (random) for richer sky */
export function generateFieldStars(count: number, seed = 42): { ra: number; dec: number; mag: number }[] {
  // simple LCG for determinism
  let s = seed
  const rng = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
  const out: { ra: number; dec: number; mag: number }[] = []
  for (let i = 0; i < count; i++) {
    out.push({
      ra: rng() * 24,
      dec: 90 - Math.acos(2 * rng() - 1) * (180 / Math.PI),
      mag: 3.5 + rng() * 2.5,
    })
  }
  return out
}
