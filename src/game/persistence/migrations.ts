import type { PlayerSave } from "./save";
import { SAVE_VERSION } from "../config/constants";

/**
 * Versions-Migrations-Gerüst: aktuell nur v1. Künftige Save-Format-Änderungen
 * werden hier sequenziell behandelt (z.B. `if (version < 2) save = ...`),
 * damit alte Spielstände nicht ungültig werden.
 */
export function migrateSave(raw: unknown): PlayerSave {
  const partial = (raw ?? {}) as Partial<PlayerSave> & { saveVersion?: number };
  const defaults = defaultSaveShape();
  return {
    ...defaults,
    ...partial,
    saveVersion: SAVE_VERSION,
  };
}

function defaultSaveShape(): PlayerSave {
  return {
    saveVersion: SAVE_VERSION,
    knowledge: "0",
    lifetimeKnowledge: "0",
    knowledgeEarnedThisRun: "0",
    epochenLevel: 0,
    intelligenceCores: "0",
    coreUpgrades: [],
    passiveCoreBonusPercent: 0,
    totalCoresEarned: "0",
    buildings: {},
    comboBuildingsOwned: [],
    cards: {},
    achievements: [],
    achievementPoints: 0,
    totalClicks: 0,
    playtimeSeconds: 0,
    playtimeByEpoch: {},
    prestigeCount: 0,
    miniPrestigeCount: 0,
    epoch5LoopCount: 0,
    epochCompletionTimes: {},
    currentEpochStartedAt: 0,
    peakKps: 0,
    kpsHistory: [],
    peakClicksPerSecond: 0,
    buildingAllTimeHigh: {},
    buildingTotalBought: {},
    lastSavedAt: Date.now(),
    createdAt: Date.now(),
  };
}
