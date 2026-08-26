import type { AttemptSnapshot } from "../../app/appTypes";
import type { AttemptComparison } from "../../domain/types";

export interface AttemptComparisonTableProps {
  initial: AttemptSnapshot;
  revised: AttemptSnapshot;
  comparison: AttemptComparison;
}

const met = (value: boolean): string => value ? "충족" : "미충족";
const signed = (value: number, unit: string): string => value === 0 ? "변화 없음" : `${value > 0 ? "+" : ""}${value}${unit}`;
const roleLoads = (snapshot: AttemptSnapshot): string => {
  const loads = snapshot.evaluation.metrics.roleLoadUnits;
  return `A ${loads.A} · B ${loads.B} · C ${loads.C}`;
};

export function AttemptComparisonTable({ initial, revised, comparison }: AttemptComparisonTableProps) {
  const initialMetrics = initial.evaluation.metrics;
  const revisedMetrics = revised.evaluation.metrics;
  const roleChange = ["A", "B", "C"].map((role) => revisedMetrics.roleLoadUnits[role as "A" | "B" | "C"] - initialMetrics.roleLoadUnits[role as "A" | "B" | "C"]);
  const rows = [
    ["전체 시간", `${initialMetrics.finishTime}단위`, `${revisedMetrics.finishTime}단위`, signed(comparison.finishDelta, "단위")],
    ["전체 대기", `${initialMetrics.totalWaitUnits}단위`, `${revisedMetrics.totalWaitUnits}단위`, signed(comparison.waitDelta, "단위")],
    ["안전 조건", met(initialMetrics.safetyMet), met(revisedMetrics.safetyMet), revisedMetrics.safetyMet ? "유지" : "잃음"],
    ["품질 조건", met(initialMetrics.qualityMet), met(revisedMetrics.qualityMet), revisedMetrics.qualityMet ? "유지" : "잃음"],
    ["역할 분포", roleLoads(initial), roleLoads(revised), roleChange.every((value) => value === 0) ? "변화 없음" : roleChange.map((value) => signed(value, "부하")).join(" · ")],
    ["목표 시간", initialMetrics.timeGoalMet ? "충족" : "미충족", revisedMetrics.timeGoalMet ? "충족" : "미충족", revisedMetrics.timeGoalMet === initialMetrics.timeGoalMet ? "변화 없음" : revisedMetrics.timeGoalMet ? "충족" : "미충족"],
  ] as const;
  return (
    <section className="attempt-comparison" aria-labelledby="attempt-comparison-title">
      <h3 id="attempt-comparison-title">최초 일정과 수정 일정 비교</h3>
      <table>
        <caption>최초 실행과 수정안 실행의 조건 비교</caption>
        <thead><tr><th scope="col">조건</th><th scope="col">최초 일정</th><th scope="col">수정 일정</th><th scope="col">변화</th></tr></thead>
        <tbody>{rows.map(([label, first, second, change]) => <tr key={label}><th scope="row">{label}</th><td>{first}</td><td>{second}</td><td>{change}</td></tr>)}</tbody>
      </table>
    </section>
  );
}
