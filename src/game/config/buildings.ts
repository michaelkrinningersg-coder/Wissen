import { Decimal, ZERO } from "../decimal";
import type { BuildingDef } from "../types";
import {
  BUILDING_BASE_COST_START,
  BUILDING_PRODUCTION_TO_COST_RATIO,
  BUILDING_TIER_GROWTH,
  HOEHLENZEICHNUNGEN_CLICK_BONUS_PER_UNIT,
} from "./constants";

interface RawBuilding {
  id: string;
  name: string;
  icon: string;
  epoch: number;
  /** Reine Klick-Gebäude (z.B. Höhlenzeichnungen) geben 0 Wissen/Sek., dafür
   * einen festen Wissen/Klick-Bonus pro Einheit. */
  clickBonusPerUnit?: number;
  /** Eigene Button-Grafik statt Emoji-Icon (public/buildings/<id>.jpg). */
  imageUrl?: string;
}

// Feste Tier-Reihenfolge pro Epoche (Abschnitt 7), wird für den Ketten-Bonus gebraucht.
const RAW_BUILDINGS: RawBuilding[] = [
  // Epoche 1 – Antike
  {
    id: "e1_hoehlenzeichnungen",
    name: "Höhlenzeichnungen",
    icon: "🎨",
    epoch: 1,
    clickBonusPerUnit: HOEHLENZEICHNUNGEN_CLICK_BONUS_PER_UNIT,
    imageUrl: "/buildings/e1_hoehlenzeichnungen.jpg",
  },
  {
    id: "e1_erzaehlungen",
    name: "Erzählungen",
    icon: "🔥",
    epoch: 1,
    imageUrl: "/buildings/e1_erzaehlungen.jpg",
  },
  { id: "e1_buecher", name: "Bücher", icon: "📖", epoch: 1, imageUrl: "/buildings/e1_buecher.jpg" },
  { id: "e1_krippe", name: "Krippe", icon: "🍼", epoch: 1 },
  { id: "e1_kindergarten", name: "Kindergarten", icon: "🧸", epoch: 1 },
  {
    id: "e1_grundschule",
    name: "Grundschule",
    icon: "✏️",
    epoch: 1,
    imageUrl: "/buildings/e1_grundschule.jpg",
  },
  { id: "e1_gymnasium", name: "Gymnasium", icon: "📐", epoch: 1, imageUrl: "/buildings/e1_gymnasium.jpg" },
  { id: "e1_studenten", name: "Studenten", icon: "🧑‍🎓", epoch: 1 },
  { id: "e1_bibliotheken", name: "Bibliotheken", icon: "📚", epoch: 1 },
  { id: "e1_vorlesungen", name: "Vorlesungen", icon: "🗣️", epoch: 1 },
  { id: "e1_notizen", name: "Notizen & Tagebücher", icon: "📓", epoch: 1 },
  { id: "e1_philosophenzirkel", name: "Philosophenzirkel", icon: "🏛️", epoch: 1 },

  // Epoche 2 – Industrielle Erkenntnis
  // e2_schulen entfernt (redundant seit Krippe/Kindergarten/Grundschule/
  // Gymnasium in Epoche 1) — card_mendeleev wurde auf e1_gymnasium umgehängt.
  { id: "e2_universitaeten", name: "Universitäten", icon: "🎓", epoch: 2 },
  { id: "e2_labore", name: "Labore", icon: "🔬", epoch: 2 },
  { id: "e2_bildungsministerium", name: "Bildungsministerium", icon: "🏢", epoch: 2 },
  { id: "e2_forschungsnetzwerke", name: "Forschungsnetzwerke", icon: "🕸️", epoch: 2 },
  { id: "e2_experimentierzentren", name: "Experimentierzentren", icon: "🧪", epoch: 2 },

  // Epoche 3 – Digitale Intelligenz
  { id: "e3_internet", name: "Internet", icon: "🌐", epoch: 3 },
  { id: "e3_ki_assistenten", name: "KI-Assistenten", icon: "🤖", epoch: 3 },
  { id: "e3_forschungszentren", name: "Forschungszentren", icon: "🧠", epoch: 3 },
  { id: "e3_globale_wissensplattform", name: "Globale Wissensplattform", icon: "🗺️", epoch: 3 },
  { id: "e3_neuronale_schnittstellen", name: "Neuronale Schnittstellen", icon: "🔌", epoch: 3 },
  { id: "e3_datenanalyse_kollektive", name: "Datenanalyse-Kollektive", icon: "📊", epoch: 3 },

  // Epoche 4 – Singularität
  { id: "e4_satelliten_netzwerke", name: "Satelliten-Netzwerke", icon: "🛰️", epoch: 4 },
  { id: "e4_supercomputer", name: "Supercomputer", icon: "💻", epoch: 4 },
  { id: "e4_global_mind", name: "Global Mind", icon: "🌍", epoch: 4 },
  { id: "e4_orbital_rechenzentren", name: "Orbital-Rechenzentren", icon: "🛸", epoch: 4 },
  { id: "e4_quanten_labore", name: "Quanten-Labore", icon: "⚛️", epoch: 4 },
  { id: "e4_informationsspeicher_erde", name: "Informationsspeicher der Erde", icon: "💾", epoch: 4 },

  // Epoche 5 – Kosmisches Bewusstsein (unendlicher Loop)
  { id: "e5_galaktische_archive", name: "Galaktische Archive", icon: "🌌", epoch: 5 },
  { id: "e5_schwarze_loch_scanner", name: "Schwarze-Loch-Scanner", icon: "🕳️", epoch: 5 },
  { id: "e5_multiversum_sonden", name: "Multiversum-Sonden", icon: "🌀", epoch: 5 },
  { id: "e5_orbital_labore", name: "Orbital Labore", icon: "🔭", epoch: 5 },
  { id: "e5_singularitaets_knoten", name: "Singularitäts-Knoten", icon: "✨", epoch: 5 },
  { id: "e5_realitaets_compiler", name: "Realitäts-Compiler", icon: "🧬", epoch: 5 },
];

