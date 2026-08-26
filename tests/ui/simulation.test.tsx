import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SimulationScreen } from "../../src/features/simulation/SimulationScreen";
import { getScenario } from "../../src/data/scenarios";
import type { AttemptSnapshot } from "../../src/app/appTypes";

const scenario = getScenario("science-display");
const snapshot: AttemptSnapshot = {
  draft: { entries: [], learnerEdges: [] },
  result: {
    runs: [
      { taskId: "verify-content", plannedStart: 0, actualStart: 0, end: 2, roleIds: ["A"] },
      { taskId: "prepare-print-file", plannedStart: 0, actualStart: 2, end: 4, roleIds: ["B"] },
      { taskId: "prepare-illustrations", plannedStart: 0, actualStart: 2, end: 5, roleIds: ["C"] },
    ],
    waits: [{ taskId: "prepare-print-file", from: 1, to: 2, reason: "dependency", blockerTaskId: "verify-content" }],
    finishTime: 5,
    omittedTaskIds: [],
    blockedTaskIds: [],
    issues: [],
  },
  bottlenecks: { criticalTaskIds: [], findings: [], totalWaitUnits: 1 },
  evaluation: {
    status: "successful",
    metrics: { finishTime: 5, totalWaitUnits: 1, roleLoadUnits: { A: 2, B: 2, C: 3 }, safetyMet: true, qualityMet: true, fairnessMet: true, timeGoalMet: true },
    violations: [],
    feedback: [],
  },
};

describe("simulation presentation", () => {
  it("reveals deterministic frames and pauses at the first wait", async () => {
    vi.useFakeTimers();
    render(<SimulationScreen scenario={scenario} snapshot={snapshot} reducedMotion={false} />);
    try {
      fireEvent.click(screen.getByRole("button", { name: "가상 실행 시작" }));
      await act(async () => { await vi.advanceTimersByTimeAsync(600); });
      expect(screen.getByText("가상 시간 1단위")).toBeVisible();
      expect(screen.getByRole("group", { name: "기다림 원인 예측" })).toBeVisible();
      expect(screen.getByRole("status")).toHaveTextContent(/기다림이 나타나 실행을 멈췄습니다/);
    } finally {
      vi.useRealTimers();
    }
  });

  it("uses static manual frames when reduced motion is requested", async () => {
    const intervalSpy = vi.spyOn(globalThis, "setInterval");
    const user = userEvent.setup();
    render(<SimulationScreen scenario={scenario} snapshot={snapshot} reducedMotion />);
    expect(screen.queryByRole("button", { name: "자동 재생" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "다음 단계" }));
    expect(screen.getByText("가상 시간 1단위 정지 화면")).toBeVisible();
    expect(intervalSpy).not.toHaveBeenCalled();
    intervalSpy.mockRestore();
  });

  it("gates analysis until a reason and Korean explanation are submitted", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<SimulationScreen scenario={scenario} snapshot={snapshot} reducedMotion onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "다음 단계" }));
    const group = screen.getByRole("group", { name: "기다림 원인 예측" });
    await user.click(within(group).getByRole("radio", { name: "먼저 끝날 작업을 기다림" }));
    await user.type(within(group).getByRole("textbox"), "앞 작업이 끝나기를 기다립니다");
    await user.click(within(group).getByRole("button", { name: "예측 저장" }));
    expect(onSubmit).toHaveBeenCalledWith("dependency", "앞 작업이 끝나기를 기다립니다");
    expect(screen.getByRole("button", { name: "분석으로 이동" })).toBeVisible();
  });
});
