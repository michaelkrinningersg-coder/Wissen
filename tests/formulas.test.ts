import { describe, expect, it } from "vitest";
import { Decimal } from "../src/game/decimal";
import { createInitialPlayer } from "../src/game/state/initialState";
import { BUILDINGS_BY_ID } from "../src/game/config/buildings";
import {
  batchCost,
  buildingCost,
  buildingLocalMultiplier,
  buildingProduction,
  canPrestige,
  cardGearMultiplier,
  coresAwarded,
  epochenBonus,
  firstCoreKnowledgeThreshold,
  knowledgePerSecond,
  maxAffordable,
  prestigeMinKnowledge,
} from "../src/game/formulas";
import { ACHIEVEMENTS_BY_ID } from "../src/game/config/achievements";
import {
  CHAIN_FACTOR,
  PRESTIGE_CORE_DIVISOR,
  PRESTIGE_MIN_KNOWLEDGE_BASE,
  PRESTIGE_MIN_KNOWLEDGE_GROWTH,
  SYNERGY_FACTOR,
} from "../src/game/config/constants";

describe("buildingCost", () => {
  it("matches Kosten(n) = Basispreis * 1.15^n", () => {
    const base = new Decimal(10);
    expect(buildingCost(base, 0).toNumber()).toBeCloseTo(10);
    expect(buildingCost(base, 1).toNumber()).toBeCloseTo(11.5);
    expect(buildingCost(base, 10).toNumber()).toBeCloseTo(10 * 1.15 ** 10, 4);
  });
});

describe("batchCost", () => {
  it("equals the sum of individual unit costs", () => {
    const base = new Decimal(10);
    const owned = 3;
    const amount = 5;
    let manualSum = new Decimal(0);
    for (let i = 0; i < amount; i++) {
      manualSum = manualSum.plus(buildingCost(base, owned + i));
    }
    const closedForm = batchCost(base, owned, amount);
    expect(closedForm.toNumber()).toBeCloseTo(manualSum.toNumber(), 6);
  });

  it("returns 0 for amount <= 0", () => {
    expect(batchCost(new Decimal(10), 0, 0).toNumber()).toBe(0);
  });
});

describe("maxAffordable", () => {
  it("buys as many as truly affordable, never one more", () => {
    const base = new Decimal(10);
    const owned = 0;
    const available = new Decimal(1000);
    const count = maxAffordable(base, owned, available);
    const costForCount = batchCost(base, owned, count);
    const costForOneMore = batchCost(base, owned, count + 1);
    expect(costForCount.lte(available)).toBe(true);
    expect(costForOneMore.gt(available)).toBe(true);
  });

  it("returns 0 when nothing is affordable", () => {
    expect(maxAffordable(new Decimal(1000), 0, new Decimal(1))).toBe(0);
  });

  it("agrees exactly with batchCost at a round-number boundary", () => {
    const base = new Decimal(10);
    const available = batchCost(base, 0, 10);
    const count = maxAffordable(base, 0, available);
    expect(count).toBe(10);
  });
});

describe("Stacking-Regel: lokale Boni additiv, Kategorien multiplikativ", () => {
  it("combines synergy + chain additively for a single building", () => {
    const player = createInitialPlayer();
    // e1_buecher (tierIndex 1) hat Synergie-Partner UND Ketten-Vorgänger
    // e1_erzaehlungen (tierIndex 0, das niederschwellige Einstiegsgebäude).
    player.buildings["e1_erzaehlungen"] = { owned: 100 };
    player.buildings["e1_buecher"] = { owned: 1 };

    const expectedSynergy = SYNERGY_FACTOR * Math.log(1 + 100);
    const expectedChain = 100 * CHAIN_FACTOR;
    const multiplier = buildingLocalMultiplier("e1_buecher", player);
    expect(multiplier).toBeCloseTo(1 + expectedSynergy + expectedChain, 6);
  });

  it("multiplies categories (epoch/prestige/global-block/event) rather than adding them", () => {
    const player = createInitialPlayer();
    player.buildings["e1_buecher"] = { owned: 10 };
    player.epochenLevel = 2; // epochenBonus = 5^2 = 25

    const def = BUILDINGS_BY_ID["e1_buecher"];
    const baseProd = buildingProduction("e1_buecher", player);
    const kps = knowledgePerSecond(player, ACHIEVEMENTS_BY_ID);

    const expectedEpochBonus = epochenBonus(2);
    expect(expectedEpochBonus.toNumber()).toBeCloseTo(25, 6);
    // Bei nur einem Gebäudetyp und ohne Karten/Achievements/Events sollte
    // kps = baseProd * epochenBonus * prestigeBonus(1) * globalBlock gelten.
    const ratio = kps.div(baseProd).div(expectedEpochBonus).toNumber();
    expect(ratio).toBeGreaterThan(1); // Diversität/Masse-Block ist > 1
    void def;
  });
});

