/**
 * Zentrale Balancing-Werte. Laut Design-Dokument (Abschnitt 21) sind ALLE
 * Zahlenwerte hier Startwerte fürs Playtesting, keine finale Balance.
 */

export const TICK_HZ = 20;
export const TICK_INTERVAL_MS = 1000 / TICK_HZ;
export const RENDER_THROTTLE_MS = 200;
export const AUTOSAVE_INTERVAL_MS = 30_000;
export const OFFLINE_CAP_HOURS = 12;

// Kostenformel: Kosten(n) = Basispreis * COST_GROWTH^n
export const COST_GROWTH = 1.2;

// Content-Kurve: baseCost/baseProduction wachsen mit BUILDING_TIER_GROWTH^globalTierIndex.
// Alle Wissensquellen sind ab Epoche 1 gleichzeitig sichtbar/kaufbar — die
// Freischaltung passiert rein wirtschaftlich über diese (deutlich steilere)
// Preiskurve, nicht mehr über eine UI-Sperre je Epoche.
export const BUILDING_TIER_GROWTH = 10;
export const BUILDING_BASE_COST_START = 10;
// Einkommen (Klick + automatisch) wurde auf 1/20 des ursprünglichen Standes
// abgesenkt, die Kosten blieben unverändert (BUILDING_BASE_COST_START/-GROWTH).
export const BUILDING_PRODUCTION_TO_COST_RATIO = 0.0005;

// Klick-System — Wissen/Klick lässt sich NUR über Höhlenzeichnungen (Basis-
// Wissensquelle), Wissensquellen-Upgrades, Kern-Shop-Upgrades und Karten
// steigern (siehe WISSENSQUELLEN_UPGRADES unten).
export const CLICK_BASE_VALUE = 0.1;
export const HOEHLENZEICHNUNGEN_CLICK_BONUS_PER_UNIT = 0.1;

// Debug-Auto-Klicker: simuliert diese Anzahl echter Klicks/Sek. (nur zum
// Testen, wird später wieder entfernt).
export const DEBUG_AUTOCLICKER_CPS = 35;

// Prestige / Epochen
export const EPOCH_BONUS_BASE = 5;
export const PRESTIGE_CORE_DIVISOR = 1e6;
export const MAX_EPOCH_TIER = 5;
// Prestige ist erst möglich, sobald in diesem Run mindestens so viel Wissen
// generiert wurde — wächst pro EpochenLevel stark, damit das Erreichen der
// nächsten Epoche bewusst schwer bleibt.
export const PRESTIGE_MIN_KNOWLEDGE_BASE = 1e15;
export const PRESTIGE_MIN_KNOWLEDGE_GROWTH = 3000;

/** Wissensquellen-Meilensteine (Abschnitt "Stufen"): je Gebäude EIGENSTÄNDIG
 * anhand der besessenen Anzahl ausgewertet, alle erreichten Stufen
 * multiplizieren sich (stacken). Gilt bei Höhlenzeichnungen auf den
 * Wissen/Klick-Bonus, bei allen anderen Gebäuden auf Wissen/Sek. */
export const BUILDING_MILESTONES: Array<{ threshold: number; multiplier: number }> = [
  { threshold: 50, multiplier: 1.25 },
  { threshold: 75, multiplier: 1.25 },
  { threshold: 100, multiplier: 1.25 },
  { threshold: 125, multiplier: 1.25 },
  { threshold: 150, multiplier: 1.25 },
  { threshold: 200, multiplier: 1.5 },
  { threshold: 300, multiplier: 1.5 },
  { threshold: 400, multiplier: 1.5 },
  { threshold: 500, multiplier: 2 },
  { threshold: 750, multiplier: 4 },
  { threshold: 1000, multiplier: 6 },
];

/** Wissensquellen-Upgrades: schalten automatisch frei, sobald das jemals
 * insgesamt generierte Wissen (lifetimeKnowledge) die Schwelle erreicht —
 * kein Kauf nötig, "erscheinen" einfach. Bisher nur der erste Eintrag
 * definiert, weitere folgen später. */
export interface WissensquellenUpgradeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockAtLifetimeKnowledge: number;
  wpsToClickPercent: number;
}
export const WISSENSQUELLEN_UPGRADES: WissensquellenUpgradeDef[] = [
  {
    id: "wq_upgrade_wps_to_click_1",
    name: "Intuitives Verständnis",
    description: "Klick gibt zusätzlich 1% der aktuellen Wissen-pro-Sekunde-Rate.",
    icon: "💡",
    unlockAtLifetimeKnowledge: 1e9,
    wpsToClickPercent: 0.01,
  },
];

/** Kaufbare Wissensquellen-Upgrades für Höhlenzeichnungen (Klick-Wissensquelle).
 * Anders als WISSENSQUELLEN_UPGRADES (auto-freischaltend) müssen diese aktiv
 * für Wissen gekauft werden und multiplizieren danach dauerhaft den Wissen/Klick.
 *
 * Freischalt-Bedingung (`unlock`) macht das Upgrade KAUFBAR:
 *  - kind "clickKnowledge": mind. so viel insgesamt durch Klicken generiertes Wissen
 *  - kind "clickValue":     der aktuelle Wissen/Klick-Wert erreicht die Schwelle
 * Sichtbar wird das Upgrade separat schon ab peakKnowledge >= Kosten/10 (UI).
 */
