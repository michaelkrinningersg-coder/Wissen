import { BUILDINGS } from "../../game/config/buildings";
import type { Player } from "../../game/types";
import { BuildingRow } from "./BuildingRow";

interface BuildingListProps {
  player: Player;
  onBuy: (id: string) => void;
}

// Alle Wissensquellen aus allen Epochen sind von Anfang an sichtbar/kaufbar
// und werden als EINE durchgehende Liste (nach Kosten aufsteigend, ohne
// Epochen-Trenner) dargestellt — die Freischaltung passiert wirtschaftlich
// über die Preiskurve, nicht mehr über eine UI-Sperre je Epoche.
export function BuildingList({ player, onBuy }: BuildingListProps) {
  return (
    <div className="building-list">
      {BUILDINGS.map((def) => (
        <BuildingRow key={def.id} def={def} player={player} onBuy={onBuy} />
      ))}
    </div>
  );
}
