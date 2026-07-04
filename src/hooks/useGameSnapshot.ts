import { useCallback, useEffect, useState } from "react";
import { useGameStore } from "../game/state/store";
import type { Player } from "../game/types";
import { RENDER_THROTTLE_MS } from "../game/config/constants";

/**
 * Gedrosselter Read-Hook für React (~200ms), statt Live-Subscription auf
 * Hot-Path-Felder (verhindert 20-Hz-Re-Renders, siehe Plan). `refresh()`
 * erlaubt Komponenten, nach einer Spieleraktion (Klick/Kauf/Prestige) sofort
 * zu aktualisieren statt bis zum nächsten Poll zu warten.
 */
export function useGameSnapshot(): { player: Player; refresh: () => void } {
  const [player, setPlayer] = useState<Player>(() => useGameStore.getState().player);

  useEffect(() => {
    const id = setInterval(() => {
      setPlayer(useGameStore.getState().player);
    }, RENDER_THROTTLE_MS);
    return () => clearInterval(id);
  }, []);

  const refresh = useCallback(() => {
    setPlayer(useGameStore.getState().player);
  }, []);

  return { player, refresh };
}
