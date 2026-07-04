import { describe, expect, it } from "vitest";
import { Decimal } from "../src/game/decimal";
import { createInitialPlayer } from "../src/game/state/initialState";
import { BUILDINGS_BY_ID } from "../src/game/config/buildings";
import {
  baseClickValue,
  batchCost,
  buildingCost,
  buildingLocalMultiplier,
  buildingMilestoneMultiplier,
  buildingProduction,
  buildingScalingBonus,
  canMiniPrestige,
  canPrestige,
  cardGearMultiplier,
  clickValue,
  coresAwarded,
  epochenBonus,
  firstCoreKnowledgeThreshold,
  knowledgePerSecond,
  maxAffordable,
  passiveCoreBonusRate,
  prestigeBonus,
  prestigeMinKnowledge,
  wissensquellenUpgradeClickPercent,
} from "../src/game/formulas";
import { ACHIEVEMENTS_BY_ID } from "../src/game/config/achievements";
import {
  CHAIN_FACTOR,
  CLICK_BASE_VALUE,
  COST_GROWTH,
  HOEHLENZEICHNUNGEN_CLICK_BONUS_PER_UNIT,
  PASSIVE_CORE_BONUS_PER_ACHIEVEMENT,
  PASSIVE_CORE_BONUS_PER_CORE_BASE,
  PRESTIGE_CORE_DIVISOR,
  PRESTIGE_MIN_KNOWLEDGE_BASE,
  PRESTIGE_MIN_KNOWLEDGE_GROWTH,
  SYNERGY_FACTOR,
  WISSENSQUELLEN_UPGRADES,
} from "../src/game/config/constants";

describe("buildingCost", () => {
  it("matches Kosten(n) = Basispreis * COST_GROWTH^n", () => {
    const base = new Decimal(10);
    expect(buildingCost(base, 0).toNumber()).toBeCloseTo(10);
    expect(buildingCost(base, 1).toNumber()).toBeCloseTo(10 * COST_GROWTH);
    expect(buildingCost(base, 10).toNumber()).toBeCloseTo(10 * COST_GROWTH ** 10, 4);
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
    // e1_erzaehlungen (tierIndex 1) hat Synergie-Partner UND Ketten-Vorgänger
    // e1_hoehlenzeichnungen (tierIndex 0, das allererste Einstiegsgebäude).
    player.buildings["e1_hoehlenzeichnungen"] = { owned: 100 };
    player.buildings["e1_erzaehlungen"] = { owned: 1 };

    const expectedSynergy = SYNERGY_FACTOR * Math.log(1 + 100);
    const expectedChain = 100 * CHAIN_FACTOR;
    const expectedScaling = buildingScalingBonus("e1_erzaehlungen", player);
    const multiplier = buildingLocalMultiplier("e1_erzaehlungen", player);
    expect(multiplier).toBeCloseTo(1 + expectedSynergy + expectedChain + expectedScaling, 6);
  });
});

