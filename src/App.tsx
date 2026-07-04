import { useEffect, useState } from "react";
import { useGameStore } from "./game/state/store";
import { useGameSnapshot } from "./hooks/useGameSnapshot";
import { startGameLoop, stopGameLoop } from "./game/engine/loop";
import { loadFromLocalStorage, saveToLocalStorage } from "./game/persistence/save";
import { applyOfflineProgress } from "./game/engine/offlineProgress";
import { formatDuration, formatKnowledge } from "./game/format";
import { AUTOSAVE_INTERVAL_MS } from "./game/config/constants";
import type { Tab } from "./components/layout/TabNav";
import { TabNav } from "./components/layout/TabNav";
import { ResourceBar } from "./components/layout/ResourceBar";
import { MainScreen } from "./components/main/MainScreen";
import { PrestigeScreen } from "./components/prestige/PrestigeScreen";
import { CardsScreen } from "./components/cards/CardsScreen";
import { AchievementsScreen } from "./components/achievements/AchievementsScreen";
import { StatsScreen } from "./components/stats/StatsScreen";
import { EventBanner } from "./components/events/EventBanner";
import { CardDropToast } from "./components/cards/CardDropToast";
import * as formulas from "./game/formulas";
import { ACHIEVEMENTS_BY_ID } from "./game/config/achievements";

let bootstrapped = false;

function App() {
  const [tab, setTab] = useState<Tab>("main");
  const [offlineInfo, setOfflineInfo] = useState<{ seconds: number; gain: string } | null>(null);
  const { player, refresh } = useGameSnapshot();
  const actions = useGameStore((s) => s.actions);

  useEffect(() => {
    // Der Save-Load + Offline-Progress darf nur EIN einziges Mal pro
    // Sitzung passieren. Der Rest (Loop/Autosave/Listener) muss dagegen bei
    // JEDEM Mount neu aufgebaut werden, weil React (StrictMode im Dev-Server)
    // Effects doppelt ausführt: mount → cleanup → mount. Würde man das per
    // `bootstrapped`-Flag komplett überspringen, bliebe die Tick-Engine nach
    // dem ersten Cleanup dauerhaft gestoppt (Wissen/Sek. wird zwar weiter
    // angezeigt, da rein aus dem Gebäude-Bestand berechnet, zählt aber nie
    // mehr hoch).
    if (!bootstrapped) {
      bootstrapped = true;
      const loaded = loadFromLocalStorage();
      if (loaded) {
        const { player: withOffline, offlineSeconds, offlineGain } = applyOfflineProgress(loaded, Date.now());
        actions.replacePlayer(withOffline);
        if (offlineSeconds >= 60) {
          setOfflineInfo({ seconds: offlineSeconds, gain: formatKnowledge(offlineGain) });
        }
      }
    }

    startGameLoop();
    refresh();

    const autosave = setInterval(() => {
      saveToLocalStorage(useGameStore.getState().player);
    }, AUTOSAVE_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        saveToLocalStorage(useGameStore.getState().player);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleVisibility);

    return () => {
      clearInterval(autosave);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleVisibility);
      stopGameLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kps = formulas.knowledgePerSecond(player, ACHIEVEMENTS_BY_ID);

  const withRefresh = (fn: () => void) => {
    fn();
    refresh();
  };

  const epoch = formulas.currentEpochNumber(player.epochenLevel);

  return (
    <div className="app" data-epoch={epoch}>
      <header className="app-header">
        <EventBanner player={player} />
        <ResourceBar player={player} kps={kps} />
      </header>

      <main className="app-content">
        {tab === "main" && (
          <MainScreen
            player={player}
            onClick={() => withRefresh(actions.click)}
            onBuy={(id) => withRefresh(() => actions.buyBuilding(id, 1))}
            onUnlockCombo={(id) => withRefresh(() => actions.unlockComboBuilding(id))}
            onPrestige={() => withRefresh(actions.prestige)}
          />
        )}
        {tab === "prestige" && (
          <PrestigeScreen
            player={player}
            onPrestige={() => withRefresh(actions.prestige)}
            onPurchaseUpgrade={(id) => withRefresh(() => actions.purchaseCoreUpgrade(id))}
          />
        )}
        {tab === "cards" && <CardsScreen player={player} />}
        {tab === "achievements" && <AchievementsScreen player={player} />}
        {tab === "stats" && (
          <StatsScreen
            player={player}
            onImport={(imported) => withRefresh(() => actions.replacePlayer(imported))}
            onResetGame={() => withRefresh(actions.resetGame)}
          />
        )}
      </main>

      <CardDropToast player={player} />

      <TabNav active={tab} onChange={setTab} />

      {offlineInfo && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-box">
            <h3>Willkommen zurück!</h3>
            <p>
              Du warst {formatDuration(offlineInfo.seconds)} offline und hast in dieser Zeit{" "}
              <strong>{offlineInfo.gain} Wissen</strong> gesammelt.
            </p>
            <div className="modal-actions">
              <button type="button" className="button-primary" onClick={() => setOfflineInfo(null)}>
                Weiterspielen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
