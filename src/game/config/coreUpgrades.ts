import { Decimal } from "../decimal";
import type { CoreUpgradeDef } from "../types";

/**
 * Kern-Shop-Skilltree (Abschnitt 6): dauerhafte Upgrades, gekauft mit dem
 * (resettenden) Kern-Guthaben. Bilden zusammen den PrestigeBonus.
 */
export const CORE_UPGRADES: CoreUpgradeDef[] = [
  {
    id: "core_global_1",
    name: "Kollektives Wissen I",
    description: "+5% Wissen pro Sekunde global.",
    icon: "🌱",
    cost: new Decimal(5),
    category: "global",
    effectPercent: 0.05,
  },
  {
    id: "core_global_2",
    name: "Kollektives Wissen II",
    description: "+10% Wissen pro Sekunde global.",
    icon: "🌿",
    cost: new Decimal(15),
    requires: ["core_global_1"],
    category: "global",
    effectPercent: 0.1,
  },
  {
    id: "core_global_3",
    name: "Kollektives Wissen III",
    description: "+20% Wissen pro Sekunde global.",
    icon: "🌳",
    cost: new Decimal(40),
    requires: ["core_global_2"],
    category: "global",
    effectPercent: 0.2,
  },
  {
    id: "core_global_4",
    name: "Kollektives Wissen IV",
    description: "+50% Wissen pro Sekunde global.",
    icon: "🌲",
    cost: new Decimal(120),
    requires: ["core_global_3"],
    category: "global",
    effectPercent: 0.5,
  },
  {
    id: "core_click_1",
    name: "Geschärfter Verstand I",
    description: "+10% Klickwert.",
    icon: "👆",
    cost: new Decimal(5),
    category: "click",
    effectPercent: 0.1,
  },
  {
    id: "core_click_2",
    name: "Geschärfter Verstand II",
    description: "+25% Klickwert.",
    icon: "✋",
    cost: new Decimal(20),
    requires: ["core_click_1"],
    category: "click",
    effectPercent: 0.25,
  },
  {
    id: "core_efficiency_1",
    name: "Effiziente Gebäude I",
    description: "+5% Gebäude-Effizienz global.",
    icon: "⚙️",
    cost: new Decimal(10),
    category: "efficiency",
    effectPercent: 0.05,
  },
  {
    id: "core_efficiency_2",
    name: "Effiziente Gebäude II",
    description: "+15% Gebäude-Effizienz global.",
    icon: "🔧",
    cost: new Decimal(30),
    requires: ["core_efficiency_1"],
    category: "efficiency",
    effectPercent: 0.15,
  },
  {
    id: "core_efficiency_3",
    name: "Effiziente Gebäude III",
    description: "+30% Gebäude-Effizienz global.",
    icon: "🛠️",
    cost: new Decimal(80),
    requires: ["core_efficiency_2"],
    category: "efficiency",
    effectPercent: 0.3,
  },
  {
    id: "core_synergy_layer_1",
    name: "Synergie-Schicht I",
    description: "Verstärkt alle Paar-Synergien um +2 Prozentpunkte Faktor.",
    icon: "🔗",
    cost: new Decimal(25),
    requires: ["core_global_2"],
    category: "synergy",
    effectPercent: 0.02,
  },
  {
    id: "core_synergy_layer_2",
    name: "Synergie-Schicht II",
    description: "Verstärkt alle Paar-Synergien um weitere +3 Prozentpunkte Faktor.",
    icon: "⛓️",
    cost: new Decimal(90),
    requires: ["core_synergy_layer_1"],
    category: "synergy",
    effectPercent: 0.03,
  },
  {
    id: "core_automation_buyx",
    name: "Großeinkauf",
    description: "Schaltet die Kaufmengen x5/x10/x25/x50/x100/Max frei.",
    icon: "🛒",
    cost: new Decimal(15),
    category: "automation",
  },
  {
    id: "core_automation_autoclicker",
    name: "Auto-Klicker",
    description: "Klickt automatisch einmal pro Sekunde für dich.",
    icon: "🕹️",
    cost: new Decimal(60),
    requires: ["core_click_2"],
    category: "automation",
  },
  {
    id: "core_automation_autobuyer",
    name: "Auto-Buyer",
    description: "Kauft automatisch das günstigste bezahlbare Gebäude.",
    icon: "🤖",
    cost: new Decimal(100),
    requires: ["core_automation_buyx"],
    category: "automation",
  },
];

export const CORE_UPGRADES_BY_ID: Record<string, CoreUpgradeDef> = Object.fromEntries(
  CORE_UPGRADES.map((u) => [u.id, u]),
);

export function isCoreUpgradeAvailable(upgradeId: string, purchased: string[]): boolean {
  const def = CORE_UPGRADES_BY_ID[upgradeId];
  if (!def) return false;
  if (purchased.includes(upgradeId)) return false;
  if (!def.requires) return true;
  return def.requires.every((r) => purchased.includes(r));
}
