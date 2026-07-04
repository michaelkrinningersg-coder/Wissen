import type { CardDef, CardState } from "../../game/types";
import { cardGearMultiplier } from "../../game/formulas";
import { formatInt, formatPercent } from "../../game/format";

interface CardTileProps {
  def: CardDef;
  state: CardState | undefined;
}

const RARITY_LABEL: Record<string, string> = {
  common: "Gewöhnlich",
  rare: "Selten",
  epic: "Episch",
  legendary: "Legendär",
};

export function CardTile({ def, state }: CardTileProps) {
  const copies = state?.copies ?? 0;
  const owned = copies > 0;
  const rarityColor = `var(--rarity-${def.rarity})`;
  const gear = owned ? cardGearMultiplier(copies) : 1;

  return (
    <div className={`card-tile${owned ? "" : " locked"}`} style={{ borderColor: rarityColor }}>
      <div className="card-icon" aria-hidden="true">
        {owned ? def.icon : "❓"}
      </div>
      <div>{owned ? def.name : "???"}</div>
      <div style={{ color: rarityColor }}>{RARITY_LABEL[def.rarity]}</div>
      {owned && (
        <div className="text-dim">
          {formatInt(copies)}× · +{formatPercent(def.baseBoostPercent * copies * gear)}
          {gear > 1 ? ` (Ausr. ×${gear.toFixed(2)})` : ""}
        </div>
      )}
    </div>
  );
}
