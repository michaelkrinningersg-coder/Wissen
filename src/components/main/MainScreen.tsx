import type { Player } from "../../game/types";
import * as formulas from "../../game/formulas";
import { ACHIEVEMENTS_BY_ID } from "../../game/config/achievements";
import { formatKnowledge } from "../../game/format";
import { ClickButton } from "./ClickButton";
import { BuildingList } from "./BuildingList";
import { ComboBuildingsPanel } from "./ComboBuildingsPanel";
import { EpochPanel } from "./EpochPanel";
import { WissensquellenUpgradesPanel } from "./WissensquellenUpgradesPanel";

interface MainScreenProps {
  player: Player;
  onClick: () => void;
  onBuy: (id: string) => void;
  onUnlockCombo: (id: string) => void;
  onPrestige: () => void;
}

// Desktop-Layout, volle Bildschirmbreite: links kompakte Sidebar mit
// Wissensquellen-Upgrades, mittig (breit) der Klick-Button mit dem
// Epochen-/Prestige-Weg darunter, rechts die Wissensquellen als
// durchgehende Sidebar-Liste.
export function MainScreen({ player, onClick, onBuy, onUnlockCombo, onPrestige }: MainScreenProps) {
  const kps = formulas.knowledgePerSecond(player, ACHIEVEMENTS_BY_ID);
  const clickValue = formulas.clickValue(player, kps);

  return (
    <div className="main-layout">
      <div className="main-col main-col-upgrades">
        <WissensquellenUpgradesPanel player={player} />
      </div>

      <div className="main-col main-col-click">
        <ClickButton onClick={onClick} clickValueLabel={formatKnowledge(clickValue)} />
        <ComboBuildingsPanel player={player} onUnlock={onUnlockCombo} />
        <EpochPanel player={player} onPrestige={onPrestige} />
      </div>

      <div className="main-col main-col-buildings">
        <div className="section-title" style={{ marginTop: 0 }}>
          🏗️ Wissensquellen
        </div>
        <BuildingList player={player} onBuy={onBuy} />
      </div>
    </div>
  );
}
