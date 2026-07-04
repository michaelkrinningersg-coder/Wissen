import { CARDS_BY_ID } from "../../game/config/cards";
import { CARD_DROP_TOAST_DURATION_S } from "../../game/config/constants";
import type { Player } from "../../game/types";

interface CardDropToastProps {
  player: Player;
}

/** Kurze Erfolgsmeldung, wenn ein Klick auf den Wissen-Button eine Karte
 * droppt (Abschnitt 13, überarbeitet: kein separater Spawn mehr, die
 * Dropchance wird direkt bei jedem Klick geprüft). */
export function CardDropToast({ player }: CardDropToastProps) {
  const drop = player.lastCardDrop;
  if (!drop) return null;
  if (player.playtimeSeconds - drop.at > CARD_DROP_TOAST_DURATION_S) return null;
  const def = CARDS_BY_ID[drop.cardId];
  if (!def) return null;

  return (
    <div className="card-drop-toast" role="status">
      <span className="card-icon" aria-hidden="true">
        {def.icon}
      </span>
      <span>
        Karte gefunden: <strong>{def.name}</strong>!
      </span>
    </div>
  );
}
