import { Decimal } from "./decimal";

const LONG_SCALE_SUFFIXES: Array<{ exponent: number; suffix: string }> = [
  { exponent: 12, suffix: " Bio." },
  { exponent: 9, suffix: " Mrd." },
  { exponent: 6, suffix: " Mio." },
  { exponent: 3, suffix: " Tsd." },
];

function formatGermanNumber(value: number, minDigits: number, maxDigits: number): string {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });
}

function formatScientific(value: Decimal): string {
  const mantissaStr = value.mantissa.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${mantissaStr}e${Math.floor(value.exponent)}`;
}

/** Deutsche Langskala bis 1e15, danach wissenschaftliche Notation mit Komma (Abschnitt 16). */
export function formatKnowledge(value: Decimal): string {
  if (value.lt(0)) return "-" + formatKnowledge(value.neg());
  if (value.lt(1)) return formatGermanNumber(value.toNumber(), 0, 2);
  if (value.lt(1000)) return formatGermanNumber(value.toNumber(), 0, value.toNumber() < 10 ? 2 : 0);

  if (value.layer === 0 && value.exponent < 15) {
    for (const { exponent, suffix } of LONG_SCALE_SUFFIXES) {
      if (value.exponent >= exponent) {
        const scaled = value.div(Decimal.pow(10, exponent)).toNumber();
        return formatGermanNumber(scaled, 0, 2) + suffix;
      }
    }
  }

  if (value.layer <= 1) return formatScientific(value);

  // Extrem seltener Fall: Zahl so groß, dass sogar der Exponent riesig ist
  // (Turm-Exponenten, "Layer"-Notation) — Fallback auf die Bibliotheksdarstellung.
  return value.toString();
}

/** Wie formatKnowledge, aber Wissen/Sekunde-Anzeigen bekommen IMMER exakt 2
 * Nachkommastellen (auch bei 0,05 oder 234,00), bis die Zahl groß genug für
 * die wissenschaftliche Notation ist. */
export function formatWissenProSekunde(value: Decimal): string {
  if (value.lt(0)) return "-" + formatWissenProSekunde(value.neg());
  if (value.lt(1000)) return formatGermanNumber(value.toNumber(), 2, 2);

  if (value.layer === 0 && value.exponent < 15) {
    for (const { exponent, suffix } of LONG_SCALE_SUFFIXES) {
      if (value.exponent >= exponent) {
        const scaled = value.div(Decimal.pow(10, exponent)).toNumber();
        return formatGermanNumber(scaled, 2, 2) + suffix;
      }
    }
  }

  if (value.layer <= 1) return formatScientific(value);
  return value.toString();
}

export function formatPercent(fraction: number, fractionDigits = 1): string {
  return (
    (fraction * 100).toLocaleString("de-DE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    }) + "%"
  );
}

export function formatInt(value: number): string {
  return Math.floor(value).toLocaleString("de-DE");
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  if (days > 0) return `${days}T ${hours}Std.`;
  if (hours > 0) return `${hours}Std. ${minutes}Min.`;
  if (minutes > 0) return `${minutes}Min. ${seconds}Sek.`;
  return `${seconds}Sek.`;
}
