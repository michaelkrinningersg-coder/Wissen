import type { GameEventDef } from "../types";

/** Events-System (Abschnitt 12) — temporär, multiplikativ, EventMultiplikator. */
export const GAME_EVENTS: GameEventDef[] = [
  {
    id: "event_nobelpreis",
    name: "Nobelpreis",
    description: "Eine bahnbrechende Entdeckung! ×10 globale Produktion für kurze Zeit.",
    icon: "🏆",
    durationSeconds: 30,
    kind: "global_multiplier",
    magnitude: 10,
  },
  {
    id: "event_ai_durchbruch",
    name: "AI Durchbruch",
    description: "KI-Gebäude verdoppeln ihren Output.",
    icon: "🤖",
    durationSeconds: 45,
    kind: "ai_building_multiplier",
    magnitude: 2,
  },
  {
    id: "event_informationskrise",
    name: "Informationskrise",
    description: "Fehlinformationen breiten sich aus. -50% Produktion für kurze Zeit.",
    icon: "📉",
    durationSeconds: 20,
    kind: "crisis_debuff",
    magnitude: 0.5,
  },
  {
    id: "event_informationsflut",
    name: "Informationsflut",
    description: "Der Klickbonus ist massiv erhöht.",
    icon: "🌐",
    durationSeconds: 30,
    kind: "click_multiplier",
    magnitude: 8,
  },
];

export const GAME_EVENTS_BY_ID: Record<string, GameEventDef> = Object.fromEntries(
  GAME_EVENTS.map((e) => [e.id, e]),
);

/** Gebäude, die als "KI-Gebäude" für den AI-Durchbruch-Event zählen. */
export const AI_BUILDING_IDS = new Set([
  "e3_ki_assistenten",
  "e3_neuronale_schnittstellen",
  "e4_supercomputer",
  "e4_global_mind",
  "combo_sokratische_ki",
  "combo_bio_digitale_forschung",
]);
