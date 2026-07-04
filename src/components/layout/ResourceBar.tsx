import type { Decimal } from "../../game/decimal";
import type { Player } from "../../game/types";
import { formatInt, formatKnowledge, formatPercent } from "../../game/format";
import { isCoreShopFullyPurchased } from "../../game/config/coreUpgrades";
import { PASSIVE_CORE_BONUS_PER_CORE } from "../../game/config/constants";

interface ResourceBarProps {
  player: Player;
  kps: Decimal;
}

export function ResourceBar({ player, kps }: ResourceBarProps) {
  const showCoreBonus = player.intelligenceCores.gt(0) && isCoreShopFullyPurchased(player.coreUpgrades);

  return (
    <div className="resource-grid">
      <div className="resource-col">
        <div className="resource-label">🧠 Wissen</div>
        <div className="resource-value">{formatKnowledge(player.knowledge)}</div>
      </div>
      <div className="resource-col">
        <div className="resource-label">⚡ Wissen/Sek.</div>
        <div className="resource-value">{formatKnowledge(kps)}</div>
      </div>
      <div className="resource-col">
        <div className="resource-label">🌟 Kerne</div>
        <div className="resource-value">
          {formatKnowledge(player.intelligenceCores)}
          {showCoreBonus && (
            <span className="resource-sub"> (+{formatPercent(PASSIVE_CORE_BONUS_PER_CORE)}/Kern)</span>
          )}
        </div>
      </div>
      <div className="resource-col">
        <div className="resource-label">🏆 Punkte</div>
        <div className="resource-value">{formatInt(player.achievementPoints)}</div>
      </div>
    </div>
  );
}
