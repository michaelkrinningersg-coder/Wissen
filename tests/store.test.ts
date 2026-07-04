import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGameStore } from "../src/game/state/store";
import { createInitialPlayer } from "../src/game/state/initialState";
import { toSaveShape, fromSaveShape } from "../src/game/persistence/save";
import { exportSaveCode, importSaveCode } from "../src/game/persistence/codec";

function resetStore() {
  useGameStore.setState({ player: createInitialPlayer() });
}

describe("game store", () => {
  beforeEach(resetStore);

  it("click() adds knowledge and increments totalClicks", () => {
    const { actions } = useGameStore.getState();
    actions.click();
    actions.click();
    const { player } = useGameStore.getState();
    expect(player.totalClicks).toBe(2);
    expect(player.knowledge.toNumber()).toBeGreaterThan(0);
  });

  it("buyBuilding deducts cost and increases owned count", () => {
    const { actions } = useGameStore.getState();
    useGameStore.setState((s) => ({ player: { ...s.player, knowledge: s.player.knowledge.plus(100_000) } }));
    actions.buyBuilding("e1_buecher", 5);
    const { player } = useGameStore.getState();
    expect(player.buildings["e1_buecher"].owned).toBe(5);
    expect(player.knowledge.toNumber()).toBeLessThan(100_000);
  });

  it("buyBuilding does nothing if unaffordable", () => {
    const { actions } = useGameStore.getState();
    actions.buyBuilding("e1_buecher", 100);
    const { player } = useGameStore.getState();
    expect(player.buildings["e1_buecher"].owned).toBe(0);
  });

  it("tick() accumulates knowledge over time proportional to dt", () => {
    const { actions } = useGameStore.getState();
    useGameStore.setState((s) => ({
      player: { ...s.player, buildings: { ...s.player.buildings, e1_buecher: { owned: 10 } } },
    }));
    actions.tick(1);
    const after1s = useGameStore.getState().player.knowledge;
    actions.tick(1);
    const after2s = useGameStore.getState().player.knowledge;
    expect(after1s.toNumber()).toBeGreaterThan(0);
    expect(after2s.toNumber()).toBeGreaterThan(after1s.toNumber());
  });

  it("tick() eventually spawns a random event (long enough dt)", () => {
    const { actions } = useGameStore.getState();
    // Ein einzelner riesiger Tick simuliert "viel Zeit vergeht" (Timer startet
    // bei 60-120s Default, ein 500s-Tick muss ihn auslösen).
    actions.tick(500);
    const { player } = useGameStore.getState();
    expect(player.activeEvents.length).toBeGreaterThan(0);
  });

  it("click() can drop a card when the roll succeeds (Math.random forced to 0)", () => {
    const { actions } = useGameStore.getState();
    useGameStore.setState((s) => ({
      player: {
        ...s.player,
        buildings: { ...s.player.buildings, e1_philosophenzirkel: { owned: 25 } },
      },
    }));
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
    actions.click();
    randomSpy.mockRestore();
    const { player } = useGameStore.getState();
    expect(player.cards["card_aristoteles"]?.copies).toBeGreaterThan(0);
    expect(player.lastCardDrop?.cardId).toBe("card_aristoteles");
    expect(player.activeCardBuffMultiplier).toBeGreaterThan(1);
  });

  it("click() does not drop a card below the linked building's spawn threshold", () => {
    const { actions } = useGameStore.getState();
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
    actions.click(); // e1_philosophenzirkel owned = 0, below threshold 25
    randomSpy.mockRestore();
    const { player } = useGameStore.getState();
    expect(Object.keys(player.cards).length).toBe(0);
  });

  it("auto-clicker upgrade grants continuous passive knowledge without touching totalClicks", () => {
    const { actions } = useGameStore.getState();
    useGameStore.setState((s) => ({
      player: { ...s.player, coreUpgrades: ["core_click_1", "core_click_2", "core_automation_autoclicker"] },
    }));
    actions.tick(2);
    const { player } = useGameStore.getState();
    expect(player.knowledge.toNumber()).toBeGreaterThan(0);
    expect(player.totalClicks).toBe(0);
  });

  it("auto-buyer upgrade purchases the cheapest affordable building once per whole second", () => {
    const { actions } = useGameStore.getState();
    useGameStore.setState((s) => ({
      player: {
        ...s.player,
        knowledge: s.player.knowledge.plus(1000),
        coreUpgrades: ["core_automation_buyx", "core_automation_autobuyer"],
      },
    }));
    actions.tick(1.1); // ueberschreitet eine ganze Sekunde -> Auto-Buyer feuert
    const { player } = useGameStore.getState();
    const totalOwned = Object.values(player.buildings).reduce((sum, b) => sum + b.owned, 0);
    expect(totalOwned).toBeGreaterThan(0);
  });

  it("prestige() is blocked below the minimum generated-knowledge threshold", () => {
    const { actions } = useGameStore.getState();
    useGameStore.setState((s) => ({
      player: { ...s.player, knowledgeEarnedThisRun: s.player.knowledgeEarnedThisRun.plus(1_000) },
    }));
    actions.prestige();
    const { player } = useGameStore.getState();
    expect(player.epochenLevel).toBe(0);
    expect(player.prestigeCount).toBe(0);
  });

  it("prestige() resets knowledge/buildings but keeps permanent progress once eligible", () => {
    const { actions } = useGameStore.getState();
    useGameStore.setState((s) => ({
      player: {
        ...s.player,
        knowledge: s.player.knowledge.plus(1_000_000),
        // Muss >= PRESTIGE_MIN_KNOWLEDGE_BASE (1e9) sein, damit Prestige erlaubt ist.
        knowledgeEarnedThisRun: s.player.knowledgeEarnedThisRun.plus(4_000_000_000),
        buildings: { ...s.player.buildings, e1_buecher: { owned: 20 } },
        achievements: ["ach_production_0"],
      },
    }));
    actions.prestige();
    const { player } = useGameStore.getState();
    expect(player.knowledge.toNumber()).toBe(0);
    expect(player.buildings["e1_buecher"].owned).toBe(0);
    expect(player.epochenLevel).toBe(1);
    expect(player.intelligenceCores.toNumber()).toBe(63); // floor(sqrt(4_000_000_000/1_000_000)) = 63
    expect(player.achievements).toContain("ach_production_0"); // Achievements resetten nie
    expect(player.prestigeCount).toBe(1);
  });

  it("achievements unlock automatically once a metric threshold is crossed", () => {
    const { actions } = useGameStore.getState();
    useGameStore.setState((s) => ({
      player: { ...s.player, lifetimeKnowledge: s.player.lifetimeKnowledge.plus(1000) },
    }));
    actions.click(); // löst die Achievement-Auswertung erneut aus
    const { player } = useGameStore.getState();
    expect(player.achievements).toContain("ach_production_0");
    expect(player.achievementPoints).toBeGreaterThan(0);
  });

  it("purchaseCoreUpgrade respects prerequisites and cost", () => {
    const { actions } = useGameStore.getState();
    useGameStore.setState((s) => ({ player: { ...s.player, intelligenceCores: s.player.intelligenceCores.plus(1000) } }));
    // core_global_2 benötigt core_global_1 zuerst
    actions.purchaseCoreUpgrade("core_global_2");
    expect(useGameStore.getState().player.coreUpgrades).not.toContain("core_global_2");
    actions.purchaseCoreUpgrade("core_global_1");
    actions.purchaseCoreUpgrade("core_global_2");
    const { player } = useGameStore.getState();
    expect(player.coreUpgrades).toContain("core_global_1");
    expect(player.coreUpgrades).toContain("core_global_2");
  });
});

