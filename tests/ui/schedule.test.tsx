import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "vitest-axe";
import { ScheduleScreen } from "../../src/features/schedule/ScheduleScreen";
import { createInitialState } from "../../src/app/appReducer";
import { getScenario } from "../../src/data/scenarios";
import { requiredEdgesFromScenario } from "../../src/domain/scenarioValidation";
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

  it("has no automated accessibility violations", async () => {
    const scenario = getScenario("science-display");
    const { container } = render(<ScheduleScreen scenario={scenario} attempt={{ ...createInitialState().attempts[scenario.id]!, stage: "schedule", draftSchedule: { entries: [], learnerEdges: requiredEdgesFromScenario(scenario) } }} onChange={() => undefined} onRun={() => undefined} />);
    expect((await axe(container)).violations).toHaveLength(0);
  });
});
