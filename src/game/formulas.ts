import { D, Decimal, ONE, ZERO } from "./decimal";
import type { Player } from "./types";
import { BUILDINGS, BUILDINGS_BY_ID, chainPredecessorOf, synergyPartnerOf } from "./config/buildings";
import { comboBuildingsForParent } from "./config/comboBuildings";
import { CORE_UPGRADES_BY_ID } from "./config/coreUpgrades";
import { CARDS_BY_ID } from "./config/cards";
import { AI_BUILDING_IDS, GAME_EVENTS_BY_ID } from "./config/events";
import {
  CARD_CLICK_DROP_BASE_CHANCE,
  CARD_DROP_CHANCE_CEILING,
  CARD_DROP_LOG_SCALE,
  CARD_GEAR_THRESHOLDS,
  CHAIN_FACTOR,
  CLICK_BASE_VALUE,
  CLICK_PHASE2_PERCENT_OF_WPS,
  CLICK_PHASE2_UNLOCK_UPGRADE_ID,
  COST_GROWTH,
  DIVERSITY_FACTOR,
  EPOCH_BONUS_BASE,
  MASS_FACTOR,
  MAX_EPOCH_TIER,
  PRESTIGE_CORE_DIVISOR,
  RARITY_TABLE,
  SYNERGY_FACTOR,
} from "./config/constants";

// ---------------------------------------------------------------------------
// Kosten
// ---------------------------------------------------------------------------

export function buildingCost(basePrice: Decimal, owned: number): Decimal {
  return basePrice.times(Decimal.pow(COST_GROWTH, owned));
}

/** Geschlossene Summenformel für den Kauf von `amount` Einheiten ab `owned`. */
export function batchCost(basePrice: Decimal, owned: number, amount: number): Decimal {
  if (amount <= 0) return ZERO;
  const growth = COST_GROWTH;
  return basePrice
    .times(Decimal.pow(growth, owned))
    .times(Decimal.pow(growth, amount).minus(1))
    .div(growth - 1);
}

/** Geschlossene Formel für die maximal kaufbare Menge (Abschnitt 15). */
export function maxAffordable(basePrice: Decimal, owned: number, available: Decimal): number {
  const denom = basePrice.times(Decimal.pow(COST_GROWTH, owned));
  if (available.lte(0) || denom.lte(0)) return 0;
  const inner = available.times(COST_GROWTH - 1).div(denom).plus(1);
  if (inner.lte(1)) return 0;
  // + kleines Epsilon: Decimal.log() ist eine Gleitkomma-Näherung und kann bei
  // exakten Ganzzahl-Grenzen knapp darunter landen (z.B. 2.9999999999999996).
  const count = inner.log(COST_GROWTH).plus(1e-9).floor().toNumber();
  return Number.isFinite(count) && count > 0 ? count : 0;
}

// ---------------------------------------------------------------------------
// Gebäude-Produktion (lokale Boni: Synergie + Ketten + Combo, additiv)
// ---------------------------------------------------------------------------

function ownedCount(player: Player, buildingId: string): number {
  return player.buildings[buildingId]?.owned ?? 0;
}

function effectiveSynergyFactor(player: Player): number {
  let factor = SYNERGY_FACTOR;
  for (const upgradeId of player.coreUpgrades) {
    const def = CORE_UPGRADES_BY_ID[upgradeId];
    if (def?.category === "synergy" && def.effectPercent) factor += def.effectPercent;
  }
  return factor;
}

export function synergyBonus(buildingId: string, player: Player, factor?: number): number {
  const partner = synergyPartnerOf(buildingId);
  if (!partner) return 0;
  const f = factor ?? effectiveSynergyFactor(player);
  return f * Math.log(1 + ownedCount(player, partner));
}

export function chainBonusFromPrevious(buildingId: string, player: Player): number {
  const predecessor = chainPredecessorOf(buildingId);
  if (!predecessor) return 0;
  return ownedCount(player, predecessor) * CHAIN_FACTOR;
}

