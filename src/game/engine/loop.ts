import { useGameStore } from "../state/store";
import { TICK_INTERVAL_MS } from "../config/constants";

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let lastTickTime = 0;

/**
 * 20-Hz-Tick-Engine, entkoppelt vom React-Render-Takt (siehe Plan Abschnitt
 * "Game-Loop-Entkopplung"). Nutzt reales Zeitdelta statt fixem dt, damit im
 * Hintergrund gedrosselte Tabs keine Produktion verlieren, sondern sie beim
 * nächsten Tick nachholen.
 */
export function startGameLoop(): void {
  if (intervalHandle !== null) return;
  lastTickTime = Date.now();
  intervalHandle = setInterval(() => {
    const now = Date.now();
    const dtSeconds = Math.max(0, (now - lastTickTime) / 1000);
    lastTickTime = now;
    if (dtSeconds > 0) {
      useGameStore.getState().actions.tick(dtSeconds);
    }
  }, TICK_INTERVAL_MS);
}

export function stopGameLoop(): void {
  if (intervalHandle !== null) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}
