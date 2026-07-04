import type { Player } from "../../game/types";

interface CardSpawnOverlayProps {
  player: Player;
  onCollect: () => void;
}

/** Cookie-Clicker-artiger Zufalls-Spawn (Abschnitt 13): kurz sichtbar, gibt
 * beim Anklicken sofort einen Buff + Chance auf eine permanente Karte. */
export function CardSpawnOverlay({ player, onCollect }: CardSpawnOverlayProps) {
  const spawn = player.activeCardSpawn;
  if (!spawn) return null;
  return (
    <button
      type="button"
      className="card-spawn-overlay"
      style={{ left: `${spawn.x}%`, top: `${spawn.y}%` }}
      onClick={onCollect}
      aria-label="Erschienenen Gelehrten einsammeln"
      title="Ein Gelehrter ist erschienen! Anklicken für einen Bonus."
    >
      📜
    </button>
  );
}
