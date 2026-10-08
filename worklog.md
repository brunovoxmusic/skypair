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
