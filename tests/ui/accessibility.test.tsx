import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { App } from "../../src/App";
import { createInitialState } from "../../src/app/appReducer";
import { encodeProgress } from "../../src/storage/progressCodec";
import type { AppProgressV1, PersistedMissionAttempt } from "../../src/app/appTypes";
import { scenarioCatalog } from "../../src/data/scenarios";
import { requiredEdgesFromScenario } from "../../src/domain/scenarioValidation";
import type { ScheduleDraft, LearningStage } from "../../src/domain/types";
import { scheduleStartUpperBound } from "../../src/domain/scheduleBounds";
import { simulateSchedule } from "../../src/domain/simulator";
import { analyzeBottlenecks } from "../../src/domain/bottleneckAnalyzer";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const stages: readonly LearningStage[] = ["briefing", "relations", "schedule", "simulation", "analysis", "revision", "report"];
const primaryScenario = scenarioCatalog[0]!;

const testStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    clear: () => { values.clear(); },
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  } satisfies Storage;
};

const scheduleFixture = (): ScheduleDraft => {
  const entries = primaryScenario.tasks.map((task) => {
    const entry = {
      taskId: task.id,
      plannedStart: 0,
      roleIds: primaryScenario.roles.slice(0, task.peopleRequired).map((role) => role.id),
    } as const;
    return entry;
  });
  expect(0).toBeLessThanOrEqual(scheduleStartUpperBound(primaryScenario));
  return { entries, learnerEdges: requiredEdgesFromScenario(primaryScenario) };
};

const successfulReportFixture = (): ScheduleDraft => {
  const starts: Record<string, number> = {
    "verify-content": 0,
    "prepare-print-file": 2,
    "prepare-illustrations": 2,
    "print-text": 4,
    "attach-materials": 6,
    "final-review": 8,
  };
  const roles: Record<string, readonly ("A" | "B" | "C")[]> = {
    "verify-content": ["A"],
    "prepare-print-file": ["B"],
    "prepare-illustrations": ["C"],
    "print-text": ["A"],
    "attach-materials": ["B", "C"],
    "final-review": ["A", "B"],
  };
  return {
    entries: primaryScenario.tasks.map((task) => ({
      taskId: task.id,
      plannedStart: starts[task.id]!,
      roleIds: roles[task.id]!,
    })),
    learnerEdges: requiredEdgesFromScenario(primaryScenario),
  };
};

const progressFor = (stage: LearningStage): AppProgressV1 => {
  const progress = structuredClone(encodeProgress(createInitialState()));
  const attempt = progress.attempts[primaryScenario.id] as PersistedMissionAttempt;
  const draft = stage === "report" ? successfulReportFixture() : scheduleFixture();
  attempt.stage = stage;
  attempt.conditionsAcknowledged = stage !== "briefing";
  attempt.relationEdges = stage === "briefing" || stage === "relations" ? [] : draft.learnerEdges;
  attempt.draftSchedule = stage === "briefing" || stage === "relations" ? { entries: [], learnerEdges: attempt.relationEdges } : draft;
  attempt.prediction = null;
  attempt.predictionExplanation = "";
  attempt.selectedFindingId = null;
  attempt.revisedSchedule = stage === "report" ? draft : null;
  const waits = simulateSchedule(primaryScenario, draft).waits;
  attempt.prediction = stage === "analysis" || stage === "revision" || stage === "report" ? waits[0]?.reason ?? null : null;
  attempt.selectedFindingId = stage === "revision" || stage === "report" ? analyzeBottlenecks(primaryScenario, simulateSchedule(primaryScenario, draft)).findings[0]?.id ?? null : null;
  return progress;
};

const renderAtStage = (stage: LearningStage) => {
  window.localStorage.setItem("workflow-bottleneck-center:progress:v1", JSON.stringify(progressFor(stage)));
  return render(<App />);
};