// tierIndex = Position INNERHALB der eigenen Epoche (nicht global), damit
// Epochen mit abweichender Gebäudeanzahl (z.B. Epoche 1 mit Erzählungen als
// zusätzlichem Einstiegsgebäude) korrekt für Ketten-/Synergie-Paarung bleiben.
// baseCost/baseProduction folgen dagegen weiter dem GLOBALEN Index, damit die
// Preiskurve über alle 31 Gebäude hinweg durchgehend exponentiell bleibt.
const tierCounters = new Map<number, number>();
export const BUILDINGS: BuildingDef[] = RAW_BUILDINGS.map((raw, globalIndex) => {
  const tierIndex = tierCounters.get(raw.epoch) ?? 0;
  tierCounters.set(raw.epoch, tierIndex + 1);
  const baseCost = new Decimal(BUILDING_BASE_COST_START).times(
    Decimal.pow(BUILDING_TIER_GROWTH, globalIndex),
  );
  // Reine Klick-Gebäude (clickBonusPerUnit gesetzt) geben bewusst 0 Wissen/Sek.
  const baseProduction =
    raw.clickBonusPerUnit !== undefined ? ZERO : baseCost.times(BUILDING_PRODUCTION_TO_COST_RATIO);
  return {
    id: raw.id,
    name: raw.name,
    icon: raw.icon,
    epoch: raw.epoch,
    tierIndex,
    baseCost,
    baseProduction,
    clickBonusPerUnit: raw.clickBonusPerUnit !== undefined ? new Decimal(raw.clickBonusPerUnit) : undefined,
    imageUrl: raw.imageUrl,
  };
});

export const BUILDINGS_BY_ID: Record<string, BuildingDef> = Object.fromEntries(
  BUILDINGS.map((b) => [b.id, b]),
);

export function buildingsForEpoch(epoch: number): BuildingDef[] {
  return BUILDINGS.filter((b) => b.epoch === epoch).sort((a, b) => a.tierIndex - b.tierIndex);
}

/** Paar-Synergien: Gebäude 1↔2, 3↔4, 5↔6 je Epoche (Abschnitt 8). */
export function synergyPartnerOf(buildingId: string): string | null {
  const building = BUILDINGS_BY_ID[buildingId];
  if (!building) return null;
  const epochBuildings = buildingsForEpoch(building.epoch);
  const pairIndex = Math.floor(building.tierIndex / 2);
  const partnerTierIndex = building.tierIndex % 2 === 0 ? pairIndex * 2 + 1 : pairIndex * 2;
  return epochBuildings.find((b) => b.tierIndex === partnerTierIndex)?.id ?? null;
}

/** Ketten-Bonus: Gebäude i boostet i+1 in der Tier-Reihenfolge derselben Epoche (Abschnitt 9). */
export function chainPredecessorOf(buildingId: string): string | null {
  const building = BUILDINGS_BY_ID[buildingId];
  if (!building || building.tierIndex === 0) return null;
  const epochBuildings = buildingsForEpoch(building.epoch);
  return epochBuildings.find((b) => b.tierIndex === building.tierIndex - 1)?.id ?? null;
}
