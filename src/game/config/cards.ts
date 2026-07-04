import type { CardDef } from "../types";

/**
 * Gelehrten-Karten "Gelehrte der Geschichte" (Abschnitt 13). Ausschließlich
 * echte, historische Personen, thematisch je Ära gruppiert. Karte↔Gebäude-
 * Zuordnung sowie Schwellenwerte sind explizit Content-Design, keine
 * Logikfrage (siehe Dokument Abschnitt 23) — hier als zentrale Tabelle
 * gepflegt, leicht nachjustierbar.
 */
export const CARDS: CardDef[] = [
  // Antike
  { id: "card_aristoteles", name: "Aristoteles", era: "Antike", icon: "🏺", rarity: "epic", linkedBuildingId: "e1_philosophenzirkel", spawnThreshold: 25, baseBoostPercent: 0.02 },
  { id: "card_euklid", name: "Euklid", era: "Antike", icon: "📐", rarity: "common", linkedBuildingId: "e1_buecher", spawnThreshold: 25, baseBoostPercent: 0.005 },
  { id: "card_hypatia", name: "Hypatia", era: "Antike", icon: "📜", rarity: "rare", linkedBuildingId: "e1_bibliotheken", spawnThreshold: 25, baseBoostPercent: 0.01 },
  { id: "card_pythagoras", name: "Pythagoras", era: "Antike", icon: "🔺", rarity: "common", linkedBuildingId: "e1_studenten", spawnThreshold: 25, baseBoostPercent: 0.005 },
  { id: "card_archimedes", name: "Archimedes", era: "Antike", icon: "🛁", rarity: "common", linkedBuildingId: "e1_notizen", spawnThreshold: 25, baseBoostPercent: 0.005 },

  // Mittelalter / Frühe Neuzeit
  { id: "card_al_khwarizmi", name: "Al-Khwarizmi", era: "Mittelalter/Frühe Neuzeit", icon: "🕌", rarity: "rare", linkedBuildingId: "e1_vorlesungen", spawnThreshold: 50, baseBoostPercent: 0.01 },
  { id: "card_ibn_al_haytham", name: "Ibn al-Haytham", era: "Mittelalter/Frühe Neuzeit", icon: "🔦", rarity: "rare", linkedBuildingId: "e2_labore", spawnThreshold: 50, baseBoostPercent: 0.01 },
  { id: "card_isaac_newton", name: "Isaac Newton", era: "Mittelalter/Frühe Neuzeit", icon: "🍎", rarity: "legendary", linkedBuildingId: "e2_universitaeten", spawnThreshold: 75, baseBoostPercent: 0.04 },

  // Industrielle Erkenntnis
  { id: "card_darwin", name: "Charles Darwin", era: "Industrielle Erkenntnis", icon: "🐢", rarity: "epic", linkedBuildingId: "e2_forschungsnetzwerke", spawnThreshold: 75, baseBoostPercent: 0.02 },
  { id: "card_mendeleev", name: "Dmitri Mendeleev", era: "Industrielle Erkenntnis", icon: "🧫", rarity: "rare", linkedBuildingId: "e2_schulen", spawnThreshold: 75, baseBoostPercent: 0.01 },
  { id: "card_curie", name: "Marie Curie", era: "Industrielle Erkenntnis", icon: "☢️", rarity: "epic", linkedBuildingId: "e2_experimentierzentren", spawnThreshold: 75, baseBoostPercent: 0.02 },
  { id: "card_watt", name: "James Watt", era: "Industrielle Erkenntnis", icon: "⚙️", rarity: "common", linkedBuildingId: "e2_bildungsministerium", spawnThreshold: 75, baseBoostPercent: 0.005 },

  // Digitale Intelligenz
  { id: "card_turing", name: "Alan Turing", era: "Digitale Intelligenz", icon: "🧩", rarity: "legendary", linkedBuildingId: "e3_ki_assistenten", spawnThreshold: 100, baseBoostPercent: 0.04 },
  { id: "card_lovelace", name: "Ada Lovelace", era: "Digitale Intelligenz", icon: "🎼", rarity: "legendary", linkedBuildingId: "e3_internet", spawnThreshold: 100, baseBoostPercent: 0.04 },
  { id: "card_shannon", name: "Claude Shannon", era: "Digitale Intelligenz", icon: "📡", rarity: "rare", linkedBuildingId: "e3_datenanalyse_kollektive", spawnThreshold: 100, baseBoostPercent: 0.01 },
  { id: "card_von_neumann", name: "John von Neumann", era: "Digitale Intelligenz", icon: "🧮", rarity: "epic", linkedBuildingId: "e3_forschungszentren", spawnThreshold: 100, baseBoostPercent: 0.02 },
  { id: "card_hopper", name: "Grace Hopper", era: "Digitale Intelligenz", icon: "🐞", rarity: "rare", linkedBuildingId: "e3_globale_wissensplattform", spawnThreshold: 100, baseBoostPercent: 0.01 },

  // Singularität
  { id: "card_wiener", name: "Norbert Wiener", era: "Singularität", icon: "🔁", rarity: "epic", linkedBuildingId: "e4_global_mind", spawnThreshold: 150, baseBoostPercent: 0.02 },
  { id: "card_mccarthy", name: "John McCarthy", era: "Singularität", icon: "λ", rarity: "common", linkedBuildingId: "e4_supercomputer", spawnThreshold: 150, baseBoostPercent: 0.005 },
  { id: "card_minsky", name: "Marvin Minsky", era: "Singularität", icon: "🦾", rarity: "common", linkedBuildingId: "e4_quanten_labore", spawnThreshold: 150, baseBoostPercent: 0.005 },
  { id: "card_good", name: "I. J. Good", era: "Singularität", icon: "♾️", rarity: "common", linkedBuildingId: "e4_informationsspeicher_erde", spawnThreshold: 150, baseBoostPercent: 0.005 },
  { id: "card_vinge", name: "Vernor Vinge", era: "Singularität", icon: "🌠", rarity: "rare", linkedBuildingId: "e4_orbital_rechenzentren", spawnThreshold: 150, baseBoostPercent: 0.01 },

  // Kosmisches Bewusstsein
  { id: "card_sagan", name: "Carl Sagan", era: "Kosmisches Bewusstsein", icon: "🪐", rarity: "epic", linkedBuildingId: "e5_galaktische_archive", spawnThreshold: 200, baseBoostPercent: 0.02 },
  { id: "card_hawking", name: "Stephen Hawking", era: "Kosmisches Bewusstsein", icon: "🕳️", rarity: "legendary", linkedBuildingId: "e5_schwarze_loch_scanner", spawnThreshold: 200, baseBoostPercent: 0.04 },
  { id: "card_dyson", name: "Freeman Dyson", era: "Kosmisches Bewusstsein", icon: "🔆", rarity: "rare", linkedBuildingId: "e5_multiversum_sonden", spawnThreshold: 200, baseBoostPercent: 0.01 },
  { id: "card_chandrasekhar", name: "Subrahmanyan Chandrasekhar", era: "Kosmisches Bewusstsein", icon: "⭐", rarity: "common", linkedBuildingId: "e5_orbital_labore", spawnThreshold: 200, baseBoostPercent: 0.005 },
];

export const CARDS_BY_ID: Record<string, CardDef> = Object.fromEntries(
  CARDS.map((c) => [c.id, c]),
);

export const CARD_ERAS: string[] = Array.from(new Set(CARDS.map((c) => c.era)));

export function cardsForEra(era: string): CardDef[] {
  return CARDS.filter((c) => c.era === era);
}
