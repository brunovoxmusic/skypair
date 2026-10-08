// ============================================================
// Meteor shower calendar (IMO-style data)
// Source: International Meteor Organization calendar (public domain data)
// Radiant RA/Dec in degrees for J2000 epoch
// ============================================================

export interface MeteorShower {
  id: string
  name: string // IAU name
  nameSk: string // Slovak name
  code: string // 3-letter code
  activeStart: [number, number] // [month, day] start
  activeEnd: [number, number] // [month, day] end
  peak: [number, number] // [month, day] peak
  radiantRA: number // degrees
  radiantDec: number // degrees
  zhr: number // zenithal hourly rate at peak
  speed: number // km/s atmospheric entry speed
  parentBody: string
  intensity: 'major' | 'minor' | 'variable'
}

// Major + notable minor showers
export const METEOR_SHOWERS: MeteorShower[] = [
  {
    id: 'qua',
    name: 'Quadrantids',
    nameSk: 'Kvadrantidy',
    code: 'QUA',
    activeStart: [12, 28],
    activeEnd: [1, 12],
    peak: [1, 4],
    radiantRA: 230,
    radiantDec: 49,
    zhr: 110,
    speed: 41,
    parentBody: '2003 EH1 (kométa)',
    intensity: 'major',
  },
  {
    id: 'lyr',
    name: 'Lyrids',
    nameSk: 'Lýridy',
    code: 'LYR',
    activeStart: [4, 16],
    activeEnd: [4, 25],
    peak: [4, 22],
    radiantRA: 271,
    radiantDec: 34,
    zhr: 18,
    speed: 49,
    parentBody: 'C/1861 G1 Thatcher',
    intensity: 'minor',
  },
  {
    id: 'eta-aqr',
    name: 'Eta Aquariids',
    nameSk: 'Éta Vodnáre',
    code: 'ETA',
    activeStart: [4, 19],
    activeEnd: [5, 28],
    peak: [5, 6],
    radiantRA: 338,
    radiantDec: -1,
    zhr: 50,
    speed: 66,
    parentBody: '1P/Halley',
    intensity: 'major',
  },
  {
    id: 'delta-aqr',
    name: 'Delta Aquariids',
    nameSk: 'Delta Vodnáre',
    code: 'DAU',
    activeStart: [7, 12],
    activeEnd: [8, 23],
    peak: [7, 30],
    radiantRA: 339,
    radiantDec: -16,
    zhr: 20,
    speed: 41,
    parentBody: 'Marsden a Kracht (kométy)',
    intensity: 'minor',
  },
  {
    id: 'per',
    name: 'Perseids',
    nameSk: 'Perzeidy',
    code: 'PER',
    activeStart: [7, 17],
    activeEnd: [8, 24],
    peak: [8, 12],
    radiantRA: 48,
    radiantDec: 58,
    zhr: 100,
    speed: 59,
    parentBody: '109P/Swift-Tuttle',
    intensity: 'major',
  },
  {
    id: 'ori',
    name: 'Orionids',
    nameSk: 'Orionidy',
    code: 'ORI',
    activeStart: [10, 2],
    activeEnd: [11, 7],
    peak: [10, 21],
    radiantRA: 95,
    radiantDec: 16,
    zhr: 20,
    speed: 66,
    parentBody: '1P/Halley',
    intensity: 'minor',
  },
  {
    id: 'leo',
    name: 'Leonids',
    nameSk: 'Leonidy',
    code: 'LEO',
    activeStart: [11, 6],
    activeEnd: [11, 30],
    peak: [11, 17],
    radiantRA: 152,
    radiantDec: 22,
    zhr: 15,
    speed: 71,
    parentBody: '55P/Tempel-Tuttle',
    intensity: 'variable',
  },
  {
    id: 'gem',
    name: 'Geminids',
    nameSk: 'Geminidy',
    code: 'GEM',
    activeStart: [12, 4],
    activeEnd: [12, 20],
    peak: [12, 14],
    radiantRA: 112,
    radiantDec: 33,
    zhr: 150,
    speed: 34,
    parentBody: '3200 Phaethon (asteroid)',
    intensity: 'major',
  },
  {
    id: 'urs',
    name: 'Ursids',
    nameSk: 'Ursidy',
    code: 'URS',
    activeStart: [12, 17],
    activeEnd: [12, 26],
    peak: [12, 22],
    radiantRA: 217,
    radiantDec: 76,
    zhr: 10,
    speed: 33,
    parentBody: '8P/Tuttle',
    intensity: 'minor',
  },
]

/** Convert [month, day] to day-of-year (1-365/366) */
export function dateToDayOfYear(month: number, day: number, year: number): number {
  const d = new Date(Date.UTC(year, month - 1, day))
  const start = new Date(Date.UTC(year, 0, 0))
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}

/** Check if shower is currently active */
export function isShowerActive(shower: MeteorShower, date: Date = new Date()): boolean {
  const year = date.getFullYear()
  const todayDoy = dateToDayOfYear(date.getMonth() + 1, date.getDate(), year)
  const startDoy = dateToDayOfYear(shower.activeStart[0], shower.activeStart[1], year)
  const endDoy = dateToDayOfYear(shower.activeEnd[0], shower.activeEnd[1], year)
  // Handle wrap-around (e.g. Quadrantids: Dec 28 - Jan 12)
  if (startDoy > endDoy) {
    return todayDoy >= startDoy || todayDoy <= endDoy
  }
  return todayDoy >= startDoy && todayDoy <= endDoy
}

/** Get days until peak (negative if past peak this year) */
export function daysUntilPeak(shower: MeteorShower, date: Date = new Date()): number {
  const year = date.getFullYear()
  const todayDoy = dateToDayOfYear(date.getMonth() + 1, date.getDate(), year)
  const peakDoy = dateToDayOfYear(shower.peak[0], shower.peak[1], year)
  let diff = peakDoy - todayDoy
  if (diff < -30) diff += 365 // peak next year
  return diff
}

/** Get currently active showers */
export function getActiveShowers(date: Date = new Date()): MeteorShower[] {
  return METEOR_SHOWERS.filter((s) => isShowerActive(s, date))
}

/** Get upcoming showers (next 30 days) */
export function getUpcomingShowers(date: Date = new Date()): { shower: MeteorShower; daysUntilPeak: number }[] {
  return METEOR_SHOWERS.map((s) => ({ shower: s, daysUntilPeak: daysUntilPeak(s, date) }))
    .filter((x) => x.daysUntilPeak >= 0 && x.daysUntilPeak <= 30)
    .sort((a, b) => a.daysUntilPeak - b.daysUntilPeak)
}