export function comboBonus(buildingId: string, player: Player): number {
  let bonus = 0;
  for (const combo of comboBuildingsForParent(buildingId)) {
    if (player.comboBuildingsOwned.includes(combo.id)) bonus += combo.boostPercent;
  }
  return bonus;
}

export function buildingLocalMultiplier(buildingId: string, player: Player): number {
  return (
    1 +
    synergyBonus(buildingId, player) +
    chainBonusFromPrevious(buildingId, player) +
    comboBonus(buildingId, player)
  );
}

function aiBuildingEventMultiplier(player: Player): Decimal {
  let multiplier = ONE;
  for (const active of player.activeEvents) {
    const def = GAME_EVENTS_BY_ID[active.eventId];
    if (def?.kind === "ai_building_multiplier") multiplier = multiplier.times(def.magnitude);
  }
  return multiplier;
}

export function buildingProduction(buildingId: string, player: Player): Decimal {
  const def = BUILDINGS_BY_ID[buildingId];
  const owned = ownedCount(player, buildingId);
  if (!def || owned <= 0) return ZERO;
  let production = def.baseProduction.times(owned).times(buildingLocalMultiplier(buildingId, player));
  if (AI_BUILDING_IDS.has(buildingId)) {
    production = production.times(aiBuildingEventMultiplier(player));
  }
  return production;
}

export function totalBaseProduction(player: Player): Decimal {
  let total = ZERO;
  for (const b of BUILDINGS) {
    total = total.plus(buildingProduction(b.id, player));
  }
  return total;
}

// ---------------------------------------------------------------------------
// Epochen / Prestige
// ---------------------------------------------------------------------------

export function epochenTier(epochenLevel: number): number {
  return Math.min(epochenLevel, MAX_EPOCH_TIER);
}

/** 1-indizierte "aktuelle Anzeige-Epoche" (1-5): epochenLevel zählt
 * ABGESCHLOSSENE Epochen (startet bei 0), UI/Statistik brauchen die Epoche,
 * die GERADE gespielt wird — also epochenTier + 1, gedeckelt bei 5. */
export function currentEpochNumber(epochenLevel: number): number {
  return Math.min(epochenLevel + 1, MAX_EPOCH_TIER);
}

export function epochenBonus(epochenLevel: number): Decimal {
  return Decimal.pow(EPOCH_BONUS_BASE, epochenLevel);
}

export function prestigeBonus(player: Player): Decimal {
  let bonus = 1 + player.passiveCoreBonusPercent;
  for (const upgradeId of player.coreUpgrades) {
    const def = CORE_UPGRADES_BY_ID[upgradeId];
    if ((def?.category === "global" || def?.category === "efficiency") && def.effectPercent) {
      bonus += def.effectPercent;
    }
  }
  return new Decimal(bonus);
}

export function clickUpgradeBonus(player: Player): number {
  let bonus = 0;
  for (const upgradeId of player.coreUpgrades) {
    const def = CORE_UPGRADES_BY_ID[upgradeId];
    if (def?.category === "click" && def.effectPercent) bonus += def.effectPercent;
  }
  return bonus;
}

export function coresAwarded(totalKnowledgeThisRun: Decimal): Decimal {
  return totalKnowledgeThisRun.div(PRESTIGE_CORE_DIVISOR).sqrt().floor();
}

// ---------------------------------------------------------------------------
// Diversität / Masse / Karten / Achievements (globaler additiver Block)
// ---------------------------------------------------------------------------

export function diversityBonus(player: Player): number {
  const distinctTypes = BUILDINGS.filter((b) => ownedCount(player, b.id) > 0).length;
  return distinctTypes * DIVERSITY_FACTOR;
}

export function massBonus(player: Player): number {
  const total = BUILDINGS.reduce((sum, b) => sum + ownedCount(player, b.id), 0);
  return Math.sqrt(total) * MASS_FACTOR;
}

export function cardGearMultiplier(copies: number): number {
  let multiplier = 1;
  for (const tier of CARD_GEAR_THRESHOLDS) {
    if (copies >= tier.copies) multiplier = tier.multiplier;
  }
  return multiplier;
}

