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

  const perUnitBase = def.clickBonusPerUnit ?? def.baseProduction;
  const rawBase = perUnitBase.times(owned);
  const contribution = isClickBuilding
    ? rawBase
        .times(formulas.buildingLocalMultiplier(def.id, player))
        .times(formulas.buildingMilestoneMultiplier(owned))
    : formulas.buildingProduction(def.id, player);
  const total = isClickBuilding
    ? formulas.baseClickValue(player)
    : formulas.totalBaseProduction(player);
  const share = total.gt(0) ? contribution.div(total).toNumber() : 0;
  const scaling = formulas.buildingScalingBreakdown(def.id, player);
  const unit = isClickBuilding ? "Wissen/Klick" : "Wissen/Sek.";

  const tooltip = [
    isClickBuilding
      ? `+${formatWissenProSekunde(contribution)} Wissen/Klick (${formatPercent(share)} des gesamten Wissen/Klick)`
      : `${formatWissenProSekunde(contribution)} Wissen/Sek. (${formatPercent(share)} des gesamten Wissen/Sekunde)`,
    `Basisverdienst: ${formatWissenProSekunde(rawBase)} ${unit} (ohne Boni)`,
    `+${formatPercent(scaling.crossBonus)} durch Wissensquellen gesamt (${formatInt(scaling.ownedOthers)} andere Einheiten)`,
    `+${formatPercent(scaling.selfBonus)} durch Wissensquellen des gleichen Typs (${formatInt(scaling.ownedSelf)} Einheiten)`,
  ].join("\n");

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
