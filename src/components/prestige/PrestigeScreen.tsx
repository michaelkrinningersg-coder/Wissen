import { useState } from "react";
import type { Player } from "../../game/types";
import * as formulas from "../../game/formulas";
import { formatDuration, formatKnowledge, formatPercent } from "../../game/format";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { ProgressBar } from "../common/ProgressBar";
import { CoreShopTree } from "./CoreShopTree";

const EPOCH_NAMES: Record<number, string> = {
  1: "Antike",
  2: "Industrielle Erkenntnis",
  3: "Digitale Intelligenz",
  4: "Singularität",
  5: "Kosmisches Bewusstsein",
};

interface PrestigeScreenProps {
  player: Player;
  onPrestige: () => void;
  onPurchaseUpgrade: (id: string) => void;
}

export function PrestigeScreen({ player, onPrestige, onPurchaseUpgrade }: PrestigeScreenProps) {
  const [confirming, setConfirming] = useState(false);
  const currentEpoch = Math.min(player.epochenLevel + 1, 5);
  const nextEpoch = Math.min(player.epochenLevel + 2, 5);
  const cores = formulas.coresAwarded(player.knowledgeEarnedThisRun);
  const bonus = formulas.epochenBonus(player.epochenLevel);
  const nextBonus = formulas.epochenBonus(player.epochenLevel + 1);
  const elapsed = player.playtimeSeconds - player.currentEpochStartedAt;
  const isLoop = player.epochenLevel >= 5;

  const minKnowledge = formulas.prestigeMinKnowledge(player.epochenLevel);
  const eligible = formulas.canPrestige(player);
  const progress = player.knowledgeEarnedThisRun.div(minKnowledge).toNumber();
  const firstCoreThreshold = formulas.firstCoreKnowledgeThreshold();
  const hasFirstCore = player.totalCoresEarned.gt(0) || player.intelligenceCores.gt(0);

  return (
    <div>
      <div className="section-title">🔁 Epochen des Wissens</div>
      <div className="card">
        <div>
          Aktuelle Epoche: <strong>{currentEpoch} – {EPOCH_NAMES[currentEpoch]}</strong>
        </div>
        <div className="text-dim">
          EpochenLevel: {player.epochenLevel} · EpochenBonus ×{formatKnowledge(bonus)}
        </div>
        <div className="text-dim">Zeit in dieser Epoche: {formatDuration(elapsed)}</div>
        <div className="text-dim">
          Prestige-Bonus aus Kern-Upgrades: ×{formatKnowledge(formulas.prestigeBonus(player))}
        </div>
        <div className="text-dim">
          🌟 {hasFirstCore ? "Erster Kern erhalten bei" : "Erster Kern ab"}: {formatKnowledge(firstCoreThreshold)}{" "}
          generiertem Wissen · Bonus je ungenutztem Kern: +{formatPercent(formulas.passiveCoreBonusRate(player))} Wissen/Sek.
          (sobald Kern-Shop komplett ausgebaut ist)
        </div>
      </div>

      <div className="card" style={{ marginTop: "0.6rem" }}>
        <div>
          {isLoop ? (
            <>
              Nächster Loop innerhalb <strong>Epoche 5 – Kosmisches Bewusstsein</strong>
            </>
          ) : (
            <>
              Nächste Epoche: <strong>{nextEpoch} – {EPOCH_NAMES[nextEpoch]}</strong>
            </>
          )}{" "}
          (Bonus ×{formatKnowledge(nextBonus)})
        </div>
        <div className="text-dim">Neue Kerne bei Reset: 🌟 {formatKnowledge(cores)}</div>

        <div style={{ marginTop: "0.5rem" }}>
          <div className="text-dim" style={{ marginBottom: "0.25rem" }}>
            Benötigtes Wissen für Prestige: {formatKnowledge(player.knowledgeEarnedThisRun)} /{" "}
            {formatKnowledge(minKnowledge)}
          </div>
          <ProgressBar fraction={progress} />
        </div>

        <button
          type="button"
          className="button-primary"
          style={{ marginTop: "0.5rem" }}
          disabled={!eligible}
          onClick={() => setConfirming(true)}
          title={eligible ? undefined : "Noch nicht genug Wissen in dieser Epoche generiert"}
        >
          Jetzt zurücksetzen (Prestige)
        </button>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Epoche zurücksetzen?"
          description={`Wissen und alle Gebäude werden auf 0 zurückgesetzt. Du erhältst 🌟 ${formatKnowledge(
            cores,
          )} neue Kerne, EpochenLevel steigt auf ${player.epochenLevel + 1}. Karten, Achievements und Kern-Upgrades bleiben erhalten.`}
          confirmLabel="Zurücksetzen"
          onConfirm={() => {
            setConfirming(false);
            onPrestige();
          }}
          onCancel={() => setConfirming(false)}
        />
      )}

      <div className="section-title">🌟 Kern-Shop</div>
      <CoreShopTree player={player} onPurchase={onPurchaseUpgrade} />
    </div>
  );
}
