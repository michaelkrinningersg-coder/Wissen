import { COMBO_BUILDINGS } from "../../game/config/comboBuildings";
import { BUILDINGS_BY_ID } from "../../game/config/buildings";
import type { Player } from "../../game/types";
import { formatInt, formatKnowledge, formatPercent } from "../../game/format";

interface ComboBuildingsPanelProps {
  player: Player;
  onUnlock: (id: string) => void;
}

/** Cross-Epochen-Kombos (Abschnitt 11): erst anzeigen, wenn ein Elternbau
 * mindestens halb so weit wie die Schwelle ist, um die Liste nicht sofort mit
 * unerreichbaren Inhalten zu überladen. */
export function ComboBuildingsPanel({ player, onUnlock }: ComboBuildingsPanelProps) {
  const relevant = COMBO_BUILDINGS.filter((c) => {
    if (player.comboBuildingsOwned.includes(c.id)) return true;
    const ownedA = player.buildings[c.parentA]?.owned ?? 0;
    const ownedB = player.buildings[c.parentB]?.owned ?? 0;
    return ownedA >= c.threshold * 0.5 || ownedB >= c.threshold * 0.5;
  });
  if (relevant.length === 0) return null;

  return (
    <div>
      <div className="section-title">🌌 Cross-Epochen-Kombos</div>
      <div className="building-list">
        {relevant.map((c) => {
          const ownedA = player.buildings[c.parentA]?.owned ?? 0;
          const ownedB = player.buildings[c.parentB]?.owned ?? 0;
          const unlocked = player.comboBuildingsOwned.includes(c.id);
          const canUnlock =
            !unlocked && ownedA >= c.threshold && ownedB >= c.threshold && player.knowledge.gte(c.unlockCost);
          const defA = BUILDINGS_BY_ID[c.parentA];
          const defB = BUILDINGS_BY_ID[c.parentB];
          return (
            <button
              key={c.id}
              type="button"
              className="building-row"
              disabled={unlocked || !canUnlock}
              onClick={() => onUnlock(c.id)}
              title={c.flavor}
            >
              <span className="icon" aria-hidden="true">
                {c.icon}
              </span>
              <span className="info">
                <span className="name-row">
                  <span>{c.name}</span>
                  {unlocked && <span className="bonus-badge">aktiv +{formatPercent(c.boostPercent)}</span>}
                </span>
                <span className="sub-row">
                  <span>
                    {defA?.icon} {formatInt(ownedA)}/{c.threshold}
                  </span>
                  <span>
                    {defB?.icon} {formatInt(ownedB)}/{c.threshold}
                  </span>
                </span>
              </span>
              <span className="cost-col">
                <div>{unlocked ? "✓" : formatKnowledge(c.unlockCost)}</div>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
