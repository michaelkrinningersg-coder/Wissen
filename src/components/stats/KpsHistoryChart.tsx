import type { KpsHistoryPoint } from "../../game/types";

interface KpsHistoryChartProps {
  points: KpsHistoryPoint[];
}

/** Einfaches SVG-Liniendiagramm, logarithmische y-Achse (Idle-Werte spannen
 * viele Größenordnungen, linear würde die frühe Historie komplett flachdrücken). */
export function KpsHistoryChart({ points }: KpsHistoryChartProps) {
  if (points.length < 2) {
    return <div className="text-dim">Noch nicht genug Daten für ein Diagramm.</div>;
  }

  const width = 600;
  const height = 140;
  const values = points.map((p) => Math.log10(Math.max(0, p.kps) + 1));
  const minV = Math.min(...values);
  const maxV = Math.max(...values, minV + 1);
  const minT = points[0].t;
  const maxT = points[points.length - 1].t;
  const spanT = Math.max(1, maxT - minT);

  const path = points
    .map((p, i) => {
      const x = ((p.t - minT) / spanT) * width;
      const v = Math.log10(Math.max(0, p.kps) + 1);
      const y = height - ((v - minV) / (maxV - minV)) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="chart-wrap">
      <svg width={width} height={height} role="img" aria-label="Verlauf Wissen pro Sekunde über Zeit">
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} />
      </svg>
    </div>
  );
}