describe("save round-trip", () => {
  beforeEach(resetStore);

  it("toSaveShape -> fromSaveShape preserves Decimal and plain fields", () => {
    useGameStore.setState((s) => ({
      player: {
        ...s.player,
        knowledge: s.player.knowledge.plus("1.5e50"),
        buildings: { ...s.player.buildings, e1_buecher: { owned: 7 } },
        totalClicks: 42,
      },
    }));
    const { player } = useGameStore.getState();
    const restored = fromSaveShape(toSaveShape(player));
    expect(restored.knowledge.toString()).toBe(player.knowledge.toString());
    expect(restored.buildings["e1_buecher"].owned).toBe(7);
    expect(restored.totalClicks).toBe(42);
  });

  it("exportSaveCode -> importSaveCode round-trips through Base64", () => {
    useGameStore.setState((s) => ({
      player: { ...s.player, knowledge: s.player.knowledge.plus(12345), totalClicks: 9 },
    }));
    const { player } = useGameStore.getState();
    const code = exportSaveCode(player);
    expect(code.startsWith("WSN1:")).toBe(true);
    const imported = importSaveCode(code);
    expect(imported.knowledge.toNumber()).toBe(12345);
    expect(imported.totalClicks).toBe(9);
  });

  it("importSaveCode rejects garbage input", () => {
    expect(() => importSaveCode("not-a-real-code")).toThrow();
  });
});
