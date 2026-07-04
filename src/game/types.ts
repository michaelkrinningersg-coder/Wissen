import type { Decimal } from "./decimal";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface BuildingDef {
  id: string;
  name: string;
  icon: string;
  epoch: number; // 1-5
  tierIndex: number; // Position innerhalb der eigenen Epoche (für Ketten-/Synergie-Paarung)
  baseCost: Decimal;
  baseProduction: Decimal; // Wissen/Sek. pro Einheit (0 bei reinen Klick-Gebäuden)
  clickBonusPerUnit?: Decimal; // zusätzlicher, fester Wissen/Klick-Bonus pro Einheit (z.B. Höhlenzeichnungen)
  imageUrl?: string; // eigene Button-Grafik statt Emoji-Icon, falls vorhanden
}

export interface ComboBuildingDef {
  id: string;
  name: string;
  icon: string;
  flavor: string;
  parentA: string; // building id
  parentB: string; // building id
  threshold: number;
  unlockCost: Decimal;
  boostPercent: number; // additive local bonus granted to both parents once unlocked
}

export interface CardDef {
  id: string;
  name: string;
  era: string;
  icon: string;
  rarity: Rarity;
  linkedBuildingId: string;
  spawnThreshold: number;
  baseBoostPercent: number; // per copy
}

export interface CoreUpgradeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: Decimal; // in intelligence cores
  requires?: string[]; // prerequisite core upgrade ids
  category: "global" | "click" | "efficiency" | "synergy" | "automation";
  effectPercent?: number; // additive percent this upgrade contributes to prestigeBonus
}

export type AchievementCategory =
  | "production"
  | "buildings"
  | "clicks"
  | "prestige"
  | "cards"
  | "time";

export type AchievementMetric =
  | "lifetimeKnowledge"
  | "maxBuildingOwned"
  | "allBuildingsOwned"
  | "totalClicks"
  | "prestigeCount"
  | "epochenLevel"
  | "epoch5LoopCount"
  | "uniqueCards"
  | "maxCardDuplicates"
  | "playtimeSeconds";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  metric: AchievementMetric;
  bonusPercent: number;
  points: number;
  threshold: number;
}

export interface GameEventDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  durationSeconds: number;
  kind: "global_multiplier" | "ai_building_multiplier" | "crisis_debuff" | "click_multiplier";
  magnitude: number; // e.g. 10 for x10, 0.5 for -50%
}

export interface BuildingState {
  owned: number;
}

export interface CardState {
  copies: number;
  equipped: boolean;
}

export interface ActiveEventState {
  eventId: string;
  expiresAt: number; // playtimeSeconds timestamp
}

export interface LastCardDropState {
  cardId: string;
  at: number; // playtimeSeconds timestamp, for the drop toast display window
}

export interface KpsHistoryPoint {
  t: number; // playtimeSeconds
  kps: number; // plain number approximation for charting
}

export interface Player {
  saveVersion: number;

  knowledge: Decimal;
  lifetimeKnowledge: Decimal;
  knowledgeEarnedThisRun: Decimal;

  epochenLevel: number;
  intelligenceCores: Decimal;
  coreUpgrades: string[];
  passiveCoreBonusPercent: number;
  totalCoresEarned: Decimal;

  buildings: Record<string, BuildingState>;
  comboBuildingsOwned: string[];

  cards: Record<string, CardState>;
  lastCardDrop: LastCardDropState | null;
  activeCardBuffExpiresAt: number;
  activeCardBuffMultiplier: number;

  achievements: string[];
  achievementPoints: number;

  activeEvents: ActiveEventState[];
  nextEventSpawnIn: number;

  clickUpgrades: string[];
  totalClicks: number;
  clickTimestamps: number[]; // recent click times (playtimeSeconds) for clicks/sec stat

  playtimeSeconds: number;
  playtimeByEpoch: Record<number, number>;

  prestigeCount: number;
  epoch5LoopCount: number;
  epochCompletionTimes: Record<number, number>; // epoch -> seconds taken
  currentEpochStartedAt: number;

  peakKps: number;
  kpsHistory: KpsHistoryPoint[];
  peakClicksPerSecond: number;

  buildingAllTimeHigh: Record<string, number>;
  buildingTotalBought: Record<string, number>;

  lastSavedAt: number; // epoch ms, for offline progress calc
  createdAt: number; // epoch ms
}
