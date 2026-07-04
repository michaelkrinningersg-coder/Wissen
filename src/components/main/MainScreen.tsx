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

interface MainScreenProps {
  player: Player;
  onClick: () => void;
  onBuy: (id: string, amount: BuyAmount) => void;
  onUnlockCombo: (id: string) => void;
}

export function MainScreen({ player, onClick, onBuy, onUnlockCombo }: MainScreenProps) {
  const [buyAmount, setBuyAmount] = useState<BuyAmount>(1);
  const kps = formulas.knowledgePerSecond(player, ACHIEVEMENTS_BY_ID);
  const clickValue = formulas.clickValue(player, kps);
  const buyXUnlocked = player.coreUpgrades.includes("core_automation_buyx");

  return (
    <div>
      <ClickButton onClick={onClick} clickValueLabel={formatKnowledge(clickValue)} />
      <ComboBuildingsPanel player={player} onUnlock={onUnlockCombo} />
      <div className="section-title">🏗️ Wissensquellen</div>
      <BuyAmountControl value={buyAmount} onChange={setBuyAmount} unlocked={buyXUnlocked} />
      <BuildingList player={player} buyAmount={buyAmount} onBuy={(id) => onBuy(id, buyAmount)} />
    </div>
  );
}
