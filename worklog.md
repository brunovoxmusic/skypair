# Worklog – Sky Observation Web App (SkyPair)

## Project: Webová aplikácia na pozorovanie oblohy s párovaním zariadení

### Current project status
- **Aplikácia je plne funkčná a overená pomocou agent-browser.**
- Next.js 16 dev server beží na porte 3000, signaling mini-service na porte 3003.
- Lint prechádza bez chýb. Žiadne runtime errory v dev.log.

### Architecture
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind 4 + shadcn/ui (New York)
- **Backend API**: Next.js Route Handlers (`/api/session`, `/api/session/verify`)
- **Signaling**: socket.io mini-service (port 3003) cez Caddy gateway (`?XTransformPort=3003`)
- **Database**: Prisma + SQLite (`SkySession`, `SkyEvent` models)
- **P2P media**: WebRTC (`RTCPeerConnection` + Google STUN)
- **QR**: `qrcode` (generovanie do canvas), `jsqr` (čítanie cez zadnú kameru)
- **6-digit code**: Crockford alphabet (32 chars, bez 0/O/1/I), TTL 10 min, rate-limited verify

### Components built
- `src/app/page.tsx` — orchestrátor fáz (landing → host-waiting → join → observation)
- `src/components/sky/landing.tsx` — úvod s výberom host/join
- `src/components/sky/host-waiting.tsx` — QR + kód + countdown
- `src/components/sky/join-screen.tsx` — QR skener + manuálny vstup (InputOTP)
- `src/components/sky/observation.tsx` — sky map + video + controls + chat + events
- `src/components/sky/sky-map.tsx` — Canvas hviezdna mapa (80+ hviezd, LST výpočet)
- `src/components/sky/qr-generator.tsx`, `qr-scanner.tsx`
- `src/components/sky/header.tsx`, `footer.tsx` (sticky footer)
- `src/hooks/use-signaling.ts` — socket.io klient
- `src/hooks/use-webrtc.ts` — RTCPeerConnection management
- `src/lib/sky-utils.ts` — generovanie/normalizácia kódov
- `src/lib/stars.ts` — katalóg hviezd + projekcia
- `src/lib/sky-store.ts` — Zustand store
- `src/app/api/session/route.ts` — POST generuje kód
- `src/app/api/session/verify/route.ts` — POST overí kód (rate-limited)
- `mini-services/signaling/index.ts` — socket.io signaling server (port 3003)
- `RESEARCH_REPORT.md` — výskumný report v slovenčine (12 sekcií)

### Verification results (agent-browser)
- ✅ Landing page: H1 "SkyPair", "Vytvoriť reláciu" + "Pripojiť sa" buttons
- ✅ Host flow: click → POST /api/session 200 → code "7QT-35W" + QR + URL zobrazené
- ✅ Join flow: ?join=CODE auto-fill → tab Manuálne → kód prefilled → click "Pripojiť sa" → POST /api/session/verify 200 → observation screen
- ✅ Observation screen: "Odísť", "Spustiť kameru", "Zdieľať obrazovku", day/night switch, zoom/az/alt sliders, grid/labels switches, lat/lng (Bratislava default), Meteor/Satelit/Planéta/Poznámka buttons, chat input
- ✅ Signaling server running on port 3003 (logs confirm)
- ✅ No runtime errors, lint clean

### Goals completed
1. ✅ Výskumný report (RESEARCH_REPORT.md) — 12 sekcií, APA citácie, acceptance criteria
2. ✅ WebSocket signaling mini-service (port 3003)
3. ✅ Next.js API routes (session create + verify s rate limiting)
4. ✅ Frontend: landing, host-waiting (QR+code), join (QR scan+manual), observation
5. ✅ Sky map canvas (80+ bright stars, field stars, LST, altitude rings, N/E/S/W)
6. ✅ WebRTC hooks (camera + screen share, ICE/SDP signaling)
7. ✅ Sync state (sky view az/alt/zoom, events, chat) medzi zariadeniami
8. ✅ Overené agent-browserom
9. ⏳ Cron job (webDevReview každých 15 min) — nastavuje sa

### Unresolved issues / risks
- **Procesy zomierajú medzi bash volaniami**: bash tool zabíja child procesy pri ukončení. Pre perzistentné spustenie pre používateľa je nutné, aby environment preview systém udržiaval dev server, ABO aby cron (webDevReview) reštartoval servery.
- **TURN server**: prototyp používa len Google STUN. Pre internetové spojenie cez symmetric NAT by bol potrebný TURN (coturn/OpenRelay).
- **iOS Safari**: `getDisplayMedia` nepodporované (zdieľanie obrazovky obmedzené na desktop).
- **QR scanner výkon** na slabších mobiloch netestovaný.
- **Cross-origin**: pridané `allowedDevOrigins` pre `*.space-z.ai`.

### Priority recommendations for next phase
1. **Pridať TURN server** (OpenRelay alebo self-hosted coturn) pre spoľahlivé internetové P2P.
2. **Geolocation API**: auto-detect polohy používateľa (súhlas) namiesto hardcoded Bratislava.
3. **Persistencia sky events** do DB (SkyEvent model už existuje, len napojiť).
4. **AR rozšírenie**: Three.js 3D sféra oblohy alebo WebXR pre mobil.
5. **TLE satelity**: integrácia celestrak.org + satellite.js pre ISS/Starlink pozície.
6. **E2EE** optional vrstva cez Insertable Streams pre maximálne súkromie.

---

## Fáza 2 — Rozšírené funkcie a vylepšená vizualizácia (cron webDevReview)

