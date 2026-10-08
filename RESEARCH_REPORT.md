# Výskumný a dizajnový report: Webová aplikácia na pozorovanie nočnej a dennej oblohy s párovaním zariadení cez 6‑miestny kód a QR kód

**Dátum vypracovania:** 2026
**Autor:** Výskumný analytik + Web‑development špecialista + Bezpečnostný analytik
**Jazyk:** Slovenčina
**Verzia:** 1.0

---

## 1. Úvod

Tento report analyzuje a navrhuje spôsob, ako vytvoriť jednoduchú, multiplatformovú webovú aplikáciu na pozorovanie nočnej a dennej oblohy. Aplikácia umožňuje prepojenie dvoch zariadení (mobil, tablet, notebook, počítač) pomocou 6‑miestneho kódu alebo QR kódu. Po spárovaní môžu zariadenia zdieľať obraz z kamery resp. obrazovky a synchronizovane zobraziť hviezdnu mapu, meteory a iné javy. Podpora funguje tak na rovnakej lokálnej Wi‑Fi sieti, ako aj cez internet (NAT traversal).

Report je štruktúrovaný podľa požadovaného OUTPUT CONTRACT a obsahuje porovnanie technológií, návrh architektúry, bezpečnostné opatrenia, implementačný stack, odporúčania pre rozšírenie (AR/3D) a acceptance criteria.

> **Poznámka k neistotám:** Konkrétne čísla (latencia, priepustnosť TURN servera) závisia od nasadenia a siete; kde nie je k dispozícii presný zdroj, je to explicitne označené ako **[NEOVERENÉ]**.

---

## 2. Požiadavky a ciele

### 2.1 Definícia problému

Používateľ má dve zariadenia (napr. telefón ako ďalekohľad/kamera a notebook ako obrazovka na zobrazenie). Chce:

1. Spárovať obe zariadenia rýchlo a bez registrácie.
2. Zdieľať obraz kamery/obrazovky v reálnom čase.
3. Synchronizovať hviezdnu mapu a pozorovateľské udalosti (meteor, kométa, satelit).
4. Fungovať na rovnakej Wi‑Fi aj cez internet bez inštalácie natívnej aplikácie.

### 2.2 Funkčné požiadavky (MUST)

| ID | Požiadavka | Priorita |
|----|------------|----------|
| FR‑1 | Generovať 6‑miestny alfanumerický kód pre reláciu | MUST |
| FR‑2 | Vygenerovať QR kód obsahujúci URL + kód | MUST |
| FR‑3 | Načítať QR kód z kamery mobilu | MUST |
| FR‑4 | Zadanie kódu manuálne ako alternatíva k QR | MUST |
| FR‑5 | P2P video/obrazovka zdieľanie cez WebRTC | MUST |
| FR‑6 | Synchronizácia hviezdnej mapy (azimut/výška/zoom) | MUST |
| FR‑7 | Fungovať na lokálnej sieti aj cez internet (TURN) | MUST |
| FR‑8 | Bezpečná autentifikácia relácie (TLS, jednorazový kód) | MUST |
| FR‑9 | Kompatibilita s Chrome, Firefox, Safari, Edge, mobilné prehliadače | MUST |

### 2.3 Nefunkčné požiadavky (SHOULD / COULD)

| ID | Požiadavka | Priorita |
|----|------------|----------|
| NFR‑1 | Nízka latencia (< 500 ms pre signaling) | SHOULD |
| NFR‑2 | NAT traversal cez STUN/TURN | SHOULD |
| NFR‑3 | Možnosť AR/3D vizualizácie (Three.js / A‑Frame) | COULD |
| NFR‑4 | Statický hosting + serverless signaling | SHOULD |
| NFR‑5 | Žiadna inštalácia natívnych aplikácií | CONSTRAINT |

---

## 3. Prehľad možných technológií (porovnanie)

### 3.1 Porovnávacia tabuľka signaling/P2P riešení

