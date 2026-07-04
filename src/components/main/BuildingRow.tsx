import type { BuildingDef, Player } from "../../game/types";
import { formatInt, formatKnowledge, formatPercent, formatWissenProSekunde } from "../../game/format";
import * as formulas from "../../game/formulas";
import type { BuyAmount } from "../../game/state/store";

interface BuildingRowProps {
  def: BuildingDef;
  player: Player;
  buyAmount: BuyAmount;
  onBuy: (id: string) => void;
}

export function BuildingRow({ def, player, buyAmount, onBuy }: BuildingRowProps) {
  const owned = player.buildings[def.id]?.owned ?? 0;
  const count =
    buyAmount === "max" ? formulas.maxAffordable(def.baseCost, owned, player.knowledge) : buyAmount;
  const cost = formulas.batchCost(def.baseCost, owned, Math.max(count, 1));
  const canAfford = count > 0 && player.knowledge.gte(cost);
  const production = formulas.buildingProduction(def.id, player);
  const localBonus = formulas.buildingLocalMultiplier(def.id, player) - 1;
  const clickBonusTotal = def.clickBonusPerUnit?.times(owned);

  return (
    <button type="button" className="building-row" disabled={!canAfford} onClick={() => onBuy(def.id)}>
      <span className="icon" aria-hidden="true">
        {def.icon}
      </span>
      <span className="info">
        <span className="name-row">
          <span>
            {def.name} ({formatInt(owned)})
          </span>
          {localBonus > 0.001 && <span className="bonus-badge">+{formatPercent(localBonus)}</span>}
        </span>
        <span className="sub-row">
          {clickBonusTotal ? (
            <span>+{formatWissenProSekunde(clickBonusTotal)} Wissen/Klick</span>
          ) : (
            <span>{formatWissenProSekunde(production)} Wissen/Sek.</span>
          )}
        </span>
      </span>
      <span className="cost-col">
        <div>{count > 0 ? formatKnowledge(cost) : "—"}</div>
        <div className="text-dim">{count > 0 ? `x${count}` : "n. verfügbar"}</div>
      </span>
    </button>
  );
}
