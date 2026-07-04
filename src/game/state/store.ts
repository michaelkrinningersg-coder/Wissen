import { create } from "zustand";
import { ZERO } from "../decimal";
import type { Player } from "../types";
import { createInitialPlayer } from "./initialState";
import { BUILDINGS, BUILDINGS_BY_ID } from "../config/buildings";
import { COMBO_BUILDINGS_BY_ID } from "../config/comboBuildings";
import { CORE_UPGRADES_BY_ID, isCoreShopFullyPurchased, isCoreUpgradeAvailable } from "../config/coreUpgrades";
import { ACHIEVEMENTS_BY_ID } from "../config/achievements";
import { GAME_EVENTS } from "../config/events";
import * as formulas from "../formulas";
import { evaluateAchievements } from "../engine/achievements";
import {
  CARD_BUFF_DURATION_S,
  CARD_BUFF_MULTIPLIER,
  CLICK_TIMESTAMP_WINDOW_S,
  EVENT_SPAWN_INTERVAL_MAX_S,
  EVENT_SPAWN_INTERVAL_MIN_S,
  KPS_HISTORY_MAX_POINTS,
  KPS_HISTORY_SAMPLE_INTERVAL_S,
  PASSIVE_CORE_BONUS_PER_CORE,
} from "../config/constants";

export type BuyAmount = 1 | 5 | 10 | 25 | 50 | 100 | "max";

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function applyAchievements(player: Player): Player {
  const newlyUnlocked = evaluateAchievements(player);
  if (newlyUnlocked.length === 0) return player;
  return {
    ...player,
    achievements: [...player.achievements, ...newlyUnlocked.map((a) => a.id)],
    achievementPoints: player.achievementPoints + newlyUnlocked.reduce((sum, a) => sum + a.points, 0),
  };
}

/** Karten-Dropchance bei jedem Klick auf den Wissen-Button (Abschnitt 13,
 * überarbeitet): unabhängige Rolls je Wissensquelle, Basis 1:1.000.000. Ein
 * Treffer gibt sofort eine Kopie + den temporären WPS-Buff. */
function rollCardDrops(player: Player): Player {
  let next = player;
  let dropped = false;
  for (const cardId of formulas.eligibleCardIds(player)) {
    if (Math.random() >= formulas.cardSpawnChance(cardId, player)) continue;
    const existing = next.cards[cardId] ?? { copies: 0, equipped: false };
    next = {
      ...next,
      cards: { ...next.cards, [cardId]: { copies: existing.copies + 1, equipped: true } },
      lastCardDrop: { cardId, at: player.playtimeSeconds },
    };
    dropped = true;
  }
  if (dropped) {
    next = {
      ...next,
      activeCardBuffMultiplier: CARD_BUFF_MULTIPLIER,
      activeCardBuffExpiresAt: player.playtimeSeconds + CARD_BUFF_DURATION_S,
    };
  }
  return next;
}

interface GameStoreState {
  player: Player;
  actions: {
    click: () => void;
    buyBuilding: (buildingId: string, amount: BuyAmount) => void;
    purchaseCoreUpgrade: (upgradeId: string) => void;
    unlockComboBuilding: (comboId: string) => void;
    prestige: () => void;
    replacePlayer: (player: Player) => void;
    resetGame: () => void;
    tick: (dtSeconds: number) => void;
  };
}

