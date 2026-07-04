import { CORE_UPGRADES, CORE_UPGRADES_BY_ID, isCoreUpgradeAvailable } from "../../game/config/coreUpgrades";
import type { Player } from "../../game/types";
import { formatKnowledge } from "../../game/format";

interface CoreShopTreeProps {
  player: Player;
  onPurchase: (id: string) => void;
}

export function CoreShopTree({ player, onPurchase }: CoreShopTreeProps) {
  return (
    <div className="core-upgrade-grid">
      {CORE_UPGRADES.map((u) => {
        const purchased = player.coreUpgrades.includes(u.id);
        const available = isCoreUpgradeAvailable(u.id, player.coreUpgrades);
        const canAfford = player.intelligenceCores.gte(u.cost);
        const missing = u.requires?.filter((r) => !player.coreUpgrades.includes(r)) ?? [];
        return (
          <button
            key={u.id}
            type="button"
            className={`core-upgrade-tile${purchased ? " purchased" : ""}`}
            disabled={purchased || !available || !canAfford}
            onClick={() => onPurchase(u.id)}
          >
            <div style={{ fontSize: "1.4rem" }}>{u.icon}</div>
            <strong>{u.name}</strong>
            <span className="text-dim">{u.description}</span>
            {purchased ? (
              <span className="text-good">✓ gekauft</span>
            ) : (
              <span>🌟 {formatKnowledge(u.cost)}</span>
            )}
            {!purchased && missing.length > 0 && (
              <span className="text-dim" style={{ fontSize: "0.68rem" }}>
                Benötigt: {missing.map((id) => CORE_UPGRADES_BY_ID[id]?.name).join(", ")}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
