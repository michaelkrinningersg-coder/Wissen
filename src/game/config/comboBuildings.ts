import { Decimal } from "../decimal";
import type { ComboBuildingDef } from "../types";

/**
 * Cross-Epochen-Kombos (Abschnitt 11). Keine neue Mechanik: einmalig
 * freischaltbar sobald beide Elternbauten die Schwelle erreichen, geben
 * dauerhaft einen zusätzlichen additiven Lokal-Bonus auf beide Eltern.
 * comboBuildingsOwned resettet NICHT beim Prestige (siehe Plan/Design-Notiz).
 */
export const COMBO_BUILDINGS: ComboBuildingDef[] = [
  {
    id: "combo_sokratische_ki",
    name: "Sokratische KI",
    icon: "💭",
    flavor: "Philosophenzirkel + KI-Assistenten",
    parentA: "e1_philosophenzirkel",
    parentB: "e3_ki_assistenten",
    threshold: 100,
    unlockCost: new Decimal("1e12"),
    boostPercent: 0.5,
  },
  {
    id: "combo_orbitale_bibliothek",
    name: "Orbitale Bibliothek",
    icon: "📡",
    flavor: "Bücher + Satelliten-Netzwerke",
    parentA: "e1_buecher",
    parentB: "e4_satelliten_netzwerke",
    threshold: 100,
    unlockCost: new Decimal("1e18"),
    boostPercent: 0.5,
  },
  {
    id: "combo_bio_digitale_forschung",
    name: "Bio-Digitale Forschung",
    icon: "🦠",
    flavor: "Labore + Neuronale Schnittstellen",
    parentA: "e2_labore",
    parentB: "e3_neuronale_schnittstellen",
    threshold: 100,
    unlockCost: new Decimal("1e10"),
    boostPercent: 0.5,
  },
  {
    id: "combo_offene_universitaet",
    name: "Offene Universität",
    icon: "🎒",
    flavor: "Vorlesungen + Globale Wissensplattform",
    parentA: "e1_vorlesungen",
    parentB: "e3_globale_wissensplattform",
    threshold: 100,
    unlockCost: new Decimal("1e11"),
    boostPercent: 0.5,
  },
];

export const COMBO_BUILDINGS_BY_ID: Record<string, ComboBuildingDef> = Object.fromEntries(
  COMBO_BUILDINGS.map((c) => [c.id, c]),
);

export function comboBuildingsForParent(buildingId: string): ComboBuildingDef[] {
  return COMBO_BUILDINGS.filter((c) => c.parentA === buildingId || c.parentB === buildingId);
}
