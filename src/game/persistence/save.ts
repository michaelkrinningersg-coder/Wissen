import { Decimal } from "../decimal";
import type { KpsHistoryPoint, Player } from "../types";
import { createInitialPlayer } from "../state/initialState";
import { SAVE_KEY, SAVE_VERSION } from "../config/constants";
import { migrateSave } from "./migrations";

export interface PlayerSave {
  saveVersion: number;
  knowledge: string;
  lifetimeKnowledge: string;
  knowledgeEarnedThisRun: string;
  epochenLevel: number;
  intelligenceCores: string;
  coreUpgrades: string[];
  passiveCoreBonusPercent: number;
  totalCoresEarned: string;
  buildings: Player["buildings"];
  comboBuildingsOwned: string[];
  cards: Player["cards"];
  achievements: string[];
  achievementPoints: number;
  totalClicks: number;
  playtimeSeconds: number;
  playtimeByEpoch: Record<number, number>;
  prestigeCount: number;
  miniPrestigeCount: number;
  epoch5LoopCount: number;
  epochCompletionTimes: Record<number, number>;
  currentEpochStartedAt: number;
  peakKps: number;
  kpsHistory: KpsHistoryPoint[];
  peakClicksPerSecond: number;
  buildingAllTimeHigh: Record<string, number>;
  buildingTotalBought: Record<string, number>;
  lastSavedAt: number;
  createdAt: number;
}

/** Nur die dauerhaften Felder werden gespeichert; transiente Laufzeit-Felder
 * (aktive Events/Karten-Spawns/Klick-Zeitstempel) starten nach dem Laden frisch. */
export function toSaveShape(player: Player): PlayerSave {
  return {
    saveVersion: SAVE_VERSION,
    knowledge: player.knowledge.toString(),
    lifetimeKnowledge: player.lifetimeKnowledge.toString(),
    knowledgeEarnedThisRun: player.knowledgeEarnedThisRun.toString(),
    epochenLevel: player.epochenLevel,
    intelligenceCores: player.intelligenceCores.toString(),
    coreUpgrades: player.coreUpgrades,
    passiveCoreBonusPercent: player.passiveCoreBonusPercent,
    totalCoresEarned: player.totalCoresEarned.toString(),
    buildings: player.buildings,
    comboBuildingsOwned: player.comboBuildingsOwned,
    cards: player.cards,
    achievements: player.achievements,
    achievementPoints: player.achievementPoints,
    totalClicks: player.totalClicks,
    playtimeSeconds: player.playtimeSeconds,
    playtimeByEpoch: player.playtimeByEpoch,
    prestigeCount: player.prestigeCount,
    miniPrestigeCount: player.miniPrestigeCount,
    epoch5LoopCount: player.epoch5LoopCount,
    epochCompletionTimes: player.epochCompletionTimes,
    currentEpochStartedAt: player.currentEpochStartedAt,
    peakKps: player.peakKps,
    kpsHistory: player.kpsHistory,
    peakClicksPerSecond: player.peakClicksPerSecond,
    buildingAllTimeHigh: player.buildingAllTimeHigh,
    buildingTotalBought: player.buildingTotalBought,
    lastSavedAt: Date.now(),
    createdAt: player.createdAt,
  };
}

export function fromSaveShape(raw: unknown): Player {
  const save = migrateSave(raw);
  const base = createInitialPlayer();
  return {
    ...base,
    saveVersion: SAVE_VERSION,
    knowledge: Decimal.fromValue(save.knowledge),
    lifetimeKnowledge: Decimal.fromValue(save.lifetimeKnowledge),
    knowledgeEarnedThisRun: Decimal.fromValue(save.knowledgeEarnedThisRun),
    epochenLevel: save.epochenLevel,
    intelligenceCores: Decimal.fromValue(save.intelligenceCores),
    coreUpgrades: save.coreUpgrades,
    passiveCoreBonusPercent: save.passiveCoreBonusPercent,
    totalCoresEarned: Decimal.fromValue(save.totalCoresEarned),
    buildings: { ...base.buildings, ...save.buildings },
    comboBuildingsOwned: save.comboBuildingsOwned,
    cards: save.cards,
    achievements: save.achievements,
    achievementPoints: save.achievementPoints,
    totalClicks: save.totalClicks,
    playtimeSeconds: save.playtimeSeconds,
    playtimeByEpoch: { ...base.playtimeByEpoch, ...save.playtimeByEpoch },
    prestigeCount: save.prestigeCount,
    miniPrestigeCount: save.miniPrestigeCount,
    epoch5LoopCount: save.epoch5LoopCount,
    epochCompletionTimes: save.epochCompletionTimes,
    currentEpochStartedAt: save.currentEpochStartedAt,
    peakKps: save.peakKps,
    kpsHistory: save.kpsHistory,
    peakClicksPerSecond: save.peakClicksPerSecond,
    buildingAllTimeHigh: { ...base.buildingAllTimeHigh, ...save.buildingAllTimeHigh },
    buildingTotalBought: { ...base.buildingTotalBought, ...save.buildingTotalBought },
    lastSavedAt: save.lastSavedAt,
    createdAt: save.createdAt,
  };
}

export function saveToLocalStorage(player: Player): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveShape(player)));
  } catch (err) {
    console.error("Speichern fehlgeschlagen", err);
  }
}

export function loadFromLocalStorage(): Player | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return fromSaveShape(JSON.parse(raw));
  } catch (err) {
    console.error("Laden fehlgeschlagen", err);
    return null;
  }
}

export function hasSaveGame(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch {
    return false;
  }
}
