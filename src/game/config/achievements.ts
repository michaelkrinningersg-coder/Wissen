import type { AchievementDef, AchievementMetric } from "../types";
import {
  BUILDING_COUNT_MILESTONES,
  CARD_DUPLICATE_MILESTONES,
  CARD_UNIQUE_MILESTONES,
  CLICK_COUNT_MILESTONES,
  PLAYTIME_MILESTONES_S,
  PRESTIGE_COUNT_MILESTONES,
  PRODUCTION_MILESTONES,
} from "./constants";
import { CARDS } from "./cards";

function buildTier(
  idPrefix: string,
  namePrefix: string,
  icon: string,
  category: AchievementDef["category"],
  metric: AchievementMetric,
  thresholds: number[],
  labels: string[],
  descriptionFn: (label: string) => string,
): AchievementDef[] {
  return thresholds.map((threshold, i) => ({
    id: `${idPrefix}_${i}`,
    name: `${namePrefix} ${labels[i]}`,
    description: descriptionFn(labels[i]),
    icon,
    category,
    metric,
    threshold,
    bonusPercent: 0.0025 * (i + 1),
    points: 5 * (i + 1),
  }));
}

const PRODUCTION_LABELS = [
  "1 Tsd.",
  "1 Mio.",
  "1 Mrd.",
  "1 Bio.",
  "1e15",
  "1e18",
  "1e21",
  "1e24",
  "1e30",
  "1e36",
];

const BUILDING_LABELS = BUILDING_COUNT_MILESTONES.map((n) => `${n}`);
const CLICK_LABELS = CLICK_COUNT_MILESTONES.map((n) => n.toLocaleString("de-DE"));
const PRESTIGE_LABELS = PRESTIGE_COUNT_MILESTONES.map((n) => `${n}`);
const CARD_UNIQUE_LABELS = CARD_UNIQUE_MILESTONES.map((n) => `${n}`);
const CARD_DUPLICATE_LABELS = CARD_DUPLICATE_MILESTONES.map((n) => `${n}`);
const PLAYTIME_LABELS = ["1 Std.", "6 Std.", "1 Tag", "1 Woche", "1 Monat"];

export const ACHIEVEMENTS: AchievementDef[] = [
  ...buildTier(
    "ach_production",
    "Gesamtwissen",
    "🧠",
    "production",
    "lifetimeKnowledge",
    PRODUCTION_MILESTONES,
    PRODUCTION_LABELS,
    (label) => `Insgesamt ${label} Wissen gesammelt (über alle Runs hinweg).`,
  ),
  ...buildTier(
    "ach_building",
    "Gebäude-Meister",
    "🏗️",
    "buildings",
    "maxBuildingOwned",
    BUILDING_COUNT_MILESTONES,
    BUILDING_LABELS,
    (label) => `${label} Exemplare eines einzelnen Gebäudetyps besessen.`,
  ),
  {
    id: "ach_universalgelehrter",
    name: "Universalgelehrter",
    description: "Mindestens 1 von jedem Gebäudetyp gleichzeitig besessen.",
    icon: "🌐",
    category: "buildings",
    metric: "allBuildingsOwned",
    threshold: 1,
    bonusPercent: 0.02,
    points: 25,
  },
  ...buildTier(
    "ach_clicks",
    "Fleißiger Klicker",
    "🖱️",
    "clicks",
    "totalClicks",
    CLICK_COUNT_MILESTONES,
    CLICK_LABELS,
    (label) => `Insgesamt ${label} Mal geklickt.`,
  ),
  ...buildTier(
    "ach_prestige",
    "Epochenwandler",
    "🔁",
    "prestige",
    "prestigeCount",
    PRESTIGE_COUNT_MILESTONES,
    PRESTIGE_LABELS,
    (label) => `${label} Mal das Wissen der Epochen zurückgesetzt.`,
  ),
  {
    id: "ach_epoch5_reached",
    name: "Kosmisches Bewusstsein",
    description: "Epoche 5 erreicht.",
    icon: "🌌",
    category: "prestige",
    metric: "epochenLevel",
    threshold: 5,
    bonusPercent: 0.03,
    points: 30,
  },
  {
    id: "ach_epoch5_loop_10",
    name: "Endlose Wiederkehr",
    description: "10 Mal innerhalb von Epoche 5 zurückgesetzt.",
    icon: "♾️",
    category: "prestige",
    metric: "epoch5LoopCount",
    threshold: 10,
    bonusPercent: 0.05,
    points: 50,
  },
  ...buildTier(
    "ach_card_unique",
    "Sammler",
    "🃏",
    "cards",
    "uniqueCards",
    CARD_UNIQUE_MILESTONES,
    CARD_UNIQUE_LABELS,
    (label) => `${label} von ${CARDS.length} einzigartigen Karten gesammelt.`,
  ),
  ...buildTier(
    "ach_card_duplicate",
    "Verehrer",
    "📇",
    "cards",
    "maxCardDuplicates",
    CARD_DUPLICATE_MILESTONES,
    CARD_DUPLICATE_LABELS,
    (label) => `${label} Kopien einer einzelnen Karte gesammelt.`,
  ),
  ...buildTier(
    "ach_playtime",
    "Zeitgelehrter",
    "⏳",
    "time",
    "playtimeSeconds",
    PLAYTIME_MILESTONES_S,
    PLAYTIME_LABELS,
    (label) => `Insgesamt ${label} gespielt.`,
  ),
];

export const ACHIEVEMENTS_BY_ID: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);
