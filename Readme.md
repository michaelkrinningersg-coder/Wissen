# Knowledge Clicker – Wissen

Idle/Incremental Clicker (siehe Design-Dokument v2): Wissen sammeln → Gebäude bauen → Epochen freischalten → Prestige → stärker neu starten. Epoche 5 ist ein unendlicher Wiederhol-Loop mit stetig wachsendem Bonus.

## Stack

- Vite + React + TypeScript, PWA (installierbar, `vite-plugin-pwa`)
- Zustand als Game-State, entkoppelt von einem 20-Hz-Tick-Loop
- [`break_eternity.js`](https://github.com/Patashu/break_eternity.js) für beliebig große Zahlen
- Persistenz: `localStorage` (Autosave) + Base64-Export/Import-Savecode

## Entwicklung

```bash
npm install
npm run dev       # Dev-Server
npm run build     # Typecheck + Production-Build (inkl. Service Worker)
npm run preview   # Production-Build lokal ansehen
npm test          # Vitest (Formeln, Store-Logik, Save/Export-Import)
```

## Struktur

- `src/game/config/` – alle Inhalte/Balancing-Werte (Gebäude, Karten, Kern-Upgrades, Achievements, Events) zentral als Konfigurationstabellen
- `src/game/formulas.ts` – reine Formelfunktionen (Kosten, Produktion, Boni, Prestige)
- `src/game/state/store.ts` – Zustand-Store inkl. Spieleraktionen und Tick-Engine-Anbindung
- `src/game/engine/loop.ts` – vom React-Render entkoppelte Tick-Engine
- `src/game/persistence/` – Speichern/Laden, Base64-Savecode, Versions-Migration
- `src/components/` – UI nach Screens gegliedert (Haupt/Prestige/Karten/Achievements/Statistik)

Alle Zahlenwerte in `src/game/config/constants.ts` sind Startwerte fürs Playtesting, keine finale Balance.