export const useGameStore = create<GameStoreState>()((set, get) => ({
  player: createInitialPlayer(),

  actions: {
    click: () => {
      const { player } = get();
      const kps = formulas.knowledgePerSecond(player, ACHIEVEMENTS_BY_ID);
      const gain = formulas.clickValue(player, kps);
      const now = player.playtimeSeconds;
      const clickTimestamps = [...player.clickTimestamps, now].filter(
        (t) => now - t <= CLICK_TIMESTAMP_WINDOW_S,
      );
      const clicksPerSecond = clickTimestamps.length / CLICK_TIMESTAMP_WINDOW_S;

      let next: Player = {
        ...player,
        knowledge: player.knowledge.plus(gain),
        lifetimeKnowledge: player.lifetimeKnowledge.plus(gain),
        knowledgeEarnedThisRun: player.knowledgeEarnedThisRun.plus(gain),
        totalClicks: player.totalClicks + 1,
        clickTimestamps,
        peakClicksPerSecond: Math.max(player.peakClicksPerSecond, clicksPerSecond),
      };
      next = rollCardDrops(next);
      next = applyAchievements(next);
      set({ player: next });
    },

    buyBuilding: (buildingId, amount) => {
      const { player } = get();
      const def = BUILDINGS_BY_ID[buildingId];
      if (!def) return;
      const owned = player.buildings[buildingId]?.owned ?? 0;
      const count =
        amount === "max" ? formulas.maxAffordable(def.baseCost, owned, player.knowledge) : amount;
      if (count <= 0) return;
      const cost = formulas.batchCost(def.baseCost, owned, count);
      if (player.knowledge.lt(cost)) return;

      const newOwned = owned + count;
      let next: Player = {
        ...player,
        knowledge: player.knowledge.minus(cost),
        buildings: { ...player.buildings, [buildingId]: { owned: newOwned } },
        buildingTotalBought: {
          ...player.buildingTotalBought,
          [buildingId]: (player.buildingTotalBought[buildingId] ?? 0) + count,
        },
        buildingAllTimeHigh: {
          ...player.buildingAllTimeHigh,
          [buildingId]: Math.max(player.buildingAllTimeHigh[buildingId] ?? 0, newOwned),
        },
      };
      next = applyAchievements(next);
      set({ player: next });
    },

    purchaseCoreUpgrade: (upgradeId) => {
      const { player } = get();
      if (!isCoreUpgradeAvailable(upgradeId, player.coreUpgrades)) return;
      const def = CORE_UPGRADES_BY_ID[upgradeId];
      if (!def || player.intelligenceCores.lt(def.cost)) return;
      set({
        player: {
          ...player,
          intelligenceCores: player.intelligenceCores.minus(def.cost),
          coreUpgrades: [...player.coreUpgrades, upgradeId],
        },
      });
    },

    unlockComboBuilding: (comboId) => {
      const { player } = get();
      const combo = COMBO_BUILDINGS_BY_ID[comboId];
      if (!combo || player.comboBuildingsOwned.includes(comboId)) return;
      const ownedA = player.buildings[combo.parentA]?.owned ?? 0;
      const ownedB = player.buildings[combo.parentB]?.owned ?? 0;
      if (ownedA < combo.threshold || ownedB < combo.threshold) return;
      if (player.knowledge.lt(combo.unlockCost)) return;
      set({
        player: {
          ...player,
          knowledge: player.knowledge.minus(combo.unlockCost),
          comboBuildingsOwned: [...player.comboBuildingsOwned, comboId],
        },
      });
    },

    prestige: () => {
      const { player } = get();
      const oldTier = formulas.currentEpochNumber(player.epochenLevel);
      const cores = formulas.coresAwarded(player.knowledgeEarnedThisRun);
      const fullyPurchased = isCoreShopFullyPurchased(player.coreUpgrades);
      const elapsed = player.playtimeSeconds - player.currentEpochStartedAt;
      const existingBest = player.epochCompletionTimes[oldTier];
      const newBest = existingBest === undefined ? elapsed : Math.min(existingBest, elapsed);

      const newEpochLevel = player.epochenLevel + 1;
      const newTier = formulas.currentEpochNumber(newEpochLevel);

      let next: Player = {
        ...player,
        knowledge: ZERO,
        knowledgeEarnedThisRun: ZERO,
        buildings: Object.fromEntries(BUILDINGS.map((b) => [b.id, { owned: 0 }])),
        intelligenceCores: fullyPurchased ? player.intelligenceCores : player.intelligenceCores.plus(cores),
        passiveCoreBonusPercent: fullyPurchased
          ? player.passiveCoreBonusPercent + cores.toNumber() * PASSIVE_CORE_BONUS_PER_CORE
          : player.passiveCoreBonusPercent,
        totalCoresEarned: player.totalCoresEarned.plus(cores),
        epochenLevel: newEpochLevel,
        prestigeCount: player.prestigeCount + 1,
        epoch5LoopCount: oldTier === 5 ? player.epoch5LoopCount + 1 : player.epoch5LoopCount,
        epochCompletionTimes: { ...player.epochCompletionTimes, [oldTier]: newBest },
        currentEpochStartedAt: player.playtimeSeconds,
        playtimeByEpoch: {
          ...player.playtimeByEpoch,
          [newTier]: player.playtimeByEpoch[newTier] ?? 0,
        },
        activeCardBuffMultiplier: 1,
        activeCardBuffExpiresAt: 0,
      };
      next = applyAchievements(next);
      set({ player: next });
    },

    replacePlayer: (player) => set({ player }),

    resetGame: () => set({ player: createInitialPlayer() }),

    tick: (dtSeconds) => {
      const { player } = get();
      const kps = formulas.knowledgePerSecond(player, ACHIEVEMENTS_BY_ID);
      const gain = kps.times(dtSeconds);
      const newPlaytime = player.playtimeSeconds + dtSeconds;
      const tier = formulas.currentEpochNumber(player.epochenLevel);

      let next: Player = {
        ...player,
        knowledge: player.knowledge.plus(gain),
        lifetimeKnowledge: player.lifetimeKnowledge.plus(gain),
        knowledgeEarnedThisRun: player.knowledgeEarnedThisRun.plus(gain),
        playtimeSeconds: newPlaytime,
        playtimeByEpoch: {
          ...player.playtimeByEpoch,
          [tier]: (player.playtimeByEpoch[tier] ?? 0) + dtSeconds,
        },
        peakKps: Math.max(player.peakKps, kps.toNumber()),
      };

      if (next.activeCardBuffExpiresAt > 0 && newPlaytime >= next.activeCardBuffExpiresAt) {
        next = { ...next, activeCardBuffMultiplier: 1, activeCardBuffExpiresAt: 0 };
      }

      // Auto-Klicker (Kern-Upgrade): kontinuierlicher passiver Klick-Ertrag,
      // zählt bewusst nicht in totalClicks/Klick-Achievements (nur echte Klicks).
      if (next.coreUpgrades.includes("core_automation_autoclicker")) {
        const autoClickGain = formulas.clickValue(next, kps).times(dtSeconds);
        next = {
          ...next,
          knowledge: next.knowledge.plus(autoClickGain),
          lifetimeKnowledge: next.lifetimeKnowledge.plus(autoClickGain),
          knowledgeEarnedThisRun: next.knowledgeEarnedThisRun.plus(autoClickGain),
        };
      }

      const activeEvents = next.activeEvents.filter((e) => e.expiresAt > newPlaytime);
      if (activeEvents.length !== next.activeEvents.length) next = { ...next, activeEvents };

      let nextEventSpawnIn = next.nextEventSpawnIn - dtSeconds;

      if (nextEventSpawnIn <= 0 && next.activeEvents.length === 0) {
        const eventDef = GAME_EVENTS[Math.floor(Math.random() * GAME_EVENTS.length)];
        next = {
          ...next,
          activeEvents: [
            ...next.activeEvents,
            { eventId: eventDef.id, expiresAt: newPlaytime + eventDef.durationSeconds },
          ],
        };
        nextEventSpawnIn = randomBetween(EVENT_SPAWN_INTERVAL_MIN_S, EVENT_SPAWN_INTERVAL_MAX_S);
      }

      next = { ...next, nextEventSpawnIn };

      if (Math.floor(newPlaytime) > Math.floor(player.playtimeSeconds)) {
        // Auto-Buyer (Kern-Upgrade): kauft einmal pro Sekunde das günstigste
        // gerade bezahlbare Gebäude automatisch.
        if (next.coreUpgrades.includes("core_automation_autobuyer")) {
          let cheapest: { id: string; cost: ReturnType<typeof formulas.buildingCost> } | null = null;
          for (const b of BUILDINGS) {
            const owned = next.buildings[b.id]?.owned ?? 0;
            const cost = formulas.buildingCost(b.baseCost, owned);
            if (next.knowledge.gte(cost) && (!cheapest || cost.lt(cheapest.cost))) {
              cheapest = { id: b.id, cost };
            }
          }
          if (cheapest) {
            const owned = next.buildings[cheapest.id]?.owned ?? 0;
            const newOwned = owned + 1;
            next = {
              ...next,
              knowledge: next.knowledge.minus(cheapest.cost),
              buildings: { ...next.buildings, [cheapest.id]: { owned: newOwned } },
              buildingTotalBought: {
                ...next.buildingTotalBought,
                [cheapest.id]: (next.buildingTotalBought[cheapest.id] ?? 0) + 1,
              },
              buildingAllTimeHigh: {
                ...next.buildingAllTimeHigh,
                [cheapest.id]: Math.max(next.buildingAllTimeHigh[cheapest.id] ?? 0, newOwned),
              },
            };
          }
        }

        next = applyAchievements(next);
        const lastPoint = next.kpsHistory[next.kpsHistory.length - 1];
        if (!lastPoint || newPlaytime - lastPoint.t >= KPS_HISTORY_SAMPLE_INTERVAL_S) {
          next = {
            ...next,
            kpsHistory: [...next.kpsHistory, { t: newPlaytime, kps: kps.toNumber() }].slice(
              -KPS_HISTORY_MAX_POINTS,
            ),
          };
        }
      }

      set({ player: next });
    },
  },
}));

export const useGameActions = () => useGameStore((s) => s.actions);
