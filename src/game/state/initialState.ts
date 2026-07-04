import { ZERO } from "../decimal";
import type { Player } from "../types";
import { BUILDINGS } from "../config/buildings";
import { SAVE_VERSION } from "../config/constants";

export function createInitialPlayer(): Player {
  return {
    saveVersion: SAVE_VERSION,

    knowledge: ZERO,
    lifetimeKnowledge: ZERO,
    knowledgeEarnedThisRun: ZERO,

    epochenLevel: 0,
    intelligenceCores: ZERO,
    coreUpgrades: [],
    passiveCoreBonusPercent: 0,
    totalCoresEarned: ZERO,

    buildings: Object.fromEntries(BUILDINGS.map((b) => [b.id, { owned: 0 }])),
    comboBuildingsOwned: [],

    cards: {},
    lastCardDrop: null,
    activeCardBuffExpiresAt: 0,
    activeCardBuffMultiplier: 1,

    achievements: [],
    achievementPoints: 0,

    activeEvents: [],
    nextEventSpawnIn: 120,

    clickUpgrades: [],
    totalClicks: 0,
    clickTimestamps: [],

    playtimeSeconds: 0,
    playtimeByEpoch: { 1: 0 },

    prestigeCount: 0,
    epoch5LoopCount: 0,
    epochCompletionTimes: {},
    currentEpochStartedAt: 0,

    peakKps: 0,
    kpsHistory: [],
    peakClicksPerSecond: 0,

    buildingAllTimeHigh: Object.fromEntries(BUILDINGS.map((b) => [b.id, 0])),
    buildingTotalBought: Object.fromEntries(BUILDINGS.map((b) => [b.id, 0])),

    lastSavedAt: Date.now(),
    createdAt: Date.now(),
  };
}
