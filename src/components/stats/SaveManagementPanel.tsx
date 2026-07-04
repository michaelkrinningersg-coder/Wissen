import { useState } from "react";
import type { Player } from "../../game/types";
import { exportSaveCode, importSaveCode } from "../../game/persistence/codec";
import { ConfirmDialog } from "../common/ConfirmDialog";

interface SaveManagementPanelProps {
  player: Player;
  onImport: (player: Player) => void;
  onResetGame: () => void;
}

export function SaveManagementPanel({ player, onImport, onResetGame }: SaveManagementPanelProps) {
  const [exportCode, setExportCode] = useState("");
  const [importText, setImportText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<Player | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleExport = () => {
    setExportCode(exportSaveCode(player));
    setError(null);
  };

  const handlePrepareImport = () => {
    try {
      const imported = importSaveCode(importText);
      setPendingImport(imported);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler beim Import.");
    }
  };

  return (
    <div className="card" style={{ marginTop: "0.75rem" }}>
      <div className="section-title" style={{ marginTop: 0 }}>
        💾 Spielstand
      </div>
      <button type="button" className="button-secondary" onClick={handleExport}>
        Speicherstand exportieren
      </button>
      {exportCode && (
        <textarea
          className="save-code"
          readOnly
          value={exportCode}
          onFocus={(e) => e.currentTarget.select()}
          style={{ marginTop: "0.5rem" }}
        />
      )}

      <div style={{ marginTop: "0.75rem" }}>
        <textarea
          className="save-code"
          placeholder="Save-Code hier einfügen…"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
        />
        <button
          type="button"
          className="button-secondary"
          style={{ marginTop: "0.4rem" }}
          onClick={handlePrepareImport}
        >
          Speicherstand importieren
        </button>
      </div>
      {error && <div className="text-bad">{error}</div>}

      {pendingImport && (
        <ConfirmDialog
          title="Spielstand überschreiben?"
          description="Der aktuelle Fortschritt wird durch den importierten Speicherstand ersetzt. Das kann nicht rückgängig gemacht werden."
          confirmLabel="Überschreiben"
          onConfirm={() => {
            onImport(pendingImport);
            setPendingImport(null);
          }}
          onCancel={() => setPendingImport(null)}
        />
      )}

      <div style={{ marginTop: "0.75rem" }}>
        <button type="button" className="button-secondary" onClick={() => setConfirmingReset(true)}>
          Spielstand vollständig löschen
        </button>
      </div>
      {confirmingReset && (
        <ConfirmDialog
          title="Wirklich alles löschen?"
          description="Der gesamte Fortschritt (Wissen, Gebäude, Karten, Achievements, Kerne) wird unwiderruflich gelöscht."
          confirmLabel="Löschen"
          onConfirm={() => {
            onResetGame();
            setConfirmingReset(false);
          }}
          onCancel={() => setConfirmingReset(false)}
        />
      )}
    </div>
  );
}
