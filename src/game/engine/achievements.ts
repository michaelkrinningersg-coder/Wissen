import { D } from "../decimal";
import type { AchievementDef, Player } from "../types";
import { ACHIEVEMENTS } from "../config/achievements";
import { BUILDINGS } from "../config/buildings";

function metricValue(metric: AchievementDef["metric"], player: Player): number | boolean {
  switch (metric) {
    case "lifetimeKnowledge":
      return player.lifetimeKnowledge.toNumber();
    case "maxBuildingOwned":
      return Math.max(0, ...BUILDINGS.map((b) => player.buildings[b.id]?.owned ?? 0));
    case "allBuildingsOwned":
      return BUILDINGS.every((b) => (player.buildings[b.id]?.owned ?? 0) >= 1);
    case "totalClicks":
      return player.totalClicks;
    case "prestigeCount":
      return player.prestigeCount;
    case "epochenLevel":
      return player.epochenLevel;
    case "epoch5LoopCount":
      return player.epoch5LoopCount;
    case "uniqueCards":
      return Object.values(player.cards).filter((c) => c.copies > 0).length;
    case "maxCardDuplicates":
      return Math.max(0, ...Object.values(player.cards).map((c) => c.copies));
    case "playtimeSeconds":
      return player.playtimeSeconds;
    default:
      return 0;
  }
}

function meetsThreshold(metric: AchievementDef["metric"], value: number | boolean, threshold: number): boolean {
  if (metric === "allBuildingsOwned") return value === true;
  if (metric === "lifetimeKnowledge") return D(value as number).gte(threshold);
  return (value as number) >= threshold;
}

export function evaluateAchievements(player: Player): AchievementDef[] {
  const newlyUnlocked: AchievementDef[] = [];
  for (const def of ACHIEVEMENTS) {
    if (player.achievements.includes(def.id)) continue;
    const value = metricValue(def.metric, player);
    if (meetsThreshold(def.metric, value, def.threshold)) newlyUnlocked.push(def);
  }
  return newlyUnlocked;
}
