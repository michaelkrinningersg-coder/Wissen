import type { Decimal } from "../../game/decimal";
import type { Player } from "../../game/types";
import { formatInt, formatKnowledge } from "../../game/format";

interface ResourceBarProps {
  player: Player;
  kps: Decimal;
}

export function ResourceBar({ player, kps }: ResourceBarProps) {
  return (
    <div className="resource-bar">
      <div>
        <div className="knowledge">🧠 {formatKnowledge(player.knowledge)}</div>
        <div className="kps">{formatKnowledge(kps)} Wissen/Sek.</div>
      </div>
      <div className="text-dim">
        🌟 {formatKnowledge(player.intelligenceCores)} Kerne
      </div>
      <div className="text-dim">🏆 {formatInt(player.achievementPoints)} Punkte</div>
    </div>
  );
}
