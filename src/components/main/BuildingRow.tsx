import type { BuildingDef, Player } from "../../game/types";
import { formatInt, formatKnowledge, formatPercent, formatWissenProSekunde } from "../../game/format";
import * as formulas from "../../game/formulas";

interface BuildingRowProps {
  def: BuildingDef;
  player: Player;
  onBuy: (id: string) => void;
}

export function BuildingRow({ def, player, onBuy }: BuildingRowProps) {
  const owned = player.buildings[def.id]?.owned ?? 0;
  const cost = formulas.buildingCost(def.baseCost, owned);
  const canAfford = player.knowledge.gte(cost);
  const isClickBuilding = Boolean(def.clickBonusPerUnit);

  const contribution = isClickBuilding
    ? (def.clickBonusPerUnit ?? formulas.buildingProduction(def.id, player))
        .times(owned)
        .times(formulas.buildingLocalMultiplier(def.id, player))
        .times(formulas.buildingMilestoneMultiplier(owned))
    : formulas.buildingProduction(def.id, player);
  const total = isClickBuilding
    ? formulas.baseClickValue(player)
    : formulas.totalBaseProduction(player);
  const share = total.gt(0) ? contribution.div(total).toNumber() : 0;

  const tooltip = isClickBuilding
    ? `+${formatWissenProSekunde(contribution)} Wissen/Klick (${formatPercent(share)} des gesamten Wissen/Klick)`
    : `${formatWissenProSekunde(contribution)} Wissen/Sek. (${formatPercent(share)} des gesamten Wissen/Sekunde)`;

  return (
    <button
      type="button"
      className={`building-row${def.imageUrl ? " has-image" : ""}`}
      style={def.imageUrl ? { backgroundImage: `url(${def.imageUrl})` } : undefined}
      disabled={!canAfford}
      onClick={() => onBuy(def.id)}
      title={tooltip}
    >
      {!def.imageUrl && (
        <span className="icon" aria-hidden="true">
          {def.icon}
        </span>
      )}
      {!def.imageUrl && <span className="info">{def.name}</span>}
      <span className="building-row-overlay">
        <span className="building-row-count">{formatInt(owned)}</span>
        <span className="building-row-cost">{formatKnowledge(cost)}</span>
      </span>
    </button>
  );
}
