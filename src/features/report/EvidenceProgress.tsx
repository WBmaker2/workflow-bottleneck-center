export interface EvidenceProgressProps {
  completed: number;
  total: number;
}
export function EvidenceProgress({ completed, total }: EvidenceProgressProps) {
  const safeTotal = Math.max(0, total);
  const safeCompleted = Math.min(Math.max(0, completed), safeTotal);
  const percentage = safeTotal === 0 ? 0 : Math.round((safeCompleted / safeTotal) * 100);
  return (
    <div
      className="evidence-progress"
      aria-label="근거 문장 진행률"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuenow={safeCompleted}
    >
      <span>근거 문장 진행률</span>
      <strong>{safeCompleted}/{safeTotal}</strong>
      <span className="evidence-progress__bar" aria-hidden="true">
        <span style={{ width: `${percentage}%` }} />
      </span>
    </div>
  );
}
