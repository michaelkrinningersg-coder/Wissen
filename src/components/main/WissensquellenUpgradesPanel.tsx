import { Decimal } from "../../game/decimal";
import { HOEHLEN_CLICK_UPGRADES, WISSENSQUELLEN_UPGRADES } from "../../game/config/constants";
import type { Player } from "../../game/types";
import * as formulas from "../../game/formulas";
import { ACHIEVEMENTS_BY_ID } from "../../game/config/achievements";
import { formatKnowledge } from "../../game/format";

interface WissensquellenUpgradesPanelProps {
  player: Player;
  onPurchase: (id: string) => void;
}

/** WQ-Upgrades-Sidebar:
 *  1. Kaufbare Höhlenzeichnungen-Klick-Upgrades (×2 Wissen/Klick) — werden erst
 *     sichtbar, sobald das jemals gehaltene Wissen (peakKnowledge) 1/10 der
 *     Kosten erreicht hat, bleiben dann sichtbar. Kauf braucht zusätzlich die
 *     erfüllte Freischalt-Bedingung + genug Wissen.
 *  2. Automatisch freischaltende WQ-Upgrades (kein Kauf, an lifetimeKnowledge). */
export function WissensquellenUpgradesPanel({ player, onPurchase }: WissensquellenUpgradesPanelProps) {
  const kps = formulas.knowledgePerSecond(player, ACHIEVEMENTS_BY_ID);

  return (
    <div>
      <div className="section-title" style={{ marginTop: 0 }}>
        🛠️ WQ-Upgrades
      </div>

      {HOEHLEN_CLICK_UPGRADES.map((u) => {
        const cost = new Decimal(u.cost);
        // Sichtbarkeit ist sticky: sobald peakKnowledge einmal 1/10 der Kosten
        // erreicht hat, bleibt das Upgrade sichtbar (peakKnowledge ist monoton).
        const visible = player.peakKnowledge.gte(cost.div(10));
        if (!visible) return null;

        const purchased = player.purchasedWqUpgrades.includes(u.id);
        const unlocked = formulas.isHoehlenUpgradeUnlocked(u, player, kps);
        const canAfford = player.knowledge.gte(cost);
        const unlockHint =
          u.unlock.kind === "clickKnowledge"
            ? `Freischaltung: ${formatKnowledge(new Decimal(u.unlock.amount))} durch Klick generiertes Wissen`
            : `Freischaltung: ${formatKnowledge(new Decimal(u.unlock.amount))} Wissen/Klick`;

        return (
          <button
            type="button"
            key={u.id}
            className={`wq-upgrade-buy${purchased ? " purchased" : ""}`}
            disabled={purchased || !unlocked || !canAfford}
            onClick={() => onPurchase(u.id)}
            title={`${u.name}: ${u.description}\n${unlockHint}`}
          >
            <span className="wq-upgrade-name">
              {u.icon} {u.name}
            </span>
            <span className="text-dim wq-upgrade-cost">
              {purchased ? "✓ gekauft" : !unlocked ? "🔒" : `${formatKnowledge(cost)} Wissen`}
            </span>
          </button>
        );
      })}

      {WISSENSQUELLEN_UPGRADES.map((u) => {
        const threshold = new Decimal(u.unlockAtLifetimeKnowledge);
        const unlocked = player.lifetimeKnowledge.gte(threshold);
        return (
          <div
            key={u.id}
            className={`wq-upgrade-compact${unlocked ? " unlocked" : ""}`}
            title={`${u.name}: ${u.description}`}
          >
            <span className="wq-upgrade-name">
              {u.icon} {u.name}
            </span>
            <span className="text-dim wq-upgrade-cost">
              {unlocked ? "✓" : formatKnowledge(threshold)}
            </span>
          </div>
        );
      })}
      <div className="text-dim" style={{ fontSize: "0.68rem", marginTop: "0.5rem" }}>
        Weitere Wissensquellen-Upgrades folgen.
      </div>
    </div>
  );
}
