import Decimal, { type DecimalSource } from "break_eternity.js";

export type { DecimalSource };
export { Decimal };

/** Shorthand constructor, accepts number | string | Decimal. */
export function D(value: DecimalSource): Decimal {
  return Decimal.fromValue(value);
}

export const ZERO = new Decimal(0);
export const ONE = new Decimal(1);

export function decimalMax(a: Decimal, b: Decimal): Decimal {
  return a.gte(b) ? a : b;
}

export function decimalMin(a: Decimal, b: Decimal): Decimal {
  return a.lte(b) ? a : b;
}
