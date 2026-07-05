import { type Decimal, decimalMax, ZERO } from "../decimal";
import type { Player } from "../types";
import * as formulas from "../formulas";
import { ACHIEVEMENTS_BY_ID } from "../config/achievements";
import { OFFLINE_CAP_HOURS } from "../config/constants";

export interface OfflineProgressResult {
  player: Player;
  offlineSeconds: number;
  offlineGain: Decimal;
}

/** Einmalige Gutschrift beim Laden: WPS_beim_Verlassen × min(Abwesenheit, Cap). */
export function applyOfflineProgress(player: Player, nowMs: number): OfflineProgressResult {
  const elapsedMs = Math.max(0, nowMs - player.lastSavedAt);
  const cappedSeconds = Math.min(elapsedMs / 1000, OFFLINE_CAP_HOURS * 3600);
  if (cappedSeconds < 1) {
    return { player, offlineSeconds: 0, offlineGain: ZERO };
  }
  const kps = formulas.knowledgePerSecond(player, ACHIEVEMENTS_BY_ID);
  const gain = kps.times(cappedSeconds);
  return {
    player: {
      ...player,
      knowledge: player.knowledge.plus(gain),
      lifetimeKnowledge: player.lifetimeKnowledge.plus(gain),
      knowledgeEarnedThisRun: player.knowledgeEarnedThisRun.plus(gain),
      peakKnowledge: decimalMax(player.peakKnowledge, player.knowledge.plus(gain)),
      playtimeSeconds: player.playtimeSeconds + cappedSeconds,
    },
    offlineSeconds: cappedSeconds,
    offlineGain: gain,
  };
}
