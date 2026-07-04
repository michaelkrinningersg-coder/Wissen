import { Decimal } from "../../game/decimal";
import { WISSENSQUELLEN_UPGRADES } from "../../game/config/constants";
import type { Player } from "../../game/types";
import { formatKnowledge } from "../../game/format";
import { ProgressBar } from "../common/ProgressBar";

interface WissensquellenUpgradesPanelProps {
  player: Player;
}

/** Automatisch freischaltende Upgrades für Wissensquellen (kein Kauf nötig,
 * schalten anhand von lifetimeKnowledge frei). Bisher ein Eintrag definiert,
 * weitere folgen später — diese Spalte ist bewusst dafür reserviert. */
export function WissensquellenUpgradesPanel({ player }: WissensquellenUpgradesPanelProps) {
  return (
    <div>
      <div className="section-title" style={{ marginTop: 0 }}>
        🛠️ Wissensquellen-Upgrades
      </div>
      {WISSENSQUELLEN_UPGRADES.map((u) => {
        const threshold = new Decimal(u.unlockAtLifetimeKnowledge);
        const unlocked = player.lifetimeKnowledge.gte(threshold);
        const progress = player.lifetimeKnowledge.div(threshold).toNumber();
        return (
          <div key={u.id} className={`core-upgrade-tile${unlocked ? " purchased" : ""}`} style={{ marginBottom: "0.5rem" }}>
            <div style={{ fontSize: "1.4rem" }}>{u.icon}</div>
            <strong>{u.name}</strong>
            <span className="text-dim">{u.description}</span>
            {unlocked ? (
              <span className="text-good">✓ freigeschaltet</span>
            ) : (
              <>
                <span className="text-dim">ab {formatKnowledge(threshold)} Lifetime-Wissen</span>
                <ProgressBar fraction={progress} />
              </>
            )}
          </div>
        );
      })}
      <div className="text-dim" style={{ fontSize: "0.72rem", marginTop: "0.5rem" }}>
        Weitere Wissensquellen-Upgrades folgen.
      </div>
    </div>
  );
}
