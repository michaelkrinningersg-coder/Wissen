import { Decimal } from "../../game/decimal";
import { WISSENSQUELLEN_UPGRADES } from "../../game/config/constants";
import type { Player } from "../../game/types";
import { formatKnowledge } from "../../game/format";

interface WissensquellenUpgradesPanelProps {
  player: Player;
}

/** Automatisch freischaltende Upgrades für Wissensquellen (kein Kauf nötig,
 * schalten anhand von lifetimeKnowledge frei). Kompakte linke Sidebar: nur
 * Name + Schwelle, volle Beschreibung als Hover-Tooltip. Bisher ein Eintrag
 * definiert, weitere folgen später — diese Spalte ist bewusst dafür reserviert. */
export function WissensquellenUpgradesPanel({ player }: WissensquellenUpgradesPanelProps) {
  return (
    <div>
      <div className="section-title" style={{ marginTop: 0 }}>
        🛠️ WQ-Upgrades
      </div>
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
