# SkyPair — Pozorovanie oblohy s párovaním zariadení

Webová aplikácia na pozorovanie nočnej a dennej oblohy. Spárujte dve zariadenia (mobil, počítač, tablet) cez 6-miestny kód alebo QR kód a zdieľajte obraz kamery so synchronizovanou hviezdou mapou.

## ✨ Funkcie

### Párovanie zariadení
- **6-miestny kód** (Crockford alphabet, bez mätúcich znakov 0/O/1/I)
- **QR kód** generovaný lokálne + čítačka cez zadnú kameru (`jsQR`)
- **WebRTC P2P** video/obrazovka zdieľanie (DTLS-SRTP šifrované)
- Signaling cez socket.io mini-service (port 3003)

### Interaktívna hviezdna mapa
- **80+ jasných hviezd** (Bright Star Catalogue subset)
- **420 field stars** pre realistický vzhľad
- **12 Messier deep-sky objektov** (M31 Andromeda, M42 Orion, M45 Plejády, ...)
- **5 planét** (Merkúr, Venuša, Mars, Jupiter, Saturn) s astronomickými symbolmi
- **Mliečna cesta** — 180 bodov pozdĺž galaktickej roviny
- **Konštelácie** — 35 čiar pre 11 súhvezdí (Veľký medveď, Orion, Kasiopeia, ...)
- **Lokálny hviezdny čas** (LST) výpočet podľa polohy
- **Horizontové súradnice** (azimut/výška) s atmosférickým horizon glow
- **Landscape silhouette** pri horizonte

### Interaktívne popupy
- **Star info** — klik na hviezdu: názov, súhvezdie, magnitúda, RA/Dec, alt/az
- **Deep-sky info** — klik na Messier objekt: typ, vzdialenosť, veľkosť, popis
- **Constellation info** — klik na constellation line: názov, viditeľné hviezdy, najlepší mesiac
- **Záložky hviezd** (localStorage) — rýchly prístup k obľúbeným objektom

### Pozorovania a export
- **Meteorické roje** kalendár (9 rojov: Perzeidy, Geminidy, Orionidy, ...)
- **Záznam udalostí** — meteor, satelit, planéta, poznámka
- **Zvukové upozornenia** (Web Audio API) pri novom objekte
- **Export do CSV/JSON** + **tlač** (print friendly)
- **História pozorovaní** v localStorage
- **Zdieľanie pozorovaní** ako zdieľateľný link (`?obs=` parameter)

### UX vylepšenia
- **Vyhľadávanie** hviezd, deep-sky objektov a súhvezdí
- **Onboarding** pre nových používateľov (4 kroky)
- **Help/FAQ** modal s 7 otázkami
- **Keyboard shortcuts** (šípky, +/-, N, R, M, S, Esc, ?)
- **Červený nočný režim** pre zachovanie nočného videnia
- **Fullscreen mode** pre sky map
- **City search** — 33 európskych miest pre rýchlu polohu
- **PWA support** — inštalovateľná ako app
- **Responsive** pre mobil/tablet/desktop

## 🛠️ Technológie

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York)
- **State**: Zustand (client), TanStack Query (server)
- **Databáza**: Prisma ORM + SQLite
- **Signaling**: socket.io mini-service (port 3003)
- **P2P media**: WebRTC (`RTCPeerConnection` + Google STUN)
- **QR**: `qrcode` (generovanie), `jsqr` (čítanie)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📦 Inštalácia

```bash
# Klonovať repozitár
git clone https://github.com/brunovoxmusic/skypair.git
cd skypair

# Nainštalovať závislosti
bun install

# Nastaviť environment
cp .env.example .env
# Upraviť .env podľa potreby

# Push databázovej schémy
bun run db:push

# Spustiť signaling service (port 3003)
cd mini-services/signaling
bun install
bun run dev &

# Spustiť dev server (port 3000)
cd ../..
bun run dev
```

Otvorte `http://localhost:3000` v prehliadači.

## 🚀 Použitie

1. **Hostiteľ**: Kliknite „Vytvoriť reláciu" → zobrazí sa QR kód + 6-miestny kód
2. **Klient**: Naskenujte QR kód alebo zadajte kód → pripojíte sa k relácii
3. **Pozorovanie**: Ovládajte hviezdnu mapu, zdieľajte obraz kamery, zaznamenávajte meteority

## 📚 Dokumentácia

- [Výskumný report](RESEARCH_REPORT.md) — detailná analýza technológií, architektúry a bezpečnosti (slovenčina)

## 📁 Štruktúra projektu

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Hlavná stránka (orchestrátor fáz)
│   │   ├── layout.tsx          # Root layout + PWA meta
│   │   ├── globals.css         # Globálne štýly + animácie
│   │   └── api/
│   │       ├── session/        # Generovanie/overenie kódov
│   │       └── route.ts
│   ├── components/
│   │   ├── ui/                 # shadcn/ui komponenty
│   │   └── sky/                # Sky-specific komponenty
│   │       ├── sky-map.tsx
│   │       ├── observation.tsx
│   │       ├── landing.tsx
│   │       ├── host-waiting.tsx
│   │       ├── join-screen.tsx
│   │       ├── qr-generator.tsx
│   │       ├── qr-scanner.tsx
│   │       ├── star-info-popup.tsx
│   │       ├── deep-sky-info-popup.tsx
│   │       ├── constellation-info-popup.tsx
│   │       ├── meteor-showers-panel.tsx
│   │       ├── search-panel.tsx
│   │       ├── city-search-panel.tsx
│   │       ├── help-panel.tsx
│   │       ├── shortcuts-overlay.tsx
│   │       ├── onboarding-overlay.tsx
│   │       ├── shared-observations-modal.tsx
│   │       ├── sky-info-panel.tsx
│   │       ├── header.tsx
│   │       └── footer.tsx
│   ├── hooks/
│   │   ├── use-signaling.ts    # socket.io klient
│   │   ├── use-webrtc.ts       # RTCPeerConnection management
│   │   ├── use-keyboard-shortcuts.ts
│   │   ├── use-observation-history.ts
│   │   └── use-fullscreen.ts
│   └── lib/
│       ├── stars.ts            # Katalóg hviezd + projekcia
│       ├── deep-sky.ts         # Messier katalóg
│       ├── meteor-showers.ts   # Meteorické roje
│       ├── cities.ts           # Zoznam miest
│       ├── sky-utils.ts        # Kódy, encode/decode
│       ├── sky-store.ts        # Zustand store
│       └── db.ts               # Prisma klient
├── prisma/
│   └── schema.prisma           # SkySession, SkyEvent modely
├── mini-services/
│   └── signaling/              # socket.io signaling server (port 3003)
├── public/
│   ├── manifest.json           # PWA manifest
│   └── logo.svg
├── RESEARCH_REPORT.md          # Výskumný report (slovenčina)
└── package.json
```

## 🔒 Bezpečnosť

- **WebRTC** médiá šifrované cez DTLS-SRTP (povinné)
- **Signaling** cez WSS (TLS)
- **6-miestny kód** s TTL 10 min, jednorazové použitie, rate-limited
- **CSP** a bezpečnostné hlavičky
- Žiadne secrets v repozitári (`.env` ignorovaný)

## 📝 Licencia

MIT

## 🤝 Príspevky

Príspevky vítané! Otvorte issue alebo pull request.