| Technológia | Typ | Realtime | Serverless? | Zložitosť | Bezpečnosť | Vhodnosť pre prototyp |
|-------------|-----|----------|-------------|-----------|------------|----------------------|
| **Raw WebRTC + vlastný WebSocket signaling** | P2P media + server signaling | Áno (WSS) | Nie (treba bežiaci WSS server) | Stredná | Vysoká (DTLS‑SRTP, TLS) | Vysoká |
| **PeerJS** (zabudovaný PeerServer) | P2P media + PeerServer signaling | Áno | Áno (cloud PeerServer alebo self‑hosted) | Nízka | Stredná (závisí od servera) | Najvyššia pre rýchly prototyp |
| **Firebase Realtime Database / Firestore** | Backend signaling + WebRTC media | Áno | Áno (serverless) | Nízka–Stredná | Vysoká (Security Rules) | Vysoká |
| **Supabase Realtime** | Backend signaling + WebRTC media | Áno | Áno | Stredná | Vysoká (RLS) | Stredná |
| **Pure WebSocket + manuálna WebRTC implementácia** | P2P media + server signaling | Áno | Nie | Vysoká | Vysoká | Nízka |

### 3.2 Odôvodnenie výberu

Pre **jednoduchý prototyp** odporúčame hybridný prístup, ktorý kombinuje výhody:

- **PeerJS‑style architecture** (jednoduché peer ID) s **vlastným WebSocket signaling serverom** bežiacim ako mini‑service (port 3003), aby sme mali plnú kontrolu nad bezpečnosťou a aby sme nezáviseli na externom cloude.
- **WebRTC** pre prenos média (video/obrazovka) – natívne šifrované cez DTLS‑SRTP (Fora Soft, 2026).
- **WebSocket** pre signaling výmenu SDP/ICE kandidátov – beží cez TLS (WSS).

Tento prístup zodpovedá odporúčaniam MDN: „WebRTC allows real‑time, peer‑to‑peer, media exchange between two devices" (MDN Web Docs, 2026) a zároveň využíva overené bezpečnostné praktiky (Dev.to, 2024).

---

## 4. Navrhovaná architektúra

### 4.1 Textový diagram architektúry

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PREHLIADAČ (zariadenie A)                    │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │  UI React  │  │ QR generátor │  │ WebRTC Peer │  │ Sky Map   │  │
│  │  (host)    │  │ (qrcode.js)  │  │  (video Tx) │  │ (Canvas)  │  │
│  └─────┬──────┘  └──────────────┘  └──────┬──────┘  └─────┬─────┘  │
│        │                                    │               │        │
│        │   ┌────────────────────────┐      │               │        │
│        └──►│  Signaling klient       │◄─────┘               │        │
│            │  (socket.io-client)     │                     │        │
│            └────────────┬────────────┘                     │        │
└─────────────────────────┼──────────────────────────────────┘        │
                          │                                            │
                  WSS /?XTransformPort=3003                              │
                          │                                            │
┌─────────────────────────▼──────────────────────────────────┐        │
│         SIGNALING MINI‑SERVICE (Node/Bun, port 3003)       │        │
│   ┌──────────────────────────────────────────────────────┐  │        │
│   │  socket.io server                                    │  │        │
│   │  - room = 6‑miestny kód                              │  │        │
│   │  - forward SDP offer/answer, ICE candidates           │  │        │
│   │  - forward sync udalosti (az/alt/zoom/meteor)        │  │        │
│   └──────────────────────────────────────────────────────┘  │        │
└─────────────────────────┬──────────────────────────────────┘        │
                          │                                            │
┌─────────────────────────▼──────────────────────────────────┐        │
│            NEXT.JS API ROUTES (port 3000)                  │        │
│   ┌──────────────────┐  ┌───────────────────┐              │        │
│   │ /api/session      │ │ /api/session/verify│              │        │
│   │ (generuje kód)    │ │ (overí kód + TTL)  │              │        │
│   └────────┬──────────┘ └────────┬──────────┘              │        │
│            │                      │                          │        │
│            └──────────┬────────────┘                          │        │
│                       ▼                                        │        │
│            ┌────────────────────┐                            │        │
│            │  Prisma (SQLite)    │                            │        │
│            │  Session, Code      │                            │        │
│            └────────────────────┘                            │        │
└────────────────────────────────────────────────────────────┘        │
                                                                       │
