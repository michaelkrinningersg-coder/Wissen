interface ProgressBarProps {
  fraction: number; // 0..1
}

export function ProgressBar({ fraction }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, fraction)) * 100;
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}
