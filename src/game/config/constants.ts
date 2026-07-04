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
export const COST_GROWTH = 1.15;

// Content-Kurve: baseCost/baseProduction wachsen mit BUILDING_TIER_GROWTH^globalTierIndex
export const BUILDING_TIER_GROWTH = 3.4;
export const BUILDING_BASE_COST_START = 10;
export const BUILDING_PRODUCTION_TO_COST_RATIO = 0.1;

// Klick-System
export const CLICK_BASE_VALUE = 1;
export const CLICK_PHASE2_UNLOCK_UPGRADE_ID = "click_phase2_wps_percent";
export const CLICK_PHASE2_PERCENT_OF_WPS = 0.01; // 1% der WPS pro Klick, sobald freigeschaltet

// Prestige / Epochen
export const EPOCH_BONUS_BASE = 5;
export const PRESTIGE_CORE_DIVISOR = 1e6;
export const MAX_EPOCH_TIER = 5;

// Synergie & Ketten
export const SYNERGY_FACTOR = 0.05; // 5% * ln(1+Partneranzahl)
export const CHAIN_FACTOR = 0.002; // 0.2% pro Einheit des Vorgänger-Gebäudes

// Diversität & Masse
export const DIVERSITY_FACTOR = 0.02; // 2% pro unterschiedlichem Typ
export const MASS_FACTOR = 0.01; // 1% * sqrt(GesamtAnzahl)

// Kern-Shop Überschuss
export const PASSIVE_CORE_BONUS_PER_CORE = 0.01; // +1% WPS pro ungenutztem Kern

// Karten
export const CARD_SPAWN_INTERVAL_MIN_S = 90;
export const CARD_SPAWN_INTERVAL_MAX_S = 240;
export const CARD_SPAWN_VISIBLE_S = 15;
export const CARD_BUFF_DURATION_S = 30;
export const CARD_BUFF_MULTIPLIER = 5; // temporärer WPS-Boost beim Anklicken
export const CARD_BASE_DROP_RATE = 0.15; // Basis-Chance, dass der Klick überhaupt eine Karte droppt
export const CARD_DROP_LOG_SCALE = 0.15;
export const CARD_DROP_CHANCE_CEILING = 0.6;

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