┌──────────────────────────────────────────────────────────────────────▼─┐
│                  PREHLIADAČ (zariadenie B)                            │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  ┌────────────┐   │
│  │  UI React  │  │ QR čítačka   │  │ WebRTC Peer │  │  Sky Map   │   │
│  │  (client)  │  │  (jsQR)      │  │  (video Rx) │  │  (Canvas)  │   │
│  └────────────┘  └──────────────┘  └─────────────┘  └────────────┘   │
└───────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────────┐
                         │  STUN / TURN servery  │
                         │  (Google STUN +       │
                         │   napr. OpenRelay)    │
                         └──────────────────────┘
```

### 4.2 Popis komponentov

| Komponent | Technológia | Úloha |
|-----------|-------------|-------|
| **Frontend (React/Next.js)** | Next.js 16, TypeScript, Tailwind, shadcn/ui | UI, pairing, hviezdna mapa, WebRTC peer |
| **QR generátor** | `qrcode` (npm) – klientske generovanie do `<canvas>` | Vygeneruje QR z URL+kód lokálne |
| **QR čítačka** | `jsQR` + `getUserMedia` | Skenovanie cez zadnú kameru mobilu |
| **6‑miestny kód** | Crypto‑safe generátor (`crypto.getRandomValues`) | Identifikácia relácie, TTL 10 min |
| **Signaling server** | socket.io (mini‑service, port 3003) | Výmena SDP/ICE, sync udalostí |
| **API routes** | Next.js Route Handlers | Generovanie/overenie kódu, práca s DB |
| **Databáza** | Prisma + SQLite | Perzistencia relácií a kódov |
| **WebRTC media** | `RTCPeerConnection` + STUN/TURN | P2P video/obrazovka |
| **Sky map renderer** | Canvas 2D / WebGL (neskôr Three.js) | Vizualizácia hviezd |
| **Bezpečnostná vrstva** | TLS (WSS, HTTPS), jednorazový kód, CORS, rate limit | Ochrana MITM, hijacking |

---

## 5. QR kód a 6‑miestny kód – implementačný návrh

### 5.1 Štruktúra 6‑miestneho kódu

- **Dĺžka:** 6 znakov
- **Abeceda:** `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (32 znakov, tzv. Crockford‑style bez mätúcich znakov `0/O/1/I`)
- **Entropia:** log₂(32⁶) ≈ 30 bitov → ≈ 10⁹ možností, dostatočné na krátkodobé relácie
- **Generovanie:** `crypto.getRandomValues` (kryptograficky bezpečný PRNG v prehliadači aj v Node)
- **TTL:** 10 minút (konfigurovateľné)
- **Formát zobrazenia:** `XXX-XXX` (s pomlčkou pre čitateľnosť), interne uložené bez pomlčky

> **NEISTOTA:** 30‑bitová entropia je dostatočná pre hobby/prototyp, pre produkčné nasadenie s viacerými súbežnými reláciami by sa mala zvýšiť na 8 znakov (≈40 bitov). **[NEOVERENÉ]** – závisí od očakávaného počtu súbežných relácií.

### 5.2 Bezpečnostné aspekty kódu

- Kód sa po úspešnom spárovaní **invalidate** (jednorazové použitie).
- Rate limit na overenie kódu (max 5 pokusov / 60 s / IP).
- Kód je **jedinečný** počas svojho TTL (DB constraint `@unique`).

### 5.3 QR kód

- **Obsah QR:** URL vo formáte `https://<host>/?join=<6‑miestny kód>`
- **Knižnica na generovanie:** `qrcode` (npm) – generuje do `<canvas>` lokálne, žiadny externý service.
- **Knižnica na čítanie:** `jsQR` – číta rámce z `<video>` elementu napojeného na `getUserMedia({ video: { facingMode: 'environment' } })`.
- **Formát:** QR verzia 4–6, ECC level M (15% redundancia).