describe("buildingScalingBonus", () => {
  it("adds 1% per owned unit of the same type, e.g. +100% at 100 units", () => {
    const player = createInitialPlayer();
    player.buildings["e1_hoehlenzeichnungen"] = { owned: 100 };
    expect(buildingScalingBonus("e1_hoehlenzeichnungen", player)).toBeCloseTo(1, 6);
  });

  it("adds 0.1% per owned unit of every other building type, regardless of type", () => {
    const player = createInitialPlayer();
    player.buildings["e1_hoehlenzeichnungen"] = { owned: 10 };
    player.buildings["e1_buecher"] = { owned: 20 };
    player.buildings["e2_labore"] = { owned: 5 };

    expect(buildingScalingBonus("e1_hoehlenzeichnungen", player)).toBeCloseTo(10 * 0.01 + 25 * 0.001, 6);
    expect(buildingScalingBonus("e1_buecher", player)).toBeCloseTo(20 * 0.01 + 15 * 0.001, 6);
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
    // toBeCloseTo vergleicht absolute Nachkommastellen, ungeeignet für diese
    // Größenordnung (1e15+) -> stattdessen relatives Verhältnis prüfen.
    expect(prestigeMinKnowledge(0).div(PRESTIGE_MIN_KNOWLEDGE_BASE).toNumber()).toBeCloseTo(1, 6);
    expect(
      prestigeMinKnowledge(1).div(PRESTIGE_MIN_KNOWLEDGE_BASE * PRESTIGE_MIN_KNOWLEDGE_GROWTH).toNumber(),
    ).toBeCloseTo(1, 6);
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

describe("Klickwert: Höhlenzeichnungen + Wissensquellen-Upgrades", () => {
  it("baseClickValue starts at CLICK_BASE_VALUE and grows with owned Höhlenzeichnungen", () => {
    const player = createInitialPlayer();
    expect(baseClickValue(player).toNumber()).toBeCloseTo(CLICK_BASE_VALUE, 6);

    player.buildings["e1_hoehlenzeichnungen"] = { owned: 4 };
    const localMultiplier = buildingLocalMultiplier("e1_hoehlenzeichnungen", player);
    expect(baseClickValue(player).toNumber()).toBeCloseTo(
      CLICK_BASE_VALUE + 4 * HOEHLENZEICHNUNGEN_CLICK_BONUS_PER_UNIT * localMultiplier,
      6,
    );
  });

  it("Höhlenzeichnungen contribute 0 Wissen/Sek. despite their cost", () => {
    const player = createInitialPlayer();
    player.buildings["e1_hoehlenzeichnungen"] = { owned: 50 };
    expect(buildingProduction("e1_hoehlenzeichnungen", player).toNumber()).toBe(0);
  });

  it("wissensquellenUpgradeClickPercent unlocks automatically once lifetimeKnowledge crosses the threshold", () => {
    const player = createInitialPlayer();
    expect(wissensquellenUpgradeClickPercent(player)).toBe(0);

    player.lifetimeKnowledge = new Decimal(WISSENSQUELLEN_UPGRADES[0].unlockAtLifetimeKnowledge);
    expect(wissensquellenUpgradeClickPercent(player)).toBeCloseTo(
      WISSENSQUELLEN_UPGRADES[0].wpsToClickPercent,
      6,
    );
  });

  it("clickValue adds the unlocked Wissensquellen-Upgrade's %WPS on top of the base click value", () => {
    const player = createInitialPlayer();
    player.lifetimeKnowledge = new Decimal(WISSENSQUELLEN_UPGRADES[0].unlockAtLifetimeKnowledge);
    const kps = new Decimal(1000);
    const value = clickValue(player, kps);
    const expected = CLICK_BASE_VALUE + 1000 * WISSENSQUELLEN_UPGRADES[0].wpsToClickPercent;
    expect(value.toNumber()).toBeCloseTo(expected, 6);
  });
});

describe("buildingMilestoneMultiplier", () => {
  it("stacks every reached threshold multiplicatively", () => {
    expect(buildingMilestoneMultiplier(0)).toBe(1);
    expect(buildingMilestoneMultiplier(49)).toBe(1);
    expect(buildingMilestoneMultiplier(50)).toBeCloseTo(1.25, 6);
    expect(buildingMilestoneMultiplier(75)).toBeCloseTo(1.25 * 1.25, 6);
    expect(buildingMilestoneMultiplier(150)).toBeCloseTo(1.25 ** 5, 6);
    expect(buildingMilestoneMultiplier(1000)).toBeCloseTo(1.25 ** 5 * 1.5 ** 3 * 2 * 4 * 6, 4);
  });

  it("applies to a building's Wissen/Sek. production once its threshold is reached", () => {
    const player = createInitialPlayer();
    player.buildings["e1_erzaehlungen"] = { owned: 50 };
    const def = BUILDINGS_BY_ID["e1_erzaehlungen"];
    const withoutMilestone = def.baseProduction.times(50).times(buildingLocalMultiplier("e1_erzaehlungen", player));
    const actual = buildingProduction("e1_erzaehlungen", player);
    expect(actual.div(withoutMilestone).toNumber()).toBeCloseTo(1.25, 6);
  });

  it("applies to Höhlenzeichnungen' click bonus instead of Wissen/Sek.", () => {
    const player = createInitialPlayer();
    player.buildings["e1_hoehlenzeichnungen"] = { owned: 50 };
    expect(buildingProduction("e1_hoehlenzeichnungen", player).toNumber()).toBe(0);
    const localMultiplier = buildingLocalMultiplier("e1_hoehlenzeichnungen", player);
    const expectedClickBonus =
      CLICK_BASE_VALUE + 50 * HOEHLENZEICHNUNGEN_CLICK_BONUS_PER_UNIT * 1.25 * localMultiplier;
    expect(baseClickValue(player).toNumber()).toBeCloseTo(expectedClickBonus, 6);
  });
});

describe("passiveCoreBonusRate", () => {
  it("adds a fixed increment per unlocked achievement on top of the base rate", () => {
    const player = createInitialPlayer();
    expect(passiveCoreBonusRate(player)).toBeCloseTo(PASSIVE_CORE_BONUS_PER_CORE_BASE, 6);
    player.achievements = ["a", "b", "c"];
    expect(passiveCoreBonusRate(player)).toBeCloseTo(
      PASSIVE_CORE_BONUS_PER_CORE_BASE + 3 * PASSIVE_CORE_BONUS_PER_ACHIEVEMENT,
      6,
    );
  });
});

describe("prestigeBonus", () => {
  it("applies the per-core bonus live to every currently held (unspent) core", () => {
    const player = createInitialPlayer();
    expect(prestigeBonus(player).toNumber()).toBeCloseTo(1, 6);
    player.intelligenceCores = new Decimal(5);
    expect(prestigeBonus(player).toNumber()).toBeCloseTo(1 + 5 * passiveCoreBonusRate(player), 6);
  });
});

describe("canMiniPrestige", () => {
  it("is eligible exactly once the first-core threshold is reached, independent of the epoch prestige minimum", () => {
    const player = createInitialPlayer();
    player.knowledgeEarnedThisRun = firstCoreKnowledgeThreshold().minus(1);
    expect(canMiniPrestige(player)).toBe(false);
    player.knowledgeEarnedThisRun = firstCoreKnowledgeThreshold();
    expect(canMiniPrestige(player)).toBe(true);
  });
});
