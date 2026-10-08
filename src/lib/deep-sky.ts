// ============================================================
// Messier catalog — deep sky objects (galaxies, nebulae, clusters)
// RA in hours, Dec in degrees (J2000)
// Source: SEDS Messier catalog (public domain data)
// ============================================================

export interface DeepSkyObject {
  messierId: string // "M31"
  name: string // common name
  nameSk: string // Slovak name
  type: 'galaxy' | 'nebula' | 'open-cluster' | 'globular-cluster' | 'planetary-nebula'
  ra: number // hours
  dec: number // degrees
  mag: number // visual magnitude
  size: string // apparent size
  distance: string // distance from Earth
  constellation: string // constellation abbr
  description: string
  bestSeen: string // best month
}

export const MESSIER_CATALOG: DeepSkyObject[] = [
  {
    messierId: 'M31',
    name: 'Andromeda Galaxy',
    nameSk: 'Galaxia v Androméde',
    type: 'galaxy',
    ra: 0.7123,
    dec: 41.2691,
    mag: 3.44,
    size: '3°10′ × 1°',
    distance: '2.5 mil. ly',
    constellation: 'And',
    description: 'Najbližšia veľká špirálová galaxia, viditeľná voľným okom ako eliptická škvrna.',
    bestSeen: 'November',
  },
  {
    messierId: 'M42',
    name: 'Orion Nebula',
    nameSk: 'Hmlovina v Orione',
    type: 'nebula',
    ra: 5.5906,
    dec: -5.3911,
    mag: 4.0,
    size: '1°5′ × 1°',
    distance: '1 344 ly',
    constellation: 'Ori',
    description: 'Jedna z najjasnejších hmlovín, aktívne hviezdy tvoriaca oblasť.',
    bestSeen: 'Január',
  },
  {
    messierId: 'M45',
    name: 'Pleiades',
    nameSk: 'Plejády (Sedem bratov)',
    type: 'open-cluster',
    ra: 3.7913,
    dec: 24.1051,
    mag: 1.6,
    size: '110′',
    distance: '444 ly',
    constellation: 'Tau',
    description: 'Otvorená hviezdokopa známa ako Sedem bratov, ľahvo viditeľná voľným okom.',
    bestSeen: 'December',
  },
  {
    messierId: 'M44',
    name: 'Beehive Cluster',
    nameSk: 'Jasličky',
    type: 'open-cluster',
    ra: 8.6692,
    dec: 19.6706,
    mag: 3.7,
    size: '95′',
    distance: '577 ly',
    constellation: 'Cnc',
    description: 'Otvorená hviezdokopa známa ako Jasličky, jeden z najbližších klastrov k Zemi.',
    bestSeen: 'Február',
  },
  {
    messierId: 'M13',
    name: 'Hercules Cluster',
    nameSk: 'Guľová hviezdokopa v Herkulovi',
    type: 'globular-cluster',
    ra: 16.6952,
    dec: 36.4603,
    mag: 5.8,
    size: '20′',
    distance: '22 200 ly',
    constellation: 'Her',
    description: 'Guľová hviezdokopa, jedna z najlepších na pozorovanie strednej šírkou.',
    bestSeen: 'Júl',
  },
  {
    messierId: 'M57',
    name: 'Ring Nebula',
    nameSk: 'Prstencová hmlovina',
    type: 'planetary-nebula',
    ra: 18.8934,
    dec: 33.0292,
    mag: 8.8,
    size: '1.4′ × 1.0′',
    distance: '2 300 ly',
    constellation: 'Lyr',
    description: 'Planetárna hmlovina — pozostatok hviezdy, prstencový tvar.',
    bestSeen: 'August',
  },
  {
    messierId: 'M27',
    name: 'Dumbbell Nebula',
    nameSk: 'Činka',
    type: 'planetary-nebula',
    ra: 19.9443,
    dec: 22.7212,
    mag: 7.5,
    size: '8.0′ × 5.6′',
    distance: '1 360 ly',
    constellation: 'Vul',
    description: 'Planetárna hmlovina tvaru činky, prvýkrát objavená v roku 1764.',
    bestSeen: 'August',
  },
  {
    messierId: 'M81',
    name: 'Bode Galaxy',
    nameSk: 'Bodeho galaxia',
    type: 'galaxy',
    ra: 9.9260,
    dec: 69.0653,
    mag: 6.94,
    size: '26.9′ × 14.1′',
    distance: '12 mil. ly',
    constellation: 'UMa',
    description: 'Špirálová galaxia, jedna z najjasnejších viditeľných ďalekohľadom.',
    bestSeen: 'Apríl',
  },
  {
    messierId: 'M51',
    name: 'Whirlpool Galaxy',
    nameSk: 'Vír galaxia',
    type: 'galaxy',
    ra: 13.4987,
    dec: 47.1953,
    mag: 8.4,
    size: '11.2′ × 6.9′',
    distance: '23 mil. ly',
    constellation: 'CVn',
    description: 'Špirálová galaxia s interakčným satelitom, ikonický tvar špirály.',
    bestSeen: 'Máj',
  },
  {
    messierId: 'M104',
    name: 'Sombrero Galaxy',
    nameSk: 'Sombrero galaxia',
    type: 'galaxy',
    ra: 12.6601,
    dec: -11.6231,
    mag: 8.0,
    size: '8.7′ × 3.5′',
    distance: '31 mil. ly',
    constellation: 'Vir',
    description: 'Špirálová galaxia s výrazným prachovým pásom — tvar klobúka sombrero.',
    bestSeen: 'Apríl',
  },
  {
    messierId: 'M1',
    name: 'Crab Nebula',
    nameSk: 'Krabia hmlovina',
    type: 'nebula',
    ra: 5.5755,
    dec: 22.0145,
    mag: 8.4,
    size: '6.0′ × 4.0′',
    distance: '6 500 ly',
    constellation: 'Tau',
    description: 'Zvyšok supernovy z roku 1054, obsahuje pulzar v strede.',
    bestSeen: 'Január',
  },
  {
    messierId: 'M22',
    name: 'Sagittarius Cluster',
    nameSk: 'Guľová hviezdokopa v Strelcovi',
    type: 'globular-cluster',
    ra: 18.6174,
    dec: -23.9049,
    mag: 5.1,
    size: '32′',
    distance: '10 600 ly',
    constellation: 'Sgr',
    description: 'Jedna z najjasnejších guľových hviezdokôp, viditeľná voľným okom.',
    bestSeen: 'August',
  },
]

// Type icon and color
export function getDsoStyle(type: DeepSkyObject['type']): { icon: string; color: string; label: string } {
  switch (type) {
    case 'galaxy':
      return { icon: 'G', color: '#a78bfa', label: 'galaxia' }
    case 'nebula':
      return { icon: 'N', color: '#60a5fa', label: 'hmlovina' }
    case 'open-cluster':
      return { icon: 'OC', color: '#fbbf24', label: 'otvorená hviezdokopa' }
    case 'globular-cluster':
      return { icon: 'GC', color: '#34d399', label: 'guľová hviezdokopa' }
    case 'planetary-nebula':
      return { icon: 'PN', color: '#f472b6', label: 'planetárna hmlovina' }
    default:
      return { icon: '?', color: '#ffffff', label: 'objekt' }
  }
}