describe("accessible learning shell", () => {
  beforeEach(() => Object.defineProperty(window, "localStorage", { configurable: true, value: testStorage() }));
  afterEach(() => { cleanup(); window.localStorage.clear(); });

  it.each(stages)("%s has one labelled main heading and no axe violations", async (stage) => {
    const { container } = renderAtStage(stage);
    expect((await axe(container)).violations).toHaveLength(0);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveAttribute("aria-labelledby");
    expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute("tabindex", "-1");
    expect(screen.getByText(new RegExp(`현재 단계 ${stage === "briefing" ? "안내" : stage === "relations" ? "관계 설계" : stage === "schedule" ? "일정표" : stage === "simulation" ? "가상 실행" : stage === "analysis" ? "병목 분석" : stage === "revision" ? "수정" : "개선 보고서"}`))).toBeInTheDocument();
  });

  it.each(stages)("%s has the plan-authorized pulse count", (stage) => {
    renderAtStage(stage);
    const expected = ["briefing", "relations", "schedule", "analysis", "revision"].includes(stage) ? 1 : 0;
    expect(document.querySelectorAll('[data-pulse="true"]').length).toBe(expected);
  });

  it("shows stage-specific help and a visually distinct selected scenario", () => {
    renderAtStage("relations");
    expect(screen.getByRole("complementary", { name: "관계 설계 단계 도움말" })).toHaveTextContent("지금 할 일");
    expect(screen.getByRole("complementary", { name: "관계 설계 단계 도움말" })).toHaveTextContent("성공하려면");
    const selected = screen.getByRole("button", { name: /과학 전시판 준비.*선택됨/ });
    const other = screen.getByRole("button", { name: /도서 반납 카트/ });
    expect(selected).toHaveAttribute("aria-current", "page");
    expect(other).not.toHaveAttribute("aria-current", "page");
    expect(getComputedStyle(selected).backgroundColor).not.toBe(getComputedStyle(other).backgroundColor);
    expect(getComputedStyle(selected).borderColor).not.toBe(getComputedStyle(other).borderColor);
  });

  it("places stage help at the start of the stage shell before its screen content", () => {
    renderAtStage("relations");
    const stageShell = document.querySelector(".stage-shell")!;
    const scenarioTitle = screen.getByRole("heading", { name: "과학 전시판 준비" });
    const currentStage = screen.getByText("현재 단계: 관계 설계");
    const help = screen.getByRole("complementary", { name: "관계 설계 단계 도움말" });
    expect(stageShell.children[0]).toBe(scenarioTitle);
    expect(stageShell.children[1]).toBe(currentStage);
    expect(stageShell.children[2]).toBe(help);
  });

  it("keeps every interactive control named and avoids positive tab indexes", () => {
    renderAtStage("briefing");
    const unnamed = [...document.querySelectorAll<HTMLElement>("button, a, input, select, textarea")].filter((element) => !element.getAttribute("aria-label") && !element.getAttribute("aria-labelledby") && !(element as HTMLInputElement).labels?.length && !element.textContent?.trim());
    expect(unnamed).toHaveLength(0);
    expect(document.querySelectorAll('[tabindex]:not([tabindex="-1"]):not([tabindex="0"])')).toHaveLength(0);
  });

  it("names the briefing summary controls and keeps one required pulse", () => {
    renderAtStage("briefing");
    expect(screen.getByRole("heading", { name: "작업 핵심 조건 요약" })).toBeInTheDocument();
    const summaries = [...document.querySelectorAll<HTMLElement>(".task-card-list details > summary")];
    expect(summaries).toHaveLength(primaryScenario.tasks.length);
    summaries.forEach((summary) => expect(summary).toHaveAccessibleName(/.+/));
    expect(screen.getByRole("button", { name: "조건 확인" })).toHaveAccessibleName("조건 확인");
    expect(document.querySelectorAll('[data-pulse="true"]')).toHaveLength(1);
  });

  it.each(stages)("%s does not render empty live regions", (stage) => {
    renderAtStage(stage);
    const emptyLiveRegions = [...document.querySelectorAll<HTMLElement>("[aria-live]")].filter((element) => !element.textContent?.trim());
    expect(emptyLiveRegions).toHaveLength(0);
    expect(document.querySelectorAll('[aria-live="assertive"]').length).toBeLessThanOrEqual(1);
  });

  it("keeps the reduced-motion hook available for manual simulation controls", () => {
    renderAtStage("simulation");
    expect(document.querySelector("[data-reduced-motion='false']")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "가상 실행 시작" })).toBeInTheDocument();
  });

  it("keeps semantic relation and comparison table headers", () => {
    renderAtStage("relations");
    expect(screen.getByRole("heading", { name: /연결한 관계/ })).toBeInTheDocument();
    cleanup();
    renderAtStage("report");
    expect(screen.queryAllByRole("columnheader").length).toBeGreaterThanOrEqual(4);
    expect(screen.queryAllByRole("rowheader").length).toBeGreaterThanOrEqual(1);
  });

  it("announces incomplete report evidence from one live source", () => {
    renderAtStage("report");
    fireEvent.click(screen.getByRole("button", { name: "개선 보고서 완성" }));
    expect(screen.getAllByText("네 가지 근거 문장을 모두 완성하세요.")).toHaveLength(1);
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("does not reserve an unused desktop stage column", () => {
    const source = readFileSync(resolve(process.cwd(), "src/styles/layout.css"), "utf8");
    expect(source).toContain("grid-template-columns: minmax(0, 1fr);");
    expect(source).not.toContain("minmax(16rem, 20rem)");
  });

  it("declares an explicit favicon", () => {
    const source = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
    expect(source).toMatch(/<link\s+rel="icon"[^>]+href="[^"]+"/);
  });
});

describe("motion contract", () => {
  it("declares the shadow-only pulse and reduced-motion replacement", () => {
    const source = readFileSync(resolve(process.cwd(), "src/styles/motion.css"), "utf8");
    expect(source).toContain("@keyframes gi-pulse");
    expect(source).toContain(".gi-pulse");
    expect(source).toContain("@media (prefers-reduced-motion: reduce)");
    expect(source).toMatch(/\.gi-pulse[\s\S]*animation:\s*none/);
    expect(source).toContain("scroll-behavior: auto");
  });
});
