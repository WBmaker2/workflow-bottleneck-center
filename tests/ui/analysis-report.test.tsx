import { describe, expect, it, vi } from "vitest";
import { createRef, useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import * as axeMatchers from "vitest-axe/matchers";
import { AnalysisScreen } from "../../src/features/analysis/AnalysisScreen";
import { RevisionScreen } from "../../src/features/revision/RevisionScreen";
import { getScenario } from "../../src/data/scenarios";
import type { AttemptSnapshot } from "../../src/app/appTypes";
import type { MissionAttempt } from "../../src/app/appTypes";
import type { ScheduleDraft } from "../../src/domain/types";
import { BottleneckPanel } from "../../src/features/analysis/BottleneckPanel";
import { EvidenceForm } from "../../src/features/report/EvidenceForm";
import { ReportScreen } from "../../src/features/report/ReportScreen";
import { ReportLearningWrapUp } from "../../src/features/report/ReportLearningWrapUp";

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
  it("shows learner-friendly evidence progress, examples, and report learning wrap-up", () => {
    const emptyAttempt = {
      scenarioId: scenario.id, stage: "report" as const, conditionsAcknowledged: true, relationEdges: [], draftSchedule: draft,
      initialSnapshot: null, prediction: null, predictionExplanation: "", selectedFindingId: null, revisedSchedule: null,
      revisedSnapshot: null, comparison: null,
      evidence: { dependencyExplanation: "", parallelExplanation: "", bottleneckExplanation: "", tradeoffExplanation: "" }, completed: false,
    } satisfies MissionAttempt;
    const { rerender } = render(<ReportScreen scenario={scenario} attempt={emptyAttempt} onEvidenceChange={() => undefined} onComplete={() => undefined} />);
    expect(screen.getByLabelText("근거 문장 진행률")).toHaveTextContent("0/4");
    expect(screen.getByLabelText("근거 문장 진행률").querySelector(".evidence-progress__bar > span")).toHaveStyle({ transform: "scaleX(0)" });
    expect(screen.getAllByText(/예시:/)).toHaveLength(4);
    expect(screen.getAllByText(/다음에 채울 칸/)).toHaveLength(4);
    expect(screen.getByRole("heading", { name: "오늘 배운 점" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "다음 도전" })).toBeVisible();
    const wrapUp = screen.getByRole("region", { name: "오늘 배운 점" });
    expect(within(wrapUp).getAllByText(/안전/).length).toBeGreaterThan(0);
    expect(within(wrapUp).getAllByText(/품질/).length).toBeGreaterThan(0);

    const completeAttempt = { ...emptyAttempt, evidence: {
      dependencyExplanation: "선행 관계를 충분히 설명한 문장입니다.",
      parallelExplanation: "병렬 관계를 충분히 설명한 문장입니다.",
      bottleneckExplanation: "표시된 병목이 없다는 사실을 설명합니다.",
      tradeoffExplanation: "안전 품질 역할 공정성을 함께 지킨 절충입니다.",
    } } satisfies MissionAttempt;
    rerender(<ReportScreen scenario={scenario} attempt={completeAttempt} onEvidenceChange={() => undefined} onComplete={() => undefined} />);
    expect(screen.getByLabelText("근거 문장 진행률")).toHaveTextContent("4/4");
    expect(screen.getByLabelText("근거 문장 진행률").querySelector(".evidence-progress__bar > span")).toHaveStyle({ transform: "scaleX(1)" });
    const completeButton = screen.getByRole("button", { name: "개선 보고서 완성" });
    expect(completeButton).toBeVisible();
    expect(screen.getByRole("region", { name: "오늘 배운 점" }).compareDocumentPosition(completeButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("moves each evidence hint to the first empty input", async () => {
    const user = userEvent.setup();
    render(<EvidenceForm scenario={scenario} attempt={{ evidence: { dependencyExplanation: "", parallelExplanation: "", bottleneckExplanation: "", tradeoffExplanation: "" }, selectedFindingId: "bottleneck-1" }} onChange={() => undefined} />);
    expect(screen.getByRole("group", { name: "병목 근거" })).toBeVisible();
    expect(screen.getByText("다음에 채울 칸: 선행 작업 선택")).toBeVisible();
    await user.selectOptions(screen.getByRole("combobox", { name: "선행 작업 선택" }), "verify-content");
    expect(screen.getByText("다음에 채울 칸: 시작 작업 선택")).toBeVisible();
    await user.selectOptions(screen.getByRole("combobox", { name: "시작 작업 선택" }), "prepare-print-file");
    expect(screen.getByText("다음에 채울 칸: 선행 이유 선택")).toBeVisible();
  });

  it("walks every evidence field in its declared order", async () => {
    const user = userEvent.setup();
    render(<EvidenceForm scenario={scenario} attempt={{ evidence: { dependencyExplanation: "", parallelExplanation: "", bottleneckExplanation: "", tradeoffExplanation: "" }, selectedFindingId: null, initialSnapshot: snapshot() }} onChange={() => undefined} />);

    const group = (name: string) => screen.getByRole("group", { name });
    const next = (groupName: string, label: string) => expect(within(group(groupName)).getByText(`다음에 채울 칸: ${label}`)).toBeVisible();
    const choose = async (label: string, value: string, nextLabel: string) => {
      await user.selectOptions(screen.getByRole("combobox", { name: label }), value);
      const groupName = label.startsWith("선행") || label.startsWith("시작") ? "선행 관계 근거" : label.startsWith("함께") || label.startsWith("병렬") ? "병렬 관계 근거" : label.startsWith("병목") || label.startsWith("기다림") ? "병목 근거" : "절충 근거";
      next(groupName, nextLabel);
    };

    next("선행 관계 근거", "선행 작업 선택");
    await choose("선행 작업 선택", "verify-content", "시작 작업 선택");
    await choose("시작 작업 선택", "prepare-print-file", "선행 이유 선택");
    await choose("선행 이유 선택", "품질을 확인하기 위해서", "선행 관계 설명");
    await user.type(screen.getByLabelText("선행 관계 설명"), "앞 결과가 필요하기 때문입니다");
    next("선행 관계 근거", "이 근거는 완성했습니다.");

    next("병렬 관계 근거", "함께 할 첫 작업");
    await choose("함께 할 첫 작업", "print-text", "함께 할 둘째 작업");
    await choose("함께 할 둘째 작업", "prepare-illustrations", "병렬 이유 선택");
    await choose("병렬 이유 선택", "서로 다른 역할로 진행할 수 있어서", "병렬 관계 설명");
    await user.type(screen.getByLabelText("병렬 관계 설명"), "두 역할이 서로 기다리지 않기 때문입니다");
    next("병렬 관계 근거", "이 근거는 완성했습니다.");

    next("병목 근거", "병목 원인 선택");
    await choose("병목 원인 선택", "bottleneck-1", "기다림 단위 선택");
    await choose("기다림 단위 선택", "2", "병목 근거 설명");
    await user.type(screen.getByLabelText("병목 근거 설명"), "프린터가 사용 중이었기 때문입니다");
    next("병목 근거", "이 근거는 완성했습니다.");

    next("절충 근거", "바꾼 작업 선택");
    await choose("바꾼 작업 선택", "print-text", "수정 전략 선택");
    await choose("수정 전략 선택", "순서 바꾸기", "시간/대기 변화 선택");
    await choose("시간/대기 변화 선택", "줄어들었", "조건 결과 선택");
    await choose("조건 결과 선택", "지켰", "절충 근거 설명");
    await user.type(screen.getByLabelText("절충 근거 설명"), "확인과 안전을 함께 지키기 위해서입니다");
    expect(screen.getAllByText("다음에 채울 칸: 이 근거는 완성했습니다.")).toHaveLength(4);
  });

  it("uses the three learner analysis terms without exposing technical path wording", async () => {
    render(<AnalysisScreen scenario={scenario} snapshot={snapshot()} prediction="resource" predictionExplanation="공유 도구를 기다렸습니다." selectedFindingId="bottleneck-1" onSelect={() => undefined} onBeginRevision={() => undefined} />);
    expect(screen.getByText("뒤 작업을 기다리게 만든 곳")).toBeVisible();
    expect(screen.getAllByText("긴 작업이 아니라 뒤 작업을 기다리게 만든 곳을 찾아보세요.")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "기다림의 원인" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "선택한 기다림의 원인" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "내가 먼저 예상한 이유" })).toBeVisible();
    expect(screen.queryByText(/인과·영향 경로/)).not.toBeInTheDocument();
  });

  it("recovers learning from both finding branches and every comparison condition", () => {
    const finding = snapshot().bottlenecks.findings[0]!;
    const comparison = { finishDelta: -2, waitDelta: -2, changedTaskIds: ["print-text"], preserved: { safety: false, quality: false, fairness: false }, summary: "조건을 확인합니다." };
    const { rerender } = render(<ReportLearningWrapUp scenario={scenario} comparison={comparison} selectedFinding={finding} hasRecordedWaits />);
    const wrapUp = screen.getByRole("region", { name: "오늘 배운 점" });
    expect(within(wrapUp).getAllByRole("listitem")).toHaveLength(3);
    expect(within(wrapUp).getByText("프린터 때문에 글 인쇄가 기다린 까닭을 찾아보았어요. 병목은 가장 오래 걸린 일이 아니라 뒤 작업을 기다리게 만든 원인이에요.")).toBeVisible();
    expect(within(wrapUp).getByText(/안전 확인·품질 확인·협력 방법/)).toBeVisible();
    rerender(<ReportLearningWrapUp scenario={scenario} comparison={null} selectedFinding={null} hasRecordedWaits={false} />);
    expect(screen.getByText("이번 실행에는 기다림을 만든 원인이 없었다는 기록도 흐름을 설명하는 근거예요.")).toBeVisible();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    rerender(<ReportLearningWrapUp scenario={scenario} comparison={null} selectedFinding={null} />);
    expect(screen.getByText("아직 병목을 선택하지 않았어요. 실행 기록의 기다림을 확인해 보세요.")).toBeVisible();
  });

  it("shows the four exact evidence prompts and rejects incomplete evidence with focus", async () => {
    const user = userEvent.setup();
    render(<EvidenceForm scenario={scenario} attempt={{ evidence: { dependencyExplanation: "", parallelExplanation: "", bottleneckExplanation: "", tradeoffExplanation: "" }, selectedFindingId: "bottleneck-1" }} onChange={() => undefined} />);
    expect(screen.getByText("___ 작업이 끝나야 ___ 작업을 시작할 수 있는 이유는 ___입니다.")).toBeVisible();
    expect(screen.getByText("___ 작업과 ___ 작업을 함께 할 수 있는 이유는 ___입니다.")).toBeVisible();
    expect(screen.getByText("___ 때문에 ___ 작업이 ___단위 기다렸습니다.")).toBeVisible();
    expect(screen.getByText("___을 바꾸어 시간/대기가 ___했고, 안전·품질·역할 공정성은 ___했습니다.")).toBeVisible();
    expect(screen.getAllByRole("combobox").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByLabelText("선행 관계 설명")).toHaveAttribute("maxlength", "180");
    await user.click(screen.getByRole("button", { name: "근거 문장 확인" }));
    expect(screen.getByRole("status")).toHaveTextContent("네 가지 근거 문장을 모두 완성하세요.");
    expect(screen.getByLabelText("선행 관계 설명")).toHaveFocus();
  });

  it("hydrates complete evidence, then clears only a section when its edit becomes invalid", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const persisted = "자료 확인 뒤 인쇄 글을 준비해야 품질을 지킬 수 있습니다.";
    render(<EvidenceForm scenario={scenario} attempt={{ evidence: { dependencyExplanation: persisted, parallelExplanation: persisted, bottleneckExplanation: persisted, tradeoffExplanation: persisted }, selectedFindingId: null }} onChange={onChange} />);
    expect(screen.getAllByText(new RegExp(`저장된 근거 문장: ${persisted}`))).toHaveLength(4);
    const dependencyText = screen.getByLabelText("선행 관계 설명");
    await user.type(dependencyText, "수정");
    expect(onChange).toHaveBeenLastCalledWith("dependencyExplanation", "");
    expect(onChange).not.toHaveBeenCalledWith("parallelExplanation", "");
    await user.click(screen.getByRole("button", { name: "근거 문장 확인" }));
    expect(screen.getByRole("status")).toHaveTextContent("네 가지 근거 문장을 모두 완성하세요.");
  });

  it("uses a real task and exactly zero units for an honest no-wait bottleneck sentence", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EvidenceForm scenario={scenario} attempt={{ evidence: { dependencyExplanation: "", parallelExplanation: "", bottleneckExplanation: "", tradeoffExplanation: "" }, selectedFindingId: null, initialSnapshot: { ...snapshot(), bottlenecks: { criticalTaskIds: [], findings: [], totalWaitUnits: 0 }, result: { ...snapshot().result, waits: [] } } }} onChange={onChange} />);
    expect(screen.getByText("이번 실행에는 표시된 병목과 기다림이 없습니다.")).toBeVisible();
    await user.selectOptions(screen.getByRole("combobox", { name: "기다림을 설명할 작업 선택" }), "verify-content");
    expect(screen.getByRole("combobox", { name: "기다림 단위 선택" })).toHaveValue("0");
    await user.type(screen.getByLabelText("병목 근거 설명"), "실제로 기다림이 없었기 때문입니다");
    expect(onChange).toHaveBeenLastCalledWith("bottleneckExplanation", expect.stringContaining("표시된 병목이 없기 때문에 자료 확인 작업이 0단위 기다렸습니다."));
    expect(onChange.mock.calls.some(([field, value]) => field === "bottleneckExplanation" && String(value).includes("WaitReason"))).toBe(false);
  });

  it("can complete a hydrated no-wait report without creating a finding or wait", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const noWait = snapshot({ bottlenecks: { criticalTaskIds: [], findings: [], totalWaitUnits: 0 }, result: { ...snapshot().result, waits: [] }, evaluation: { ...snapshot().evaluation, metrics: { ...snapshot().evaluation.metrics, timeGoalMet: true } } });
    const evidence = { dependencyExplanation: "선행 관계를 충분히 설명한 문장입니다.", parallelExplanation: "병렬 관계를 충분히 설명한 문장입니다.", bottleneckExplanation: "표시된 병목이 없다는 사실을 설명합니다.", tradeoffExplanation: "안전 품질 역할 공정성을 함께 지킨 절충입니다." };
    const attempt = { scenarioId: scenario.id, stage: "report", conditionsAcknowledged: true, relationEdges: [], draftSchedule: draft, initialSnapshot: noWait, prediction: null, predictionExplanation: "", selectedFindingId: null, revisedSchedule: draft, revisedSnapshot: noWait, comparison: { finishDelta: 0, waitDelta: 0, changedTaskIds: [], preserved: { safety: true, quality: true, fairness: true }, summary: "" }, evidence, completed: false } satisfies MissionAttempt;
    render(<ReportScreen scenario={scenario} attempt={attempt} onEvidenceChange={() => undefined} onComplete={onComplete} />);
    expect(noWait.result.waits).toHaveLength(0);
    expect(noWait.bottlenecks.findings).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: "개선 보고서 완성" }));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("keeps the clear trigger focusable and inert while saving is off", async () => {
    const user = userEvent.setup();
    const clear = vi.fn();
    const triggerRef = createRef<HTMLButtonElement>();
    render(<ReportScreen scenario={scenario} attempt={{ scenarioId: scenario.id, stage: "report", conditionsAcknowledged: true, relationEdges: [], draftSchedule: draft, initialSnapshot: null, prediction: null, predictionExplanation: "", selectedFindingId: null, revisedSchedule: null, revisedSnapshot: null, comparison: null, evidence: { dependencyExplanation: "", parallelExplanation: "", bottleneckExplanation: "", tradeoffExplanation: "" }, completed: false } satisfies MissionAttempt} saveEnabled={false} onEvidenceChange={() => undefined} onComplete={() => undefined} onClearSavedProgress={clear} clearTriggerRef={triggerRef} />);
    const trigger = screen.getByRole("button", { name: "저장된 진행 지우기" });
    expect(trigger).toHaveAttribute("aria-disabled", "true");
    await user.click(trigger);
    expect(clear).not.toHaveBeenCalled();
    trigger.focus();
    expect(document.activeElement).toBe(trigger);
  });

  it("shows the report flow, privacy-safe teacher summary, and print action", async () => {
    const user = userEvent.setup();
    const reportAttempt = {
      scenarioId: scenario.id, stage: "report", conditionsAcknowledged: true, relationEdges: [], draftSchedule: draft,
      initialSnapshot: snapshot(), prediction: null, predictionExplanation: "", selectedFindingId: null, revisedSchedule: draft,
      revisedSnapshot: snapshot(), comparison: { finishDelta: 0, waitDelta: 0, changedTaskIds: [], preserved: { safety: true, quality: true, fairness: true }, summary: "" },
      evidence: { dependencyExplanation: "자료 확인 뒤 인쇄 글을 준비해야 품질을 지킬 수 있습니다.", parallelExplanation: "글과 그림은 도구가 달라 함께 할 수 있습니다.", bottleneckExplanation: "이번 실행에는 기록된 기다림이 없어 병목이 없습니다.", tradeoffExplanation: "확인·휴식을 유지해 안전과 품질을 지켰습니다." }, completed: false,
    } satisfies MissionAttempt;
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
    render(<ReportScreen scenario={scenario} attempt={reportAttempt} onEvidenceChange={() => undefined} onComplete={() => undefined} />);
    expect(screen.getByRole("heading", { name: "개선 보고서" })).toBeVisible();
    expect(screen.getByText("최초 일정과 수정 일정 비교")).toBeVisible();
    expect(screen.getAllByText("이 결과는 교육용 가상 모델이며 실제 사람의 생산성 평가에 사용할 수 없습니다.")).toHaveLength(2);
    expect(screen.getByTestId("report-interactive")).toHaveClass("no-print");
    expect(screen.getByRole("region", { name: "교사용 요약" })).not.toHaveClass("no-print");
    expect(screen.getByRole("button", { name: "교사용 요약 인쇄" })).toHaveClass("no-print");
    expect(screen.getByRole("button", { name: "개선 보고서 완성" })).toHaveClass("no-print");
    await user.click(screen.getByRole("button", { name: "교사용 요약 인쇄" }));
    expect(print).toHaveBeenCalledOnce();
    print.mockRestore();
  });

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

  it("requires re-marking after a pending finding changes and shows that finding evidence", async () => {
    const user = userEvent.setup();
    const findings = [
      snapshot().bottlenecks.findings[0]!,
      { ...snapshot().bottlenecks.findings[0]!, id: "bottleneck-2", blockerLabel: "역할 B", delayUnits: 3, explanation: "역할 B를 기다려 그림 배치 준비가 3단위 늦어졌습니다.", affectedTaskIds: ["final-review"] },
    ];
    function Harness() {
      const [selected, setSelected] = useState<string | null>(null);
      return <AnalysisScreen scenario={scenario} snapshot={snapshot({ bottlenecks: { criticalTaskIds: ["print-text"], findings, totalWaitUnits: 5 } })} prediction="resource" predictionExplanation="공유 도구를 기다렸습니다." selectedFindingId={selected} onSelect={setSelected} onBeginRevision={() => undefined} />;
    }
    render(<Harness />);
    await user.click(screen.getByRole("radio", { name: /프린터를 2단위 기다림/ }));
    await user.click(screen.getByRole("button", { name: "병목 표시" }));
    expect(screen.getByRole("button", { name: "수정 시작" })).toBeVisible();
    await user.click(screen.getByRole("radio", { name: /역할 B를 3단위 기다림/ }));
    expect(screen.queryByRole("button", { name: "수정 시작" })).not.toBeInTheDocument();
    expect(screen.getByText(/역할 B를 기다려 그림 배치 준비가 3단위 늦어졌습니다/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "병목 표시" }));
    expect(screen.getByRole("button", { name: "수정 시작" })).toBeVisible();
  });

  it("uses scenario task titles instead of kebab-case IDs", () => {
    render(<BottleneckPanel scenario={scenario} analysis={snapshot().bottlenecks} selectedFindingId={null} onSelect={() => undefined} />);
    expect(screen.queryByText("print-text")).not.toBeInTheDocument();
    expect(screen.getAllByText(/글 인쇄/).length).toBeGreaterThan(0);
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