### Current project status (po fáze 2)
- **Aplikácia stabilná, lint čistý, servery bežia.**
- QA cez agent-browser potvrdilo: landing, host QR, join, observation flow všetko funguje.
- Sky map canvas confirmed rendering (2.7% jasných pixelov = hviezdy, 11.8% stredných = Mliečna cesta + glow + konštelácie).

### Goals for phase 2 (completed)
1. ✅ **Konštelácie** — CONSTELLATION_LINES (35 čiar pre 11 súhvezdí: UMa, Ori, Cas, Leo, Sco, Lyr, Cyg, Peg, Gem, CMa, Cru, Cen), EXTRA_STARS (10 doplnkových hviezd)
2. ✅ **Mliečna cesta** — generateMilkyWayPoints() (180 bodov pozdĺž galaktickej roviny, intensity peak pri galaktickom centre)
3. ✅ **Planéty** — PLANETS (Merkúr, Venuša, Mars, Jupiter, Saturn) s farbami a symbolmi (☿♀♂♃♄)
4. ✅ **Geolocation** — handleLocate() cez navigator.geolocation.getCurrentPosition s high accuracy
5. ✅ **Sky Info Panel** — SkyInfoPanel komponent: lokálny čas, hviezdny čas (LST), počet viditeľných jasných hviezd, viditeľné súhvezdia (s slovenskými názvami), poloha, dátum
6. ✅ **Rýchle pohľady** — 5 preset tlačidiel (Juh, Západ, Sever, Východ, Zenit)
7. ✅ **Vylepšená vizualizácia**:
   - Atmospheric horizon glow (nočný mód: modrý glow pri horizonte; denný mód: teplý oranžový glow)
   - Lepší gradient pozadia (4 stop místa)
   - Altitude rings s označeniami stupňov (15°, 30°, 45°, 60°, 75°)
   - Zenith marker (krížik namiesto bodky)
   - Kompas s interkardinálnymi smemami (SV, JZ, JV, SZ) + primárne (S, W, N, E)
8. ✅ **Store rozšírený** — showConstellations, showMilkyWay, showPlanets flags (default: true)

### Completed modifications
- `src/lib/stars.ts`: pridané CONSTELLATION_LINES, EXTRA_STARS, ALL_STARS, PLANETS, generateMilkyWayPoints(), CONSTELLATIONS_INFO (19 súhvezdí so slovenskými názvmi)
- `src/lib/sky-store.ts`: rozšírené SkyState o 3 nové boolean flags (showConstellations, showMilkyWay, showPlanets)
- `src/components/sky/sky-map.tsx`:
  - Milky Way rendering (soft glow bodky pozdĺž galaktickej roviny)
  - Constellation lines (cyan lines, clip na kruh)
  - Planets (farebné disky s glow + symboly + názvy)
  - Lepší background gradient + atmospheric horizon glow
  - Altitude rings s degree labels
  - Zenith cross marker
  - Rozšírený kompas (8 smerov)
- `src/components/sky/sky-info-panel.tsx` (nový): overlay panel vľavo dole na sky map
- `src/components/sky/observation.tsx`:
  - 5 nových preset tlačidiel (Juh/Západ/Sever/Východ/Zenit)
  - 3 nové layer switches (Súhvezdia, Mliečna cesta, Planéty)
  - GPS tlačidlo "Zistiť moju polohu" s loading stavom
  - SkyInfoPanel integrovaný ako overlay
  - Coordinates presunuté vpravo (aby neprekážali info panelu)

### Verification results (agent-browser)
- ✅ Landing: H1 "SkyPair", 2 buttons (Vytvoriť/Pripojiť)
- ✅ Host flow: POST /api/session → QR + kód + URL
- ✅ Join flow: ?join=CODE → auto-fill → verify 200 → observation
- ✅ Observation: 5 preset tlačidiel (@e15-e19), 5 layer switches (@e20-e24), GPS button (@e27)
- ✅ Sky map pixel analysis: 300 bright + 1281 medium pixels = hviezdy + Mliečna cesta + konštelácie renderujú
- ✅ Lint clean, no runtime errors
- ✅ VLM potvrdilo UI štruktúru (header, status bar, camera panels, sidebar, footer)

### Unresolved issues / risks (po fáze 2)
- **Agent-browser refs nestabilné** pri re-renderoch — riešenie: vždy urobiť snapshot pred klikom.
- **VLM filter** občas odmietne prompts s astronomickými termínmi — použiť neutrálne prompty.
- **Sky info panel prekrytie** na malých obrazovkách — riešiť responsive v ďalšej fáze.
- **Planéty statické** — aktuálne pevné RA/Dec (demo), reálne by sa mali počítať podľa dátumu.

### Priority recommendations for next phase (fáza 3)
1. **Responsive sky info panel** — skryť/kolabovať na mobiloch.
2. **Planetárne ephemeris** — reálny výpočet polohy planét (knižnica astronomy-engine alebo vlastný výpočet).
3. **Konštelácie názvy** — zobraziť názov súhvezdia pri hover/kliku na constellation line.
4. **Meteor shower kalendár** — integrácia IMO dáta s upozorneniami.
5. **Satelity (ISS)** — TLE dáta + satellite.js pre real-time pozície.
6. **Nočné krajinka silueta** — landscape silhouette pri horizonte pre lepší vizuálny kontext.
7. **Záložky hviezd** — uložiť obľúbené objekty do localStorage.
8. **Export pozorovaní** — stiahnuť zoznam zaznamenaných udalostí ako CSV/JSON.
