import type { CardDef, CardState } from "../../game/types";
import { cardGearMultiplier } from "../../game/formulas";
import { BUILDINGS_BY_ID } from "../../game/config/buildings";
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
  const gear = owned ? cardGearMultiplier(copies, def.gearThresholds) : 1;
  const isClickCard = Boolean(BUILDINGS_BY_ID[def.linkedBuildingId]?.clickBonusPerUnit);
  const unit = isClickCard ? "Wissen/Klick" : "Wissen/Sek.";
  const totalBoost = def.baseBoostPercent * copies * gear;
  const totalCoreBonus = (def.corePerCardBonusPercent ?? 0) * copies * gear;

  const tooltip = owned
    ? [
        `${formatInt(copies)} Kopien`,
        `+${formatPercent(def.baseBoostPercent)} ${unit} pro Kopie${
          gear > 1 ? ` × Ausrüstung ${gear.toFixed(2)}` : ""
        } = +${formatPercent(totalBoost)} ${unit}`,
        def.corePerCardBonusPercent
          ? `+${formatPercent(def.corePerCardBonusPercent)} Bonus je Kern pro Kopie${
              gear > 1 ? ` × Ausrüstung ${gear.toFixed(2)}` : ""
            } = +${formatPercent(totalCoreBonus)} je Kern`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    : undefined;

  return (
    <div className={`card-tile${owned ? "" : " locked"}`} style={{ borderColor: rarityColor }} title={tooltip}>
      <div className="card-icon" aria-hidden="true">
        {owned ? def.icon : "❓"}
      </div>
      <div>{owned ? def.name : "???"}</div>
      <div style={{ color: rarityColor }}>{RARITY_LABEL[def.rarity]}</div>
      {owned && (
        <div className="text-dim">
          {formatInt(copies)}× · +{formatPercent(totalBoost)} {unit}
          {gear > 1 ? ` (Ausr. ×${gear.toFixed(2)})` : ""}
        </div>
      )}
      {owned && def.corePerCardBonusPercent ? (
        <div className="text-dim">+{formatPercent(totalCoreBonus)} je Kern</div>
      ) : null}
    </div>
  );
}
