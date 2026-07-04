import { GAME_EVENTS_BY_ID } from "../../game/config/events";
import type { Player } from "../../game/types";

interface EventBannerProps {
  player: Player;
}

export function EventBanner({ player }: EventBannerProps) {
  if (player.activeEvents.length === 0) return null;
  return (
    <div className="event-banner">
      {player.activeEvents.map((active) => {
        const def = GAME_EVENTS_BY_ID[active.eventId];
        if (!def) return null;
        const remaining = Math.max(0, Math.round(active.expiresAt - player.playtimeSeconds));
        const isDebuff = def.kind === "crisis_debuff";
        return (
          <div key={active.eventId} className={`event-item${isDebuff ? " debuff" : ""}`}>
            <span aria-hidden="true">{def.icon}</span>
            <span>
              <strong>{def.name}</strong> – {def.description} ({remaining}s)
            </span>
          </div>
        );
      })}
    </div>
  );
}
