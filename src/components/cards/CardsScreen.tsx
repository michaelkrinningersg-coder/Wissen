import { CARDS, CARD_ERAS, cardsForEra } from "../../game/config/cards";
import type { Player } from "../../game/types";
import { CardTile } from "./CardTile";

interface CardsScreenProps {
  player: Player;
}

export function CardsScreen({ player }: CardsScreenProps) {
  const uniqueOwned = Object.values(player.cards).filter((c) => c.copies > 0).length;

  return (
    <div>
      <div className="section-title">
        🃏 Gelehrte der Geschichte ({uniqueOwned}/{CARDS.length})
      </div>
      {CARD_ERAS.map((era) => (
        <div key={era} className="card-era-group">
          <div className="epoch-divider">{era}</div>
          <div className="card-tile-grid">
            {cardsForEra(era).map((def) => (
              <CardTile key={def.id} def={def} state={player.cards[def.id]} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