export interface HoehlenUpgradeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number; // Wissen-Kosten
  clickMultiplier: number; // multiplikativer Faktor auf Wissen/Klick nach Kauf
  unlock: { kind: "clickKnowledge"; amount: number } | { kind: "clickValue"; amount: number };
}
export const HOEHLEN_CLICK_UPGRADES: HoehlenUpgradeDef[] = [
  {
    id: "hoehlen_click_x2_1",
    name: "Feinere Pigmente",
    description: "Verdoppelt das Wissen pro Klick (×2).",
    icon: "🖌️",
    cost: 500,
    clickMultiplier: 2,
    unlock: { kind: "clickKnowledge", amount: 100 },
  },
  {
    id: "hoehlen_click_x2_2",
    name: "Rituelle Wandmalereien",
    description: "Verdoppelt das Wissen pro Klick erneut (×2).",
    icon: "🗿",
    cost: 10000,
    clickMultiplier: 2,
    unlock: { kind: "clickValue", amount: 1000 },
  },
];

// Synergie & Ketten
export const SYNERGY_FACTOR = 0.05; // 5% * ln(1+Partneranzahl)
export const CHAIN_FACTOR = 0.002; // 0.2% pro Einheit des Vorgänger-Gebäudes

// Diversität & Masse
export const DIVERSITY_FACTOR = 0.02; // 2% pro unterschiedlichem Typ
export const MASS_FACTOR = 0.01; // 1% * sqrt(GesamtAnzahl)

// Kern-Shop Überschuss: Basis-Bonus je ungenutztem Kern, steigt mit jedem
// freigeschalteten Achievement um einen festen Zuschlag.
export const PASSIVE_CORE_BONUS_PER_CORE_BASE = 0.02; // +2% WPS pro ungenutztem Kern
export const PASSIVE_CORE_BONUS_PER_ACHIEVEMENT = 0.002; // +0,2 Prozentpunkte je Achievement

// Karten: Dropchance wird bei jedem Klick auf den Wissen-Button geprüft,
// unabhängig je Wissensquelle (nicht je Epoche) — Basis 1:1.000.000 Klicks
// pro Karte, danach je nach Seltenheit/Gebäudeanzahl skaliert (siehe formulas.ts).
export const CARD_BUFF_DURATION_S = 30;
export const CARD_BUFF_MULTIPLIER = 5; // temporärer WPS-Boost bei erfolgreichem Kartenfund
export const CARD_CLICK_DROP_BASE_CHANCE = 1 / 1_000_000;
export const CARD_DROP_LOG_SCALE = 0.15;
export const CARD_DROP_CHANCE_CEILING = 0.6;
export const CARD_DROP_TOAST_DURATION_S = 4;

// Alle *Percent/*Bonus-Werte im Code sind fraktional (0.05 = 5%), damit sie
// direkt additiv in "1 + bonus" einfließen können.
export const RARITY_TABLE: Record<
  "common" | "rare" | "epic" | "legendary",
  { chanceWeight: number; baseBoostPercent: number; color: string; colorDark: string }
> = {
  common: { chanceWeight: 1.0, baseBoostPercent: 0.005, color: "#5b7a9d", colorDark: "#8fb4de" },
  rare: { chanceWeight: 0.5, baseBoostPercent: 0.01, color: "#1f8a5f", colorDark: "#4fd39a" },
  epic: { chanceWeight: 0.2, baseBoostPercent: 0.02, color: "#8a4fd3", colorDark: "#c79bff" },
  legendary: { chanceWeight: 0.05, baseBoostPercent: 0.04, color: "#d38a1f", colorDark: "#ffcf6b" },
};

export const CARD_GEAR_THRESHOLDS: Array<{ copies: number; multiplier: number }> = [
  { copies: 10, multiplier: 1.05 },
  { copies: 25, multiplier: 1.15 },
  { copies: 50, multiplier: 1.3 },
  { copies: 100, multiplier: 1.5 },
];

// Events
export const EVENT_SPAWN_INTERVAL_MIN_S = 180;
export const EVENT_SPAWN_INTERVAL_MAX_S = 420;

// Achievements (Wissens-Schwellen für Produktions-Meilensteine)
export const PRODUCTION_MILESTONES = [
  1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e30, 1e36,
];
export const BUILDING_COUNT_MILESTONES = [10, 25, 50, 100, 250, 500, 1000];
export const CLICK_COUNT_MILESTONES = [100, 1_000, 10_000, 100_000, 1_000_000];
export const PRESTIGE_COUNT_MILESTONES = [1, 5, 10, 25, 50, 100];
export const CARD_UNIQUE_MILESTONES = [1, 5, 10, 15, 20, 26];
export const CARD_DUPLICATE_MILESTONES = [5, 10, 25, 50, 100];
export const PLAYTIME_MILESTONES_S = [
  3600, 6 * 3600, 24 * 3600, 7 * 24 * 3600, 30 * 24 * 3600,
];

export const SAVE_KEY = "wissen-save-v1";
export const SAVE_VERSION = 1;
export const SAVE_CODE_PREFIX = "WSN1:";

export const KPS_HISTORY_MAX_POINTS = 240; // ~ genug für einen langen Verlauf, alle paar Sekunden ein Punkt
export const KPS_HISTORY_SAMPLE_INTERVAL_S = 5;
export const CLICK_TIMESTAMP_WINDOW_S = 10; // Fenster für Klicks/Sekunde-Berechnung