### 5.4 Pseudokód generovania kódu

```typescript
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 chars
function generateCode(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => ALPHABET[b % 32]).join('');
}
```

---

## 6. Bezpečnosť a súkromie

### 6.1 Identifikované riziká a mitigácie

| Riziko | Popis | Mitigácia |
|--------|-------|-----------|
| **MITM na signaling** | Útočník odpočúva WSS a vloží falošný SDP | TLS 1.3 na WSS, certifikát cez Let's Encrypt, HSTS (GetStream.io) |
| **Hijacking relácie** | Útočník uhádne kód a pripojí sa | 6‑miestny kód s TTL 10 min + rate limit + jednorazové použitie |
| **Neoprávnený prístup ku kamere** | Web vyžiada kameru bez súhlasu | `getUserMedia` vyžaduje používateľský súhlas (prehl. politika) |
| **Únik IP adresy cez ICE** | WebRTC ICE môže odhaliť lokálnu IP | Použiť mDNS (Chrome default), alebo TURN relay |
| **XSS injekcia** | Vloženie skriptu cez chat/sync správy | React automaticky escapuje, CSP hlavička, validácia vstupov |
| **CSRF** | Neoprávnená zmena stavu | SameSite cookies, tokeny pre mutácie |
| **DoS signaling servera** | Útočník zaplaví socket.io spojeniami | Rate limit, IP whitelist (ak lokálna sieť), connection limit |
| **Neoverený peer** | Pripojenie k falošnému peerovi | Po spárovaní zobraziť „otlačok" relácie (hash kódu + čas) pre vizuálnu kontrolu |

### 6.2 Šifrovanie médií

WebRTC **povinne** šifruje médiá cez DTLS‑SRTP (Fora Soft, 2026; RTC League, 2026). Neexistuje „nešifrovaný" režim. Signaling (WSS) je šifrovaný TLS 1.3 (Dev.to, 2024).

### 6.3 Odporúčané hlavičky

