import { useState } from "react";
import type { Player } from "../../game/types";
import type { BuyAmount } from "../../game/state/store";
import * as formulas from "../../game/formulas";
import { ACHIEVEMENTS_BY_ID } from "../../game/config/achievements";
import { formatKnowledge } from "../../game/format";
import { ClickButton } from "./ClickButton";
import { BuyAmountControl } from "./BuyAmountControl";
import { BuildingList } from "./BuildingList";
import { ComboBuildingsPanel } from "./ComboBuildingsPanel";
import { EpochPanel } from "./EpochPanel";
import { WissensquellenUpgradesPanel } from "./WissensquellenUpgradesPanel";

interface MainScreenProps {
  player: Player;
  onClick: () => void;
  onBuy: (id: string, amount: BuyAmount) => void;
  onUnlockCombo: (id: string) => void;
  onPrestige: () => void;
}

// Desktop-Layout, volle Bildschirmbreite: links Epochen-/Prestige-Panel,
// mittig der Klick-Button, rechts die Wissensquellen als durchgehende Liste,
// ganz rechts reservierte Spalte für (später weiter definierte)
// Wissensquellen-Upgrades.
export function MainScreen({ player, onClick, onBuy, onUnlockCombo, onPrestige }: MainScreenProps) {
  const [buyAmount, setBuyAmount] = useState<BuyAmount>(1);
  const kps = formulas.knowledgePerSecond(player, ACHIEVEMENTS_BY_ID);
  const clickValue = formulas.clickValue(player, kps);
  const buyXUnlocked = player.coreUpgrades.includes("core_automation_buyx");

  return (
    <div className="main-layout">
      <div className="main-col main-col-epoch">
        <EpochPanel player={player} onPrestige={onPrestige} />
      </div>

      <div className="main-col main-col-click">
        <ClickButton onClick={onClick} clickValueLabel={formatKnowledge(clickValue)} />
        <ComboBuildingsPanel player={player} onUnlock={onUnlockCombo} />
      </div>

      <div className="main-col main-col-buildings">
        <div className="section-title" style={{ marginTop: 0 }}>
          🏗️ Wissensquellen
        </div>
        <BuyAmountControl value={buyAmount} onChange={setBuyAmount} unlocked={buyXUnlocked} />
        <BuildingList player={player} buyAmount={buyAmount} onBuy={(id) => onBuy(id, buyAmount)} />
      </div>

      <div className="main-col main-col-upgrades">
        <WissensquellenUpgradesPanel player={player} />
      </div>
    </div>
  );
}
