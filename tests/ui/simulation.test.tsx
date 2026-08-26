import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { SimulationScreen } from "../../src/features/simulation/SimulationScreen";
import { usePrefersReducedMotion } from "../../src/a11y/usePrefersReducedMotion";
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

const withResult = (result: Partial<AttemptSnapshot["result"]>): AttemptSnapshot => ({
  ...snapshot,
  result: { ...snapshot.result, ...result },
});

function MotionProbe() {
  const reduced = usePrefersReducedMotion();
  return <output>{reduced ? "reduce" : "full"}</output>;
}

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

  it("keeps the earliest wait gate through StrictMode and hides engine reason before submit", () => {
    const earliest = withResult({ waits: [
      { taskId: "prepare-print-file", from: 0, to: 2, reason: "resource", resourceId: "printer" },
      { taskId: "prepare-illustrations", from: 0, to: 2, reason: "role", roleId: "A" },
    ] });
    render(<StrictMode><SimulationScreen scenario={scenario} snapshot={earliest} reducedMotion /></StrictMode>);
    fireEvent.click(screen.getByRole("button", { name: "다음 단계" }));
    expect(screen.getByRole("group", { name: "기다림 원인 예측" })).toBeVisible();
    expect(screen.getByRole("status")).not.toHaveTextContent(/기다리고 있습니다/);
    expect(screen.queryByText(/실행 기록:/)).not.toBeInTheDocument();
  });

  it("detects a time-zero wait on the first normal play step", () => {
    vi.useFakeTimers();
    const zeroWait = withResult({ waits: [{ taskId: "prepare-print-file", from: 0, to: 1, reason: "resource", resourceId: "printer" }] });
    render(<SimulationScreen scenario={scenario} snapshot={zeroWait} reducedMotion={false} />);
    try {
      fireEvent.click(screen.getByRole("button", { name: "가상 실행 시작" }));
      expect(screen.getByRole("group", { name: "기다림 원인 예측" })).toBeVisible();
      expect(screen.getByRole("status")).toHaveTextContent("기다림이 나타나 실행을 멈췄습니다.");
    } finally {
      vi.useRealTimers();
    }
  });

  it("uses one prediction submission for simultaneous earliest waits", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const simultaneous = withResult({ waits: [
      { taskId: "prepare-print-file", from: 1, to: 2, reason: "resource", resourceId: "printer" },
      { taskId: "prepare-illustrations", from: 1, to: 2, reason: "role", roleId: "A" },
    ] });
    render(<SimulationScreen scenario={scenario} snapshot={simultaneous} reducedMotion onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "다음 단계" }));
    const group = screen.getByRole("group", { name: "기다림 원인 예측" });
    await user.click(within(group).getByRole("radio", { name: "한정된 도구를 기다림" }));
    await user.type(within(group).getByRole("textbox"), "도구가 사용 중이라 기다립니다");
    await user.click(within(group).getByRole("button", { name: "예측 저장" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("group", { name: "기다림 원인 예측" })).not.toBeInTheDocument();
  });

  it("requires ten Korean syllables, not ten trimmed characters", async () => {
    const user = userEvent.setup();
    render(<SimulationScreen scenario={scenario} snapshot={snapshot} reducedMotion />);
    await user.click(screen.getByRole("button", { name: "다음 단계" }));
    const group = screen.getByRole("group", { name: "기다림 원인 예측" });
    await user.click(within(group).getByRole("radio", { name: "먼저 끝날 작업을 기다림" }));
    const explanation = within(group).getByRole("textbox");
    await user.type(explanation, "기다림원인은앞작업9");
    expect(within(group).getByRole("button", { name: "예측 저장" })).toBeDisabled();
    await user.clear(explanation);
    await user.type(explanation, "기다림원인은앞작업입니다");
    expect(within(group).getByRole("button", { name: "예측 저장" })).toBeEnabled();
  });

  it("allows zero-wait completion to analysis without a prediction callback", async () => {
    const onSubmit = vi.fn();
    const onAnalysis = vi.fn();
    const user = userEvent.setup();
    const noWait = withResult({ waits: [], finishTime: 1, runs: [{ taskId: "verify-content", plannedStart: 0, actualStart: 0, end: 1, roleIds: ["A"] }] });
    render(<SimulationScreen scenario={scenario} snapshot={noWait} reducedMotion onSubmit={onSubmit} onEnterAnalysis={onAnalysis} />);
    await user.click(screen.getByRole("button", { name: "다음 단계" }));
    expect(screen.getByRole("button", { name: "분석으로 이동" })).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "분석으로 이동" }));
    expect(onAnalysis).toHaveBeenCalledTimes(1);
  });

  it("announces a manual pause once and announces completion", async () => {
    vi.useFakeTimers();
    const noWait = withResult({ waits: [], finishTime: 1, runs: [{ taskId: "verify-content", plannedStart: 0, actualStart: 0, end: 1, roleIds: ["A"] }] });
    render(<SimulationScreen scenario={scenario} snapshot={noWait} reducedMotion={false} />);
    try {
      fireEvent.click(screen.getByRole("button", { name: "가상 실행 시작" }));
      fireEvent.click(screen.getByRole("button", { name: "일시 정지" }));
      expect(screen.getByRole("status")).toHaveTextContent("실행이 일시 정지되었습니다.");
      fireEvent.click(screen.getByRole("button", { name: "가상 실행 시작" }));
      await act(async () => { await vi.advanceTimersByTimeAsync(600); });
      expect(screen.getByRole("status")).toHaveTextContent("가상 실행이 끝났습니다.");
    } finally {
      vi.useRealTimers();
    }
  });

  it("completes a zero-time, zero-wait snapshot in both motion modes", async () => {
    const onAnalysis = vi.fn();
    const user = userEvent.setup();
    const zero = withResult({ waits: [], finishTime: 0, runs: [] });
    const { rerender } = render(<SimulationScreen scenario={scenario} snapshot={zero} reducedMotion onEnterAnalysis={onAnalysis} />);
    await user.click(screen.getByRole("button", { name: "다음 단계" }));
    expect(screen.getByRole("button", { name: "분석으로 이동" })).toBeVisible();
    rerender(<SimulationScreen key="normal" scenario={scenario} snapshot={zero} reducedMotion={false} onEnterAnalysis={onAnalysis} />);
    fireEvent.click(screen.getByRole("button", { name: "가상 실행 시작" }));
    expect(screen.getByRole("button", { name: "분석으로 이동" })).toBeVisible();
  });

  it("subscribes and cleans up matchMedia change listeners", () => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const media = { matches: true, addEventListener: vi.fn((_name: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener)), removeEventListener: vi.fn((_name: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener)) } as unknown as MediaQueryList;
    const original = window.matchMedia;
    window.matchMedia = vi.fn(() => media);
    const { unmount } = render(<MotionProbe />);
    expect(screen.getByText("reduce")).toBeVisible();
    expect(media.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    act(() => { for (const listener of listeners) listener({ matches: false } as MediaQueryListEvent); });
    expect(screen.getByText("full")).toBeVisible();
    unmount();
    expect(media.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    window.matchMedia = original;
  });

  it("resets presentation when equal summary snapshots replace the session", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SimulationScreen scenario={scenario} snapshot={snapshot} reducedMotion />);
    await user.click(screen.getByRole("button", { name: "다음 단계" }));
    const group = screen.getByRole("group", { name: "기다림 원인 예측" });
    await user.click(within(group).getByRole("radio", { name: "먼저 끝날 작업을 기다림" }));
    await user.type(within(group).getByRole("textbox"), "앞 작업이 끝나기를 기다립니다");
    await user.click(within(group).getByRole("button", { name: "예측 저장" }));
    const replacement = withResult({ waits: [{ taskId: "prepare-illustrations", from: 1, to: 2, reason: "role", roleId: "B" }] });
    rerender(<SimulationScreen scenario={scenario} snapshot={replacement} reducedMotion />);
    expect(screen.getByText("가상 시간 0단위 정지 화면")).toBeVisible();
    expect(screen.queryByLabelText("예측 결과")).not.toBeInTheDocument();
    expect(screen.queryByText("앞 작업이 끝나기를 기다립니다")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "다음 단계" }));
    expect(screen.getByRole("group", { name: "기다림 원인 예측" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("기다림이 나타나 실행을 멈췄습니다.");
    expect(screen.getByRole("status")).not.toHaveTextContent(/앞 작업|담당 역할/);
  });

  it("cleans the old playback interval when a snapshot changes during playback", async () => {
    vi.useFakeTimers();
    const replacement = withResult({ waits: [], finishTime: 5, runs: snapshot.result.runs.map((run) => ({ ...run, actualStart: run.actualStart + 1, end: run.end + 1 })) });
    const { rerender } = render(<SimulationScreen scenario={scenario} snapshot={snapshot} reducedMotion={false} />);
    try {
      fireEvent.click(screen.getByRole("button", { name: "가상 실행 시작" }));
      rerender(<SimulationScreen scenario={scenario} snapshot={replacement} reducedMotion={false} />);
      await act(async () => { await vi.advanceTimersByTimeAsync(600); });
      expect(screen.getByText("가상 시간 0단위")).toBeVisible();
      expect(screen.getByRole("button", { name: "가상 실행 시작" })).toBeVisible();
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps a persisted prediction authoritative after presentation reset", () => {
    const replacement = withResult({ waits: [{ taskId: "prepare-illustrations", from: 1, to: 2, reason: "role", roleId: "B" }] });
    const { rerender } = render(<SimulationScreen scenario={scenario} snapshot={snapshot} reducedMotion prediction="dependency" predictionExplanation="저장된 예측 설명입니다" />);
    rerender(<SimulationScreen scenario={scenario} snapshot={replacement} reducedMotion prediction="dependency" predictionExplanation="저장된 예측 설명입니다" />);
    expect(screen.getByText("가상 시간 0단위 정지 화면")).toBeVisible();
    expect(screen.getByLabelText("예측 결과")).toBeVisible();
    expect(screen.getByText("내 설명: 저장된 예측 설명입니다")).toBeVisible();
    expect(screen.getByRole("button", { name: "분석으로 이동" })).toBeVisible();
  });

  it("returns false when matchMedia has no listener API", () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn(() => ({ matches: true }) as MediaQueryList);
    render(<MotionProbe />);
    expect(screen.getByText("reduce")).toBeVisible();
    window.matchMedia = original;
  });
});
