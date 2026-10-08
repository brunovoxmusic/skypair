// ============================================================
// Cities database — offline list for location search
// lat/lng for major European cities
// ============================================================

export interface City {
  name: string
  nameSk: string
  country: string
  countrySk: string
  lat: number
  lng: number
}

export const CITIES: City[] = [
  // Slovakia
  { name: 'Bratislava', nameSk: 'Bratislava', country: 'Slovakia', countrySk: 'Slovensko', lat: 48.1486, lng: 17.1077 },
  { name: 'Košice', nameSk: 'Košice', country: 'Slovakia', countrySk: 'Slovensko', lat: 48.7164, lng: 21.2614 },
  { name: 'Prešov', nameSk: 'Prešov', country: 'Slovakia', countrySk: 'Slovensko', lat: 49.0014, lng: 21.2393 },
  { name: 'Žilina', nameSk: 'Žilina', country: 'Slovakia', countrySk: 'Slovensko', lat: 49.2231, lng: 18.7394 },
  { name: 'Banská Bystrica', nameSk: 'Banská Bystrica', country: 'Slovakia', countrySk: 'Slovensko', lat: 48.7364, lng: 19.1464 },
  { name: 'Nitra', nameSk: 'Nitra', country: 'Slovakia', countrySk: 'Slovensko', lat: 48.3069, lng: 18.0860 },
  { name: 'Trnava', nameSk: 'Trnava', country: 'Slovakia', countrySk: 'Slovensko', lat: 48.3774, lng: 17.5872 },
  { name: 'Trenčín', nameSk: 'Trenčín', country: 'Slovakia', countrySk: 'Slovensko', lat: 48.8945, lng: 18.0444 },
  { name: 'Martin', nameSk: 'Martin', country: 'Slovakia', countrySk: 'Slovensko', lat: 49.0665, lng: 18.9235 },
  { name: 'Poprad', nameSk: 'Poprad', country: 'Slovakia', countrySk: 'Slovensko', lat: 49.0587, lng: 20.2977 },
  // Czech Republic
  { name: 'Praha', nameSk: 'Praha', country: 'Czech Republic', countrySk: 'Česko', lat: 50.0755, lng: 14.4378 },
  { name: 'Brno', nameSk: 'Brno', country: 'Czech Republic', countrySk: 'Česko', lat: 49.1951, lng: 16.6068 },
  { name: 'Ostrava', nameSk: 'Ostrava', country: 'Czech Republic', countrySk: 'Česko', lat: 49.8209, lng: 18.2625 },
  { name: 'Plzeň', nameSk: 'Plzeň', country: 'Czech Republic', countrySk: 'Česko', lat: 49.7384, lng: 13.3736 },
  { name: 'Olomouc', nameSk: 'Olomouc', country: 'Czech Republic', countrySk: 'Česko', lat: 49.5938, lng: 17.2509 },
  // Austria
  { name: 'Viedeň', nameSk: 'Viedeň', country: 'Austria', countrySk: 'Rakúsko', lat: 48.2082, lng: 16.3738 },
  { name: 'Salzburg', nameSk: 'Salzburg', country: 'Austria', countrySk: 'Rakúsko', lat: 47.8095, lng: 13.0550 },
  { name: 'Innsbruck', nameSk: 'Innsbruck', country: 'Austria', countrySk: 'Rakúsko', lat: 47.2692, lng: 11.4041 },
  // Hungary
  { name: 'Budapešť', nameSk: 'Budapešť', country: 'Hungary', countrySk: 'Maďarsko', lat: 47.4979, lng: 19.0402 },
  { name: 'Debrecín', nameSk: 'Debrecín', country: 'Hungary', countrySk: 'Maďarsko', lat: 47.5316, lng: 21.6273 },
  // Poland
  { name: 'Krakov', nameSk: 'Krakov', country: 'Poland', countrySk: 'Poľsko', lat: 50.0647, lng: 19.9450 },
  { name: 'Varšava', nameSk: 'Varšava', country: 'Poland', countrySk: 'Poľsko', lat: 52.2297, lng: 21.0122 },
  { name: 'Vroclav', nameSk: 'Vroclav', country: 'Poland', countrySk: 'Poľsko', lat: 51.1079, lng: 17.0385 },
  { name: 'Gdansk', nameSk: 'Gdansk', country: 'Poland', countrySk: 'Poľsko', lat: 54.3520, lng: 18.6466 },
  // Germany
  { name: 'Berlín', nameSk: 'Berlín', country: 'Germany', countrySk: 'Nemecko', lat: 52.5200, lng: 13.4050 },
  { name: 'Mníchov', nameSk: 'Mníchov', country: 'Germany', countrySk: 'Nemecko', lat: 48.1351, lng: 11.5820 },
  { name: 'Viedeň', nameSk: 'Viedeň', country: 'Austria', countrySk: 'Rakúsko', lat: 48.2082, lng: 16.3738 },
  // Other major European
  { name: 'Paríž', nameSk: 'Paríž', country: 'France', countrySk: 'Francúzsko', lat: 48.8566, lng: 2.3522 },
  { name: 'Londýn', nameSk: 'Londýn', country: 'UK', countrySk: 'UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Rím', nameSk: 'Rím', country: 'Italy', countrySk: 'Taliansko', lat: 41.9028, lng: 12.4964 },
  { name: 'Madrid', nameSk: 'Madrid', country: 'Spain', countrySk: 'Španielsko', lat: 40.4168, lng: -3.7038 },
  { name: 'Amsterdam', nameSk: 'Amsterdam', country: 'Netherlands', countrySk: 'Holandsko', lat: 52.3676, lng: 4.9041 },
  { name: 'Zürich', nameSk: 'Zürich', country: 'Switzerland', countrySk: 'Švajčiarsko', lat: 47.3769, lng: 8.5417 },
]

/** Search cities by name (case-insensitive) */
export function searchCities(query: string, limit = 8): City[] {
  if (!query.trim()) return []
  const q = query.toLowerCase().trim()
  return CITIES.filter((c) => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.nameSk.toLowerCase().includes(q) ||
      c.countrySk.toLowerCase().includes(q)
    )
  }).slice(0, limit)
}
