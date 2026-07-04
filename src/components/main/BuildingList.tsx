import { Fragment } from "react";
import { buildingsForEpoch } from "../../game/config/buildings";
import { MAX_EPOCH_TIER } from "../../game/config/constants";
import type { Player } from "../../game/types";
import type { BuyAmount } from "../../game/state/store";
import { BuildingRow } from "./BuildingRow";

const EPOCH_NAMES: Record<number, string> = {
  1: "🟤 Antike",
  2: "🟡 Industrielle Erkenntnis",
  3: "🔵 Digitale Intelligenz",
  4: "🟣 Singularität",
  5: "⚫ Kosmisches Bewusstsein",
};

interface BuildingListProps {
  player: Player;
  buyAmount: BuyAmount;
  onBuy: (id: string) => void;
}

// Alle Wissensquellen aus allen Epochen sind von Anfang an sichtbar/kaufbar —
// die Freischaltung passiert wirtschaftlich über die Preiskurve, nicht mehr
// über eine UI-Sperre je Epoche.
export function BuildingList({ player, buyAmount, onBuy }: BuildingListProps) {
  const epochs = Array.from({ length: MAX_EPOCH_TIER }, (_, i) => i + 1);

  return (
    <div className="building-list">
      {epochs.map((epoch) => (
        <Fragment key={epoch}>
          <div className="epoch-divider">{EPOCH_NAMES[epoch]}</div>
          {buildingsForEpoch(epoch).map((def) => (
            <BuildingRow key={def.id} def={def} player={player} buyAmount={buyAmount} onBuy={onBuy} />
          ))}
        </Fragment>
      ))}
    </div>
  );
}
