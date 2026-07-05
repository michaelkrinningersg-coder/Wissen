import { BUILDINGS } from "../../game/config/buildings";
import type { Player } from "../../game/types";
import { BuildingRow } from "./BuildingRow";

interface BuildingListProps {
  player: Player;
  onBuy: (id: string) => void;
}

// Eine durchgehende Liste (nach Kosten aufsteigend). Eine Wissensquelle wird
// erst sichtbar, sobald das jemals gehaltene Wissen (peakKnowledge) 1/100 ihres
// Grundpreises überschritten hat — danach bleibt sie sichtbar (peakKnowledge ist
// monoton, der Grundpreis fix). Bereits besessene Quellen sind immer sichtbar.
export function BuildingList({ player, onBuy }: BuildingListProps) {
  const visible = BUILDINGS.filter((def) => {
    const owned = player.buildings[def.id]?.owned ?? 0;
    return owned > 0 || player.peakKnowledge.gt(def.baseCost.div(100));
  });

  return (
    <div className="building-list">
      {visible.map((def) => (
        <BuildingRow key={def.id} def={def} player={player} onBuy={onBuy} />
      ))}
    </div>
  );
}