```
Content-Security-Policy: default-src 'self'; script-src 'self'; connect-src 'self' wss: ...
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 7. Implementačný stack (frontend, backend, hosting)

### 7.1 Frontend

| Vrstva | Technológia |
|--------|-------------|
| Framework | Next.js 16 (App Router), React 19 |
| Jazyk | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Stav | Zustand (klient), TanStack Query (server) |
| WebRTC | natívny `RTCPeerConnection` |
| Signaling klient | `socket.io-client` |
| QR generátor | `qrcode` (npm) |
| QR čítačka | `jsQR` |
| Ikony | Lucide React |
| Animácie | Framer Motion |

### 7.2 Backend

| Vrstva | Technológia |
|--------|-------------|
| API | Next.js Route Handlers (`/api/session`, `/api/session/verify`) |
| Signaling | socket.io mini‑service (port 3003, Bun) |
| Databáza | Prisma ORM + SQLite |
| Realtime sync | socket.io (rooms podľa kódu) |

### 7.3 STUN/TURN

- **STUN:** verejný Google STUN `stun:stun.l.google.com:19302` (vhodné pre lokálnu sieť)
- **TURN:** pre internet odporúčaný `OpenRelay` (open source TURN, free tier) alebo self‑hosted `coturn`. **[NEOVERENÉ]** – dostupnosť free tieru sa môže meniť.

### 7.4 Hosting

| Možnosť | Výhody | Nevýhody |
|---------|--------|----------|
| **Vercel + Railway** (Next.js + signaling) | Jednoduché, CI/CD | TURN server treba samostatne |
| **Netlify + serverless functions** | Free tier | Signaling WSS je problematický serverless |
| **Vlastný VPS (Hetzner/DigitalOcean)** | Plná kontrola, TURN na rovnakom stroji | Údržba |

Odporúčané pre prototyp: **Vercel (frontend + API) + samostatný signaling VPS alebo Railway**.

---

## 8. Nasadenie a údržba

1. **Build:** `bun run build` (Next.js standalone)
2. **Signaling:** mini‑service beží ako `bun run dev` (s `--hot` pre auto‑restart)
3. **Migrácie DB:** `bun run db:push`
4. **Monitoring:** logy do `dev.log`, pravidelný healthcheck cez agent‑browser
5. **TTL cleanup:** cron job (každých 5 min) maže expirované relácie z DB
6. **Certifikáty:** Let's Encrypt (Caddy automatický certbot)

---

## 9. Odporúčania pre rozšírenie (AR, 3D vizualizácia)

### 9.1 3D vizualizácia oblohy

- **Three.js** – renderovanie 3D sféry s hviezdami, možnosť otáčania
- **A‑Frame** – deklaratívny WebXR framework, jednoduchšie pre prototyp
- Dáta hviezd: **Hipparcos katalóg** (≈118 000 hviezd) alebo **Bright Star Catalogue** (≈9 000 hviezd) – voľne dostupné (Fourmilab, 2019).

### 9.2 AR rozšírenie

- **WebXR Device API** – dostupné v Chrome na Android (ARCore)
- Zobrazenie šípiek smerujúcich k objektom (planéty, kométy) cez kameru
- **[NEOVERENÉ]** – podpora WebXR na iOS Safari je obmedzená (k 2026).

### 9.3 Datové zdroje pre javy

- **Meteor showers:** IMO (International Meteor Organization) kalendár
- **Satelity:** TLE dáta z celestrak.org + knižnica `satellite.js` na výpočet pozície
- **ISS:** open‑notify.org API

---

## 10. Acceptance Criteria

Implementácia musí spĺňať nasledujúce kritériá:

| ID | Kritérium | Verifikácia |
|----|-----------|-------------|
| AC‑1 | 6‑miestny kód je jedinečný počas 10 minút | DB query: žiadny duplikát v aktívnych reláciách |
| AC‑2 | QR kód sa generuje lokálne v prehliadači | Network tab: žiadny request pri generovaní |
| AC‑3 | QR kód je možné načítať zadnou kamerou mobilu | Manuálny test na Chrome Android / Safari iOS |
| AC‑4 | Spojenie funguje na rovnakej Wi‑Fi | Test: dve zariadenia v rovnakej sieti, video sa prenesie |
| AC‑5 | Spojenie funguje cez internet (TURN fallback) | Test: dve zariadenia v rôznych sieťach, video cez TURN |
| AC‑6 | Signaling je cez WSS (TLS) | DevTools: `wss://` protocol |
| AC‑7 | Média sú šifrované (DTLS‑SRTP) | `chrome://webrtc-internals` – „dtls" state: connected |
| AC‑8 | Synchronizácia hviezdnej mapy < 1 s | Latencia meraná medzi zmenou na A a zmenou na B |
| AC‑9 | Aplikácia funguje v Chrome, Firefox, Safari, Edge | Manuálny cross‑browser test |
| AC‑10 | Bez registrácie, žiadna natívna aplikácia | Nasadenie ako statický web + signaling server |
| AC‑11 | Kód sa po úspešnom spárovaní invalidate | DB query: relácia označená `paired: true` |
| AC‑12 | Rate limit na overenie kódu (max 5/60 s/IP) | Test: 6 pokusov rýchlo za sebou → 6. odmietnutý |

---

## 11. Zdroje (APA, dátum prístupu)

Dev.to. (2024, december 28). *6 Essential WebRTC Security Best Practices for 2025*. https://dev.to (Citované 2026)

Firebase. (bez dátumu). *Understand Firebase Realtime Database Security Rules*. https://firebase.google.com/docs/database/security (Citované 2026)

Fora Soft. (2026, august 2). *WebRTC Security in 2026: E2EE, HIPAA & Attacks*. https://www.forasoft.com (Citované 2026)

Fourmilab. (2019, február 4). *Your Sky – Sky Map*. https://www.fourmilab.ch (Citované 2026)

GetStream.io. (bez dátumu). *WebRTC Stun vs Turn Servers*. https://getstream.io (Citované 2026)

