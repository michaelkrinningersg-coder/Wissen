import type { ReactNode } from "react";
import { Decimal } from "../../game/decimal";
import type { Player, Rarity } from "../../game/types";
import { BUILDINGS } from "../../game/config/buildings";
import { CARDS } from "../../game/config/cards";
import { ACHIEVEMENTS, ACHIEVEMENTS_BY_ID } from "../../game/config/achievements";
import * as formulas from "../../game/formulas";
import { formatDuration, formatInt, formatKnowledge } from "../../game/format";
import { KpsHistoryChart } from "./KpsHistoryChart";
import { SaveManagementPanel } from "./SaveManagementPanel";

const EPOCH_NAMES: Record<number, string> = {
  1: "Antike",
  2: "Industrielle Erkenntnis",
  3: "Digitale Intelligenz",
  4: "Singularität",
  5: "Kosmisches Bewusstsein",
};

const RARITY_RANK: Record<Rarity, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };

function StatTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="stat-tile">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}

interface StatsScreenProps {
  player: Player;
  onImport: (player: Player) => void;
  onResetGame: () => void;
}

export function StatsScreen({ player, onImport, onResetGame }: StatsScreenProps) {
  const kps = formulas.knowledgePerSecond(player, ACHIEVEMENTS_BY_ID);
  const now = player.playtimeSeconds;
  const lastHourPoints = player.kpsHistory.filter((p) => now - p.t <= 3600);
  const avgKpsLastHour =
    lastHourPoints.length > 0 ? lastHourPoints.reduce((sum, p) => sum + p.kps, 0) / lastHourPoints.length : kps.toNumber();

  const totalBuildingsOwned = BUILDINGS.reduce((sum, b) => sum + (player.buildings[b.id]?.owned ?? 0), 0);
  const totalBuildingsBought = Object.values(player.buildingTotalBought).reduce((sum, n) => sum + n, 0);
  const bestSingleType = Math.max(0, ...Object.values(player.buildingAllTimeHigh));

  const uniqueCards = Object.values(player.cards).filter((c) => c.copies > 0).length;
  const totalCardCopies = Object.values(player.cards).reduce((sum, c) => sum + c.copies, 0);
  const rarestOwned = CARDS.filter((c) => (player.cards[c.id]?.copies ?? 0) > 0).sort(
    (a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity],
  )[0];

  return (
    <div>
      <div className="section-title">📊 Statistik</div>

      <div className="stat-grid">
        <StatTile label="Lifetime-Wissen" value={formatKnowledge(player.lifetimeKnowledge)} />
        <StatTile label="Aktuell Wissen/Sek." value={formatKnowledge(kps)} />
        <StatTile label="Höchste Wissen/Sek. je erreicht" value={formatKnowledge(new Decimal(player.peakKps))} />
        <StatTile label="Ø Wissen/Sek. (letzte Std.)" value={formatKnowledge(new Decimal(avgKpsLastHour))} />
        <StatTile label="Klicks gesamt" value={formatInt(player.totalClicks)} />
        <StatTile label="Höchste Klicks/Sek." value={player.peakClicksPerSecond.toFixed(1)} />
        <StatTile label="Spielzeit gesamt" value={formatDuration(player.playtimeSeconds)} />
        <StatTile label="Prestiges gesamt" value={formatInt(player.prestigeCount)} />
      </div>

      <div className="section-title">⏱️ Spielzeit pro Epoche</div>
      <div className="stat-grid">
        {[1, 2, 3, 4, 5].map((epoch) => (
          <StatTile
            key={epoch}
            label={EPOCH_NAMES[epoch]}
            value={formatDuration(player.playtimeByEpoch[epoch] ?? 0)}
          />
        ))}
      </div>

      <div className="section-title">🏁 Schnellste Zeit pro Epoche</div>
      <div className="stat-grid">
        {[1, 2, 3, 4, 5].map((epoch) => (
          <StatTile
            key={epoch}
            label={epoch === 5 ? `${EPOCH_NAMES[5]} (Loop)` : EPOCH_NAMES[epoch]}
            value={
              player.epochCompletionTimes[epoch] !== undefined
                ? formatDuration(player.epochCompletionTimes[epoch])
                : "—"
            }
          />
        ))}
      </div>
      <div className="text-dim">Epoche-5-Loops abgeschlossen: {formatInt(player.epoch5LoopCount)}</div>

      <div className="section-title">🏗️ Gebäude</div>
      <div className="stat-grid">
        <StatTile label="Aktuell insgesamt besessen" value={formatInt(totalBuildingsOwned)} />
        <StatTile label="Insgesamt je gekauft" value={formatInt(totalBuildingsBought)} />
        <StatTile label="Höchste Anzahl eines Typs" value={formatInt(bestSingleType)} />
        <StatTile label="Verschiedene Typen (aktuell)" value={`${BUILDINGS.filter((b) => (player.buildings[b.id]?.owned ?? 0) > 0).length}/${BUILDINGS.length}`} />
      </div>

      <div className="section-title">🌟 Kerne</div>
      <div className="stat-grid">
        <StatTile label="Aktuelles Guthaben" value={formatKnowledge(player.intelligenceCores)} />
        <StatTile label="Insgesamt verdient" value={formatKnowledge(player.totalCoresEarned)} />
        <StatTile label="Kern-Upgrades gekauft" value={formatInt(player.coreUpgrades.length)} />
        <StatTile label="Passiver Bonus (Shop voll)" value={`+${(player.passiveCoreBonusPercent * 100).toFixed(1)}% WPS`} />
      </div>

      <div className="section-title">🃏 Karten</div>
      <div className="stat-grid">
        <StatTile label="Einzigartige Karten" value={`${uniqueCards}/${CARDS.length}`} />
        <StatTile label="Kopien gesamt" value={formatInt(totalCardCopies)} />
        <StatTile label="Seltenste besessene Karte" value={rarestOwned ? `${rarestOwned.icon} ${rarestOwned.name}` : "—"} />
      </div>

      <div className="section-title">🏆 Achievements</div>
      <div className="stat-grid">
        <StatTile
          label="Fortschritt gesamt"
          value={`${player.achievements.length}/${ACHIEVEMENTS.length} (${Math.round(
            (player.achievements.length / ACHIEVEMENTS.length) * 100,
          )}%)`}
        />
        <StatTile label="Achievement-Punkte" value={formatInt(player.achievementPoints)} />
      </div>

      <div className="section-title">📈 Verlauf Wissen/Sek.</div>
      <KpsHistoryChart points={player.kpsHistory} />

      <SaveManagementPanel player={player} onImport={onImport} onResetGame={onResetGame} />
    </div>
  );
}
