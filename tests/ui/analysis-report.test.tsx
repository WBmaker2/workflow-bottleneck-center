import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import * as axeMatchers from "vitest-axe/matchers";
import { AnalysisScreen } from "../../src/features/analysis/AnalysisScreen";
import { RevisionScreen } from "../../src/features/revision/RevisionScreen";
import { getScenario } from "../../src/data/scenarios";
import type { AttemptSnapshot } from "../../src/app/appTypes";
import type { ScheduleDraft } from "../../src/domain/types";

expect.extend(axeMatchers);

const scenario = getScenario("science-display");
const draft: ScheduleDraft = {
  learnerEdges: [],
  entries: scenario.tasks.map((task) => ({
    taskId: task.id,
    plannedStart: 0,
    roleIds: scenario.roles.slice(0, task.peopleRequired).map(({ id }) => id),
  })),
};

const snapshot = (overrides: Partial<AttemptSnapshot> = {}): AttemptSnapshot => ({
  draft,
  result: {
    runs: [],
    waits: [{ taskId: "print-text", from: 2, to: 4, reason: "resource", resourceId: "printer" }],
    finishTime: 14,
    omittedTaskIds: [],
    blockedTaskIds: [],
    issues: [],
  },
  bottlenecks: {
    criticalTaskIds: ["prepare-print-file", "print-text"],
    totalWaitUnits: 2,
    findings: [{
      id: "bottleneck-1",
      type: "resource-wait",
      blockedTaskId: "print-text",
      blockerLabel: "프린터",
      delayUnits: 2,
      affectedTaskIds: ["attach-materials"],
      explanation: "프린터 사용을 기다려 글 인쇄가 2단위 늦어졌습니다.",
    }],
  },
  evaluation: {
    status: "successful",
    metrics: {
      finishTime: 14,
      totalWaitUnits: 2,
      roleLoadUnits: { A: 10, B: 8, C: 6 },
      safetyMet: true,
      qualityMet: true,
      fairnessMet: true,
      timeGoalMet: false,
    },
    violations: [],
    feedback: [],
  },
  ...overrides,
});

describe("analysis and revision learning flow", () => {
  it("marks a causal wait rather than the visually longest task", async () => {
    const user = userEvent.setup();
    render(<AnalysisScreen scenario={scenario} snapshot={snapshot()} prediction="resource" predictionExplanation="공유 도구를 기다렸습니다." selectedFindingId={null} onSelect={() => undefined} onBeginRevision={() => undefined} />);
    expect(screen.getByText("긴 작업이라고 모두 병목은 아닙니다.")).toBeVisible();
    expect(screen.queryByRole("radio", { name: /long-independent/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /프린터 사용을 기다려/ }));
    await user.click(screen.getByRole("button", { name: "병목 표시" }));
    expect(screen.getByRole("status")).toHaveTextContent(/이 대기가 뒤 작업의 시작을 늦췄습니다/);
    expect(screen.getAllByRole("button").filter((button) => button.dataset.pulse === "true")).toHaveLength(1);
  });

  it("renders an honest empty analysis and allows revision without a finding", async () => {
    const user = userEvent.setup();
    const onBeginRevision = vi.fn();
    render(<AnalysisScreen scenario={scenario} snapshot={snapshot({ bottlenecks: { criticalTaskIds: [], findings: [], totalWaitUnits: 0 }, result: { ...snapshot().result, waits: [], finishTime: 10 } })} prediction={null} predictionExplanation="" selectedFindingId={null} onSelect={() => undefined} onBeginRevision={onBeginRevision} />);
    expect(screen.getByText("이번 실행에서는 기록된 기다림이 없습니다.")).toBeVisible();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "수정 시작" }));
    expect(onBeginRevision).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "수정 시작" })).not.toHaveAttribute("data-pulse", "true");
  });

  it("shows all comparison rows and leads with lost safety/quality conditions", () => {
    const initial = snapshot();
    const revised = snapshot({ evaluation: { ...initial.evaluation, status: "incomplete", metrics: { ...initial.evaluation.metrics, finishTime: 12, totalWaitUnits: 0, safetyMet: false, qualityMet: false }, feedback: ["완료 조건이 충족되지 않았습니다: 최종 점검 작업이 빠졌습니다."], violations: [{ kind: "safety", message: "안전 필수 작업이 빠졌습니다." }, { kind: "quality", message: "최종 점검 작업이 빠졌습니다." }] } });
    const comparison = { finishDelta: -2, waitDelta: -2, changedTaskIds: ["final-review"], preserved: { safety: false, quality: false, fairness: true }, summary: "안전 조건, 품질 조건을 유지하지 못했습니다." };
    render(<RevisionScreen scenario={scenario} initialSnapshot={initial} revisedSchedule={draft} revisedSnapshot={revised} comparison={comparison} onChange={() => undefined} onCompare={() => undefined} onReport={() => undefined} />);
    expect(screen.getByRole("alert")).toHaveTextContent("완료 조건이 충족되지 않았습니다");
    expect(screen.getByText(/최종 점검 작업이 빠졌습니다/)).toBeVisible();
    expect(screen.queryByText(/2단위 빨라졌으므로 성공/)).not.toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(7);
    for (const label of ["전체 시간", "전체 대기", "안전 조건", "품질 조건", "역할 분포", "목표 시간"]) expect(within(table).getByRole("rowheader", { name: label })).toBeVisible();
    for (const label of ["최초 일정", "수정 일정", "변화"]) expect(within(table).getByRole("columnheader", { name: label })).toBeVisible();
  });

  it("keeps the analysis semantics accessible", async () => {
    const { container } = render(<AnalysisScreen scenario={scenario} snapshot={snapshot()} prediction="resource" predictionExplanation="공유 도구를 기다렸습니다." selectedFindingId={null} onSelect={() => undefined} onBeginRevision={() => undefined} />);
    expect((await axe(container)).violations).toHaveLength(0);
  });
});