/** Ausrüstungs-Multiplikator wird automatisch ab den Kopie-Schwellen angewendet (Abschnitt 13). */
export function cardsBonus(player: Player): number {
  let bonus = 0;
  for (const [cardId, state] of Object.entries(player.cards)) {
    const def = CARDS_BY_ID[cardId];
    if (!def || state.copies <= 0) continue;
    bonus += state.copies * def.baseBoostPercent * cardGearMultiplier(state.copies);
  }
  return bonus;
}

export function achievementsBonus(player: Player, achievementsById: Record<string, { bonusPercent: number }>): number {
  let bonus = 0;
  for (const id of player.achievements) {
    bonus += achievementsById[id]?.bonusPercent ?? 0;
  }
  return bonus;
}

export function globalMultiplicativeBlock(
  player: Player,
  achievementsById: Record<string, { bonusPercent: number }>,
): Decimal {
  return new Decimal(
    1 + diversityBonus(player) + massBonus(player) + cardsBonus(player) + achievementsBonus(player, achievementsById),
  );
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export function globalEventMultiplier(player: Player): Decimal {
  let multiplier = ONE;
  for (const active of player.activeEvents) {
    const def = GAME_EVENTS_BY_ID[active.eventId];
    if (def?.kind === "global_multiplier" || def?.kind === "crisis_debuff") {
      multiplier = multiplier.times(def.magnitude);
    }
  }
  return multiplier;
}

export function clickEventMultiplier(player: Player): number {
  let multiplier = 1;
  for (const active of player.activeEvents) {
    const def = GAME_EVENTS_BY_ID[active.eventId];
    if (def?.kind === "click_multiplier") multiplier *= def.magnitude;
  }
  return multiplier;
}

// ---------------------------------------------------------------------------
// Gesamtformel
// ---------------------------------------------------------------------------

export function knowledgePerSecond(
  player: Player,
  achievementsById: Record<string, { bonusPercent: number }>,
): Decimal {
  return totalBaseProduction(player)
    .times(epochenBonus(player.epochenLevel))
    .times(prestigeBonus(player))
    .times(globalMultiplicativeBlock(player, achievementsById))
    .times(globalEventMultiplier(player));
}

export function clickValue(player: Player, kps: Decimal): Decimal {
  const phase1 = new Decimal(CLICK_BASE_VALUE * (1 + clickUpgradeBonus(player)));
  const phase2Unlocked = player.coreUpgrades.includes(CLICK_PHASE2_UNLOCK_UPGRADE_ID);
  const buffMultiplier = player.activeCardBuffMultiplier > 0 ? player.activeCardBuffMultiplier : 1;
  let value = phase1;
  if (phase2Unlocked) {
    value = value.plus(kps.times(CLICK_PHASE2_PERCENT_OF_WPS));
  }
  return value.times(clickEventMultiplier(player)).times(buffMultiplier);
}

// ---------------------------------------------------------------------------
// Karten – Dropchance pro Klick (Abschnitt 13, überarbeitet: je Wissensquelle
// statt je Epoche, ausgelöst durch Klick auf den Wissen-Button statt durch
// einen separaten Zufalls-Spawn. Basis 1:1.000.000 Klicks pro Karte.)
// ---------------------------------------------------------------------------

export function cardSpawnChance(cardId: string, player: Player): number {
  const def = CARDS_BY_ID[cardId];
  if (!def) return 0;
  const owned = ownedCount(player, def.linkedBuildingId);
  if (owned < def.spawnThreshold) return 0;
  const rarityWeight = RARITY_TABLE[def.rarity].chanceWeight;
  const over = owned - def.spawnThreshold;
  const chance = CARD_CLICK_DROP_BASE_CHANCE * rarityWeight * (1 + Math.log(1 + over) * CARD_DROP_LOG_SCALE);
  return Math.min(chance, CARD_DROP_CHANCE_CEILING);
}

export function eligibleCardIds(player: Player): string[] {
  return Object.keys(CARDS_BY_ID).filter((id) => cardSpawnChance(id, player) > 0);
}

export { D };