GetStream.io. (bez dátumu). *WebRTC Security – Is it secure and safe?* https://getstream.io (Citované 2026)

MDN Web Docs. (2026, september 22). *Signaling and video calling – WebRTC API*. https://developer.mozilla.org (Citované 2026)

MDN Web Docs. (bez dátumu). *WebRTC API*. https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API (Citované 2026)

PkgPulse. (2026, marec 9). *simple-peer vs PeerJS vs mediasoup 2026*. https://www.pkgpulse.com (Citované 2026)

RTC League. (2026, september 29). *WebRTC Security: Encryption, SRTP, and DTLS*. https://rtcleague.com (Citované 2026)

SignalWire. (bez dátumu). *STUN vs. TURN vs. ICE*. https://signalwire.com (Citované 2026)

WebRTC.org. (2023, marec 29). *Firebase + WebRTC Codelab*. https://webrtc.org/getting-started/firebase-rtc-codelab (Citované 2026)

WebRTC.ventures. (2020, december 28). *WebRTC Signaling Servers – STUN vs TURN*. https://webrtc.ventures (Citované 2026)

---

## 12. Neistoty a návrhy ďalšieho výskumu

| Oblasť | Neistota | Návrh |
|--------|----------|-------|
| TURN free tier | Dostupnosť OpenRelay free tieru sa mení | Overiť aktuálnu dostupnosť, alternatíva: self‑hosted coturn |
| iOS Safari WebRTC | Obmedzená podpora pre niektoré kodeky | Testovať H.264 fallback, vyhnúť sa VP9 na iOS |
| WebXR na iOS | Podpora AR na Safari je obmedzená (2026) | Quick Look ako alternatíva, natívna aplikácia pre AR |
| Entropia kódu | 30 bitov môže byť málo pre produkciu | Zvýšiť na 8 znakov (40 bitov) ak >1000 súbežných relácií |
| Latencia synchronizácie | < 1 s závisí od siete a signaling | Merania v reálnych sieťach, voliteľný režim „ultra‑low‑latency" |
| Ochrana IP cez mDNS | Niektoré prehliadače odhalia lokálnu IP | Použiť TURN relay pre úplnú ochranu IP |
| Kompatibilita QR čítačky | `jsQR` výkon na slabších mobiloch | Alternatíva: natívna Barcode Detection API (Chrome) |
| Prenos obrazovky | `getDisplayMedia` nefunguje na mobilných prehliadačoch | Obmedziť zdieľanie obrazovky na desktop |

---

## Príloha A: Schéma dátových tokov

```
1. HOST (zariadenie A):
   - Klikne „Vytvoriť reláciu"
   - POST /api/session → server vygeneruje 6‑miestny kód, uloží do DB (TTL 10 min)
   - Response: { code: "ABC-123", sessionId: "..." }
   - Frontend vygeneruje QR s URL `/?join=ABC123`
   - Pripojí sa na WSS signaling do room=ABC123 (ako „host")

2. CLIENT (zariadenie B):
   - Naskenuje QR (jsQR) alebo zadá kód manuálne
   - GET /?join=ABC123 → frontend parsovaním query zistí kód
   - POST /api/session/verify { code: "ABC123" } → overí TTL a stav
   - Pripojí sa na WSS signaling do room=ABC123 (ako „client")

3. SIGNALING (WSS):
   - Host dostane „peer‑joined"
   - Host vytvorí RTCPeerConnection, createOffer → setLocalDescription
   - Pošle offer cez socket.io → server forwardne clientovi
   - Client setRemoteDescription, createAnswer → pošle answer
   - Oba vymieňajú ICE candidates (trickle ICE)
   - Po connected stave: video stream pretečie P2P

4. SYNC (WSS počas relácie):
   - Host mení azimut/zoom → emit „sky‑sync" { az, alt, zoom }
   - Client prijíma a aplikuje na svoju hviezdnu mapu
   - Symetricky pre meteor/satelit udalosti
```

---

*Koniec reportu.*
