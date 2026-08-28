import { describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "vitest-axe";
import { ScheduleScreen } from "../../src/features/schedule/ScheduleScreen";
import { appReducer, createInitialState } from "../../src/app/appReducer";
import { getScenario } from "../../src/data/scenarios";
import { requiredEdgesFromScenario } from "../../src/domain/scenarioValidation";
import { scheduleStartUpperBound } from "../../src/domain/scheduleBounds";
import { encodeProgress, decodeProgress } from "../../src/storage/progressCodec";
import { rehydrateProgress } from "../../src/storage/progressCodec";
import { TimelineStepList } from "../../src/features/schedule/TimelineStepList";
import { TimelineGrid } from "../../src/features/schedule/TimelineGrid";
import { App } from "../../src/App";
import type { AttemptSnapshot } from "../../src/app/appTypes";
import type { ScheduleDraft, ScheduleEntry } from "../../src/domain/types";

const renderScheduleScreen = (scenarioId: "science-display" = "science-display") => {
  const scenario = getScenario(scenarioId);
  function Fixture() {
    const [draft, setDraft] = useState<ScheduleDraft>({ entries: [], learnerEdges: requiredEdgesFromScenario(scenario) });
    const attempt = {
      ...createInitialState().attempts[scenario.id]!,
      stage: "schedule" as const,
      conditionsAcknowledged: true,
      relationEdges: requiredEdgesFromScenario(scenario),
      draftSchedule: draft,
    };
    return <ScheduleScreen scenario={scenario} attempt={attempt} onChange={setDraft} onRun={() => undefined} />;
  }
  render(<Fixture />);
}

const completeEntries = (scenarioId: "science-display" = "science-display"): ScheduleEntry[] => {
  const scenario = getScenario(scenarioId);
  let plannedStart = 0;
  return scenario.tasks.map((task) => {
    const entry = {
    taskId: task.id,
    plannedStart,
    roleIds: scenario.roles.slice(0, task.peopleRequired).map(({ id }) => id),
    };
    plannedStart += task.duration;
    return entry;
  });
};

describe("keyboard-first schedule editor", () => {
  it("starts with the step list on a small viewport and can switch to the grid", async () => {
    const user = userEvent.setup();
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === "(max-width: 600px)",
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    try {
      renderScheduleScreen();
      expect(screen.getByRole("heading", { name: "단계 목록 보기" })).toBeVisible();
      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "시간표 보기" }));
      expect(screen.getByRole("grid")).toBeVisible();
      expect(screen.getByText("옆으로 움직여 시간 보기")).toBeVisible();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it("starts with the grid on a desktop viewport and switches back to the step list", async () => {
    const user = userEvent.setup();
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    try {
      renderScheduleScreen();
      expect(screen.getByRole("grid")).toBeVisible();
      expect(screen.queryByRole("heading", { name: "단계 목록 보기" })).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "단계 목록 보기" }));
      expect(screen.getByRole("heading", { name: "단계 목록 보기" })).toBeVisible();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it("keeps native task and start selects keyboard-operable", async () => {
    const user = userEvent.setup();
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    try {
      renderScheduleScreen();
      const taskSelect = screen.getByLabelText("배치할 작업");
      const startSelect = screen.getByLabelText("시작 시점");
      const gridSwitch = screen.getByRole("button", { name: "시간표 보기" });
      const listSwitch = screen.getByRole("button", { name: "단계 목록 보기" });
      const firstRole = screen.getByRole("checkbox", { name: "역할 A" });
      const placeButton = screen.getByRole("button", { name: "일정에 배치" });
      await user.tab();
      expect(gridSwitch).toHaveFocus();
      await user.tab();
      expect(listSwitch).toHaveFocus();
      await user.tab();
      expect(taskSelect).toHaveFocus();
      await user.selectOptions(taskSelect, "verify-content");
      await user.tab();
      expect(startSelect).toHaveFocus();
      await user.tab();
      expect(firstRole).toHaveFocus();
      await user.keyboard(" ");
      expect(firstRole).toBeChecked();
      await user.tab();
      expect(placeButton).toHaveFocus();
      await user.selectOptions(startSelect, "1");
      expect(startSelect).toHaveValue("1");
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it("explains roles as assigned places and asks for an easy start time", () => {
    renderScheduleScreen();
    expect(screen.getByText(/역할 A·B·C는 능력 이름이 아니라 맡은 자리 이름입니다/)).toBeVisible();
    expect(screen.getByText("몇 단위부터 시작할까요?")).toBeVisible();
  });

  it("places a task by task, start, and role selection", async () => {
    const user = userEvent.setup();
    renderScheduleScreen();
    await user.selectOptions(screen.getByLabelText("배치할 작업"), "verify-content");
    await user.selectOptions(screen.getByLabelText("시작 시점"), "0");
    await user.click(screen.getByRole("checkbox", { name: "역할 A" }));
    await user.click(screen.getByRole("button", { name: "일정에 배치" }));
    expect(screen.getByRole("row", { name: /0단위 자료 확인 역할 A/ })).toBeVisible();
  });

  it("requires exactly the task's people count and announces remaining roles", async () => {
    const user = userEvent.setup();
    renderScheduleScreen();
    await user.selectOptions(screen.getByLabelText("배치할 작업"), "attach-materials");
    expect(screen.getByText(/역할 2명이 필요합니다/)).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("2명 더 선택하세요");
    await user.click(screen.getByRole("checkbox", { name: "역할 A" }));
    expect(screen.getByRole("status")).toHaveTextContent("1명 더 선택하세요");
    expect(screen.getByRole("button", { name: "일정에 배치" })).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "역할 B" }));
    expect(screen.getByRole("button", { name: "일정에 배치" })).toBeEnabled();
  });

  it("replaces an existing task rather than duplicating it and can delete it", async () => {
    const user = userEvent.setup();
    renderScheduleScreen();
    const task = screen.getByLabelText("배치할 작업");
    await user.selectOptions(task, "verify-content");
    await user.selectOptions(screen.getByLabelText("시작 시점"), "0");
    await user.click(screen.getByRole("checkbox", { name: "역할 A" }));
    await user.click(screen.getByRole("button", { name: "일정에 배치" }));
    await user.selectOptions(screen.getByLabelText("시작 시점"), "3");
    await user.click(screen.getByRole("button", { name: "일정에 배치" }));
    expect(screen.getAllByRole("row", { name: /자료 확인/ })).toHaveLength(1);
    expect(screen.getByRole("row", { name: /3단위 자료 확인/ })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "자료 확인 일정 삭제" }));
    expect(screen.queryByRole("row", { name: /자료 확인/ })).not.toBeInTheDocument();
  });

  it("offers integer starts from zero through the duration upper bound", async () => {
    renderScheduleScreen();
    const starts = screen.getByLabelText("시작 시점");
    const options = within(starts).getAllByRole("option");
    const scenario = getScenario("science-display");
    const max = scenario.timeGoal + scenario.tasks.reduce((sum, task) => sum + task.duration, 0);
    expect(options[0]).toHaveValue("0");
    expect(options.at(-1)).toHaveValue(String(max));
    expect(options).toHaveLength(max + 1);
    expect(options.every((option) => /^\d+$/.test(option.getAttribute("value") ?? ""))).toBe(true);
  });

  it("keeps timeline and step list semantically equivalent", async () => {
    const scenario = getScenario("science-display");
    const entries = completeEntries();
    render(
      <ScheduleScreen scenario={scenario} attempt={{ ...createInitialState().attempts[scenario.id]!, stage: "schedule", draftSchedule: { entries, learnerEdges: requiredEdgesFromScenario(scenario) } }} onChange={() => undefined} onRun={() => undefined} />,
    );
    expect(screen.getByRole("columnheader", { name: "시간 0" })).toBeVisible();
    const gridTitles = screen.getAllByRole("row").map((row) => row.textContent).filter(Boolean).join(" ");
    await userEvent.setup().click(screen.getByRole("button", { name: "단계 목록 보기" }));
    expect(screen.getByRole("heading", { name: /시간 0/ })).toBeVisible();
    expect(screen.getByText("함께 진행 가능 여부는 역할·도구 조건에 따라 실행에서 확인합니다.")).toBeVisible();
    const listTitles = screen.getAllByRole("listitem").map((item) => item.textContent).filter(Boolean).join(" ");
    for (const task of scenario.tasks) expect(gridTitles).toContain(task.title);
    expect(listTitles).toContain("자료 확인");
    expect(listTitles).toContain("2단위");
  });

  it("supports drag as an enhancement without making the form depend on it", async () => {
    const scenario = getScenario("science-display");
    const entries = completeEntries();
    const onChange = vi.fn();
    const onMove = vi.fn();
    render(<ScheduleScreen scenario={scenario} attempt={{ ...createInitialState().attempts[scenario.id]!, stage: "schedule", draftSchedule: { entries, learnerEdges: requiredEdgesFromScenario(scenario) } }} onChange={onChange} onMove={onMove} onRun={() => undefined} />);
    const chip = screen.getByText("자료 확인", { selector: "button" });
    const cell = screen.getByRole("gridcell", { name: "시간 4 역할 A" });
    const data = { getData: () => "verify-content", setData: () => undefined, effectAllowed: "move" };
    fireEvent.dragStart(chip, { dataTransfer: data });
    fireEvent.drop(cell, { dataTransfer: data });
    expect(onMove).toHaveBeenCalledWith("verify-content", 4);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ignores unknown and out-of-bound drag payloads", () => {
    const scenario = getScenario("science-display");
    const entries = completeEntries();
    const onMove = vi.fn();
    render(<ScheduleScreen scenario={scenario} attempt={{ ...createInitialState().attempts[scenario.id]!, stage: "schedule", draftSchedule: { entries, learnerEdges: requiredEdgesFromScenario(scenario) } }} onChange={() => undefined} onMove={onMove} onRun={() => undefined} />);
    const chip = screen.getByText("자료 확인", { selector: "button" });
    const cell = screen.getByRole("gridcell", { name: "시간 4 역할 A" });
    const unknown = { getData: () => "not-a-task", setData: () => undefined, effectAllowed: "move" };
    fireEvent.dragStart(chip, { dataTransfer: unknown });
    fireEvent.drop(cell, { dataTransfer: unknown });
    expect(onMove).not.toHaveBeenCalled();
    expect(screen.queryByRole("gridcell", { name: `시간 ${scheduleStartUpperBound(scenario) + 1} 역할 A` })).not.toBeInTheDocument();
  });

  it("stores selected roles in scenario order regardless of click order", async () => {
    const user = userEvent.setup();
    const scenario = getScenario("science-display");
    const onChange = vi.fn();
    render(<ScheduleScreen scenario={scenario} attempt={{ ...createInitialState().attempts[scenario.id]!, stage: "schedule", draftSchedule: { entries: [], learnerEdges: requiredEdgesFromScenario(scenario) } }} onChange={onChange} onRun={() => undefined} />);
    await user.selectOptions(screen.getByLabelText("배치할 작업"), "attach-materials");
    await user.click(screen.getByRole("checkbox", { name: "역할 B" }));
    await user.click(screen.getByRole("checkbox", { name: "역할 A" }));
    await user.click(screen.getByRole("button", { name: "일정에 배치" }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ entries: [{ taskId: "attach-materials", plannedStart: 0, roleIds: ["A", "B"] }] }));
  });

  it("shows a multi-role task in every assigned role row without duplicate actions", () => {
    const scenario = getScenario("science-display");
    const entries = completeEntries().map((entry) => entry.taskId === "attach-materials" ? { ...entry, plannedStart: 0, roleIds: ["A", "B"] as const } : entry);
    render(<ScheduleScreen scenario={scenario} attempt={{ ...createInitialState().attempts[scenario.id]!, stage: "schedule", draftSchedule: { entries, learnerEdges: requiredEdgesFromScenario(scenario) } }} onChange={() => undefined} onRun={() => undefined} />);
    expect(screen.getByRole("row", { name: /0단위 글과 그림 부착 .*역할 A/ })).toBeVisible();
    expect(screen.getByRole("row", { name: /0단위 글과 그림 부착 .*역할 B/ })).toBeVisible();
    expect(screen.getAllByRole("button", { name: "글과 그림 부착 일정 삭제" })).toHaveLength(1);
  });

  it("rejects learner progress at upper bound plus one", () => {
    const state = createInitialState();
    const encoded = encodeProgress(state);
    const malformed = JSON.parse(JSON.stringify(encoded)) as typeof encoded;
    const scenario = getScenario("science-display");
    malformed.attempts[scenario.id].draftSchedule.entries = [{ taskId: "verify-content", plannedStart: scheduleStartUpperBound(scenario) + 1, roleIds: ["A"] }];
    expect(decodeProgress(JSON.stringify(malformed))).toBeNull();
  });

  it("saves the complete App schedule snapshot before entering simulation", async () => {
    const user = userEvent.setup();
    const scenario = getScenario("science-display");
    render(<App />);
    await user.click(screen.getByRole("button", { name: "조건 확인" }));
    for (const edge of requiredEdgesFromScenario(scenario)) {
      await user.selectOptions(screen.getByLabelText("다음에 시작할 작업"), "");
      await user.selectOptions(screen.getByLabelText("먼저 끝낼 작업"), edge.beforeTaskId);
      await user.selectOptions(screen.getByLabelText("다음에 시작할 작업"), edge.afterTaskId);
      await user.click(screen.getByRole("button", { name: "관계 연결" }));
    }
    await user.click(screen.getByRole("button", { name: "관계 확인" }));
    let start = 0;
    for (const task of scenario.tasks) {
      await user.selectOptions(screen.getByLabelText("배치할 작업"), task.id);
      await user.selectOptions(screen.getByLabelText("시작 시점"), String(start));
      for (const role of scenario.roles.slice(0, task.peopleRequired)) await user.click(screen.getByRole("checkbox", { name: role.label }));
      await user.click(screen.getByRole("button", { name: "일정에 배치" }));
      start += task.duration;
    }
    await user.click(screen.getByRole("button", { name: "실행" }));
    expect(screen.getByText("현재 단계: 가상 실행")).toBeVisible();
    expect(screen.queryByText(/저장하지 못했|먼저 조건을 확인/)).not.toBeInTheDocument();
  });

  it("accepts schedule-stage initial snapshot only when it matches a complete current draft", () => {
    const scenario = getScenario("science-display");
    const entries = completeEntries();
    const edges = requiredEdgesFromScenario(scenario);
    const draft = { entries, learnerEdges: edges };
    const base = createInitialState();
    const scheduleState = { ...base, attempts: { ...base.attempts, [scenario.id]: { ...base.attempts[scenario.id]!, stage: "schedule" as const, conditionsAcknowledged: true, relationEdges: edges, draftSchedule: draft } } };
    const snapshot = { draft, result: { runs: [], waits: [], finishTime: 0, omittedTaskIds: [], blockedTaskIds: [], issues: [] }, bottlenecks: { criticalTaskIds: [], findings: [], totalWaitUnits: 0 }, evaluation: { status: "successful" as const, metrics: { finishTime: 0, totalWaitUnits: 0, roleLoadUnits: { A: 0, B: 0, C: 0 }, safetyMet: true, qualityMet: true, fairnessMet: true, timeGoalMet: true }, violations: [], feedback: [] } };
    const saved = appReducer(scheduleState, { type: "SAVE_INITIAL_SNAPSHOT", snapshot });
    expect(saved.attempts[scenario.id]!.initialSnapshot).not.toBeNull();
    const mismatch = appReducer(scheduleState, { type: "SAVE_INITIAL_SNAPSHOT", snapshot: { ...snapshot, draft: { ...draft, entries: entries.slice(1) } } });
    expect(mismatch.attempts[scenario.id]!.initialSnapshot).toBeNull();
  });

  it("canonicalizes reversed roles at the reducer and snapshot boundary", () => {
    const scenario = getScenario("science-display");
    const edges = requiredEdgesFromScenario(scenario);
    const entries = completeEntries().map((entry) => entry.taskId === "attach-materials" ? { ...entry, roleIds: ["B", "A"] as const } : entry);
    const state = createInitialState();
    const scheduleState = { ...state, attempts: { ...state.attempts, [scenario.id]: { ...state.attempts[scenario.id]!, stage: "schedule" as const, conditionsAcknowledged: true, relationEdges: edges, draftSchedule: { entries: [], learnerEdges: edges } } } };
    const set = appReducer(scheduleState, { type: "SET_DRAFT_SCHEDULE", draft: { entries, learnerEdges: edges } });
    expect(set.attempts[scenario.id]!.draftSchedule.entries.find((entry) => entry.taskId === "attach-materials")?.roleIds).toEqual(["A", "B"]);
    const canonicalEntries = entries.map((entry) => entry.taskId === "attach-materials" ? { ...entry, roleIds: ["A", "B"] as const } : entry);
    const snapshot: AttemptSnapshot = {
      draft: { entries, learnerEdges: edges },
      result: { runs: [], waits: [], finishTime: 0, omittedTaskIds: [], blockedTaskIds: [], issues: [] },
      bottlenecks: { criticalTaskIds: [], findings: [], totalWaitUnits: 0 },
      evaluation: { status: "successful", metrics: { finishTime: 0, totalWaitUnits: 0, roleLoadUnits: { A: 0, B: 0, C: 0 }, safetyMet: true, qualityMet: true, fairnessMet: true, timeGoalMet: true }, violations: [], feedback: [] },
    };
    const current = { ...scheduleState, attempts: { ...scheduleState.attempts, [scenario.id]: { ...scheduleState.attempts[scenario.id]!, draftSchedule: { entries: canonicalEntries, learnerEdges: edges } } } };
    const saved = appReducer(current, { type: "SAVE_INITIAL_SNAPSHOT", snapshot });
    expect(saved.attempts[scenario.id]!.initialSnapshot?.draft.entries.find((entry) => entry.taskId === "attach-materials")?.roleIds).toEqual(["A", "B"]);
    const canonicalSaved = appReducer(current, { type: "SAVE_INITIAL_SNAPSHOT", snapshot: { ...snapshot, draft: { entries: canonicalEntries, learnerEdges: edges } } });
    expect(saved.attempts[scenario.id]!.initialSnapshot).toEqual(canonicalSaved.attempts[scenario.id]!.initialSnapshot);
  });

  it("canonicalizes reversed roles through progress decode, rehydrate, and encode", () => {
    const scenario = getScenario("science-display");
    const state = createInitialState();
    const reversed = completeEntries().map((entry) => entry.taskId === "attach-materials" ? { ...entry, roleIds: ["B", "A"] as const } : entry);
    const progress = encodeProgress({ ...state, attempts: { ...state.attempts, [scenario.id]: { ...state.attempts[scenario.id]!, draftSchedule: { entries: reversed, learnerEdges: requiredEdgesFromScenario(scenario) } } } });
    const persisted = JSON.parse(JSON.stringify(progress)) as typeof progress;
    persisted.attempts[scenario.id].draftSchedule.entries.find((entry) => entry.taskId === "attach-materials")!.roleIds = ["B", "A"];
    const decoded = decodeProgress(JSON.stringify(persisted));
    expect(decoded?.attempts[scenario.id]?.draftSchedule.entries.find((entry) => entry.taskId === "attach-materials")?.roleIds).toEqual(["A", "B"]);
    const roundTrip = encodeProgress(rehydrateProgress(decoded!));
    expect(roundTrip.attempts[scenario.id].draftSchedule.entries.find((entry) => entry.taskId === "attach-materials")?.roleIds).toEqual(["A", "B"]);
  });

  it("keeps invalid role assignments invalid at the persisted boundary", () => {
    const scenario = getScenario("science-display");
    const progress = encodeProgress({ ...createInitialState(), saveEnabled: true });
    const malformed = JSON.parse(JSON.stringify(progress)) as typeof progress;
    malformed.attempts[scenario.id].draftSchedule.entries = [{ taskId: "attach-materials", plannedStart: 0, roleIds: ["A", "A"] }];
    expect(decodeProgress(JSON.stringify(malformed))).toBeNull();
  });

  it("keeps list and grid output stable for reversed role input", () => {
    const scenario = getScenario("science-display");
    const canonical = completeEntries();
    const reversed = canonical.map((entry) => entry.taskId === "attach-materials" ? { ...entry, roleIds: ["B", "A"] as const } : entry);
    const listCanonical = render(<TimelineStepList scenario={scenario} entries={canonical} />).container.textContent;
    cleanup();
    const listReversed = render(<TimelineStepList scenario={scenario} entries={reversed} />).container.textContent;
    expect(listReversed).toBe(listCanonical);
    cleanup();
    const { container: gridCanonical } = render(<TimelineGrid scenario={scenario} entries={canonical} onMove={() => undefined} />);
    const canonicalButtons = [...gridCanonical.querySelectorAll("button")].map((button) => button.getAttribute("aria-label"));
    cleanup();
    const { container: gridReversed } = render(<TimelineGrid scenario={scenario} entries={reversed} onMove={() => undefined} />);
    expect([...gridReversed.querySelectorAll("button")].map((button) => button.getAttribute("aria-label"))).toEqual(canonicalButtons);
  });

  it("shows exactly one schedule pulse and runs only a complete draft", async () => {
    const user = userEvent.setup();
    const scenario = getScenario("science-display");
    const onRun = vi.fn();
    const { rerender } = render(<ScheduleScreen scenario={scenario} attempt={{ ...createInitialState().attempts[scenario.id]!, stage: "schedule", draftSchedule: { entries: [], learnerEdges: requiredEdgesFromScenario(scenario) } }} onChange={() => undefined} onRun={onRun} />);
    expect(document.querySelectorAll("[data-pulse='true']")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "실행" }));
    expect(onRun).not.toHaveBeenCalled();
    rerender(<ScheduleScreen scenario={scenario} attempt={{ ...createInitialState().attempts[scenario.id]!, stage: "schedule", draftSchedule: { entries: completeEntries(), learnerEdges: requiredEdgesFromScenario(scenario) } }} onChange={() => undefined} onRun={onRun} />);
    await user.click(screen.getByRole("button", { name: "실행" }));
    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it("preserves the reusable revision action hook and label", () => {
    const scenario = getScenario("science-display");
    const entries = completeEntries();
    render(<ScheduleScreen scenario={scenario} attempt={{ ...createInitialState().attempts[scenario.id]!, stage: "revision", draftSchedule: { entries, learnerEdges: requiredEdgesFromScenario(scenario) }, revisedSchedule: { entries, learnerEdges: requiredEdgesFromScenario(scenario) } }} onChange={() => undefined} onRun={() => undefined} />);
    expect(screen.getByRole("button", { name: "수정안 실행·비교" })).toHaveAttribute("data-pulse", "true");
    expect(document.querySelectorAll("[data-pulse='true']")).toHaveLength(1);
  });

  it("has no automated accessibility violations", async () => {
    const scenario = getScenario("science-display");
    const { container } = render(<ScheduleScreen scenario={scenario} attempt={{ ...createInitialState().attempts[scenario.id]!, stage: "schedule", draftSchedule: { entries: [], learnerEdges: requiredEdgesFromScenario(scenario) } }} onChange={() => undefined} onRun={() => undefined} />);
    expect((await axe(container)).violations).toHaveLength(0);
  });
});
