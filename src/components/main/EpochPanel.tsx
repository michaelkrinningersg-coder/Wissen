import { useState } from "react";
import type { Player } from "../../game/types";
import * as formulas from "../../game/formulas";
import { formatKnowledge } from "../../game/format";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { ProgressBar } from "../common/ProgressBar";

const EPOCH_NAMES: Record<number, string> = {
  1: "Antike",
  2: "Industrielle Erkenntnis",
  3: "Digitale Intelligenz",
  4: "Singularität",
  5: "Kosmisches Bewusstsein",
};

interface EpochPanelProps {
  player: Player;
  onPrestige: () => void;
  onMiniPrestige: () => void;
}

/** Kompaktes Epochen-/Prestige-Panel für die linke Spalte des Hauptbildschirms
 * (Details + Kern-Shop bleiben im "Epochen"-Tab). */
export function EpochPanel({ player, onPrestige, onMiniPrestige }: EpochPanelProps) {
  const [confirming, setConfirming] = useState(false);
  const [confirmingMini, setConfirmingMini] = useState(false);
  const currentEpoch = Math.min(player.epochenLevel + 1, 5);
  const bonus = formulas.epochenBonus(player.epochenLevel);
  const cores = formulas.coresAwarded(player.knowledgeEarnedThisRun);
  const minKnowledge = formulas.prestigeMinKnowledge(player.epochenLevel);
  const eligible = formulas.canPrestige(player);
  const miniEligible = formulas.canMiniPrestige(player);
  const progress = player.knowledgeEarnedThisRun.div(minKnowledge).toNumber();

  return (
    <div className="card epoch-panel">
      <div className="section-title" style={{ marginTop: 0 }}>
        🔁 Epoche {currentEpoch}
      </div>
      <div>
        <strong>{EPOCH_NAMES[currentEpoch]}</strong>
      </div>
      <div className="text-dim">EpochenBonus ×{formatKnowledge(bonus)}</div>

      <div className="text-dim" style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
        {formatKnowledge(player.knowledgeEarnedThisRun)} / {formatKnowledge(minKnowledge)} Wissen
      </div>
      <ProgressBar fraction={progress} />

      <button
        type="button"
        className="button-primary"
        style={{ marginTop: "0.6rem", width: "100%" }}
        disabled={!eligible}
        onClick={() => setConfirming(true)}
        title={eligible ? undefined : "Noch nicht genug Wissen in dieser Epoche generiert"}
      >
        Prestige {eligible ? `(🌟 +${formatKnowledge(cores)})` : ""}
      </button>

      <button
        type="button"
        className="button-secondary"
        style={{ marginTop: "0.4rem", width: "100%" }}
        disabled={!miniEligible}
        onClick={() => setConfirmingMini(true)}
        title={
          miniEligible
            ? "Setzt Wissen, Gebäude und den Fortschritt zur nächsten Epoche zurück, EpochenLevel bleibt erhalten"
            : `Ab ${formatKnowledge(formulas.firstCoreKnowledgeThreshold())} Wissen in dieser Epoche verfügbar`
        }
      >
        🌟 Kern-Prestige {miniEligible ? `(+${formatKnowledge(cores)})` : ""}
      </button>

      {confirming && (
        <ConfirmDialog
          title="Epoche zurücksetzen?"
          description={`Wissen und alle Gebäude werden auf 0 zurückgesetzt. Du erhältst 🌟 ${formatKnowledge(
            cores,
          )} neue Kerne. Karten, Achievements und Kern-Upgrades bleiben erhalten.`}
          confirmLabel="Zurücksetzen"
          onConfirm={() => {
            setConfirming(false);
            onPrestige();
          }}
          onCancel={() => setConfirming(false)}
        />
      )}

      {confirmingMini && (
        <ConfirmDialog
          title="Kern-Prestige durchführen?"
          description={`Wissen und alle Gebäude der aktuellen Epoche werden auf 0 zurückgesetzt (das setzt auch den Fortschritt zur nächsten Epoche zurück). Du erhältst sofort 🌟 ${formatKnowledge(
            cores,
          )} neue Kerne. EpochenLevel, Karten, Achievements und Kern-Upgrades bleiben erhalten.`}
          confirmLabel="Zurücksetzen"
          onConfirm={() => {
            setConfirmingMini(false);
            onMiniPrestige();
          }}
          onCancel={() => setConfirmingMini(false)}
        />
      )}
    </div>
  );
}