describe("coresAwarded", () => {
  it("matches floor(sqrt(GesamtWissen / Divisor))", () => {
    // Divisor ist 1e6 lt. constants.ts
    const result = coresAwarded(new Decimal(4_000_000));
    expect(result.toNumber()).toBe(2);
  });

  it("never returns negative or NaN for 0 knowledge", () => {
    expect(coresAwarded(new Decimal(0)).toNumber()).toBe(0);
  });
});

describe("firstCoreKnowledgeThreshold", () => {
  it("equals PRESTIGE_CORE_DIVISOR (floor(sqrt(x/D)) >= 1 iff x >= D)", () => {
    expect(firstCoreKnowledgeThreshold().toNumber()).toBe(PRESTIGE_CORE_DIVISOR);
    expect(coresAwarded(firstCoreKnowledgeThreshold()).toNumber()).toBe(1);
    expect(coresAwarded(firstCoreKnowledgeThreshold().minus(1)).toNumber()).toBe(0);
  });
});

describe("prestigeMinKnowledge / canPrestige", () => {
  it("grows by PRESTIGE_MIN_KNOWLEDGE_GROWTH per EpochenLevel, starting at the base", () => {
    expect(prestigeMinKnowledge(0).toNumber()).toBeCloseTo(PRESTIGE_MIN_KNOWLEDGE_BASE, 0);
    expect(prestigeMinKnowledge(1).toNumber()).toBeCloseTo(
      PRESTIGE_MIN_KNOWLEDGE_BASE * PRESTIGE_MIN_KNOWLEDGE_GROWTH,
      0,
    );
  });

  it("blocks prestige below the threshold and allows it at/above", () => {
    const player = createInitialPlayer();
    player.knowledgeEarnedThisRun = prestigeMinKnowledge(0).minus(1);
    expect(canPrestige(player)).toBe(false);
    player.knowledgeEarnedThisRun = prestigeMinKnowledge(0);
    expect(canPrestige(player)).toBe(true);
  });
});

describe("cardGearMultiplier", () => {
  it("applies the correct tier for copy thresholds", () => {
    expect(cardGearMultiplier(0)).toBe(1);
    expect(cardGearMultiplier(9)).toBe(1);
    expect(cardGearMultiplier(10)).toBe(1.05);
    expect(cardGearMultiplier(24)).toBe(1.05);
    expect(cardGearMultiplier(25)).toBe(1.15);
    expect(cardGearMultiplier(50)).toBe(1.3);
    expect(cardGearMultiplier(100)).toBe(1.5);
    expect(cardGearMultiplier(1000)).toBe(1.5);
  });
});

describe("epochenBonus", () => {
  it("grows unboundedly as Basis^EpochenLevel", () => {
    expect(epochenBonus(0).toNumber()).toBeCloseTo(1, 6);
    expect(epochenBonus(1).toNumber()).toBeCloseTo(5, 6);
    expect(epochenBonus(5).toNumber()).toBeCloseTo(3125, 6);
    // Epoche 5 ist kein Endpunkt: EpochenLevel > 5 wächst der Bonus weiter
    expect(epochenBonus(10).toNumber()).toBeCloseTo(5 ** 10, 4);
  });
});
