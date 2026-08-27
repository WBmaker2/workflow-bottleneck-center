import { expect, test } from "@playwright/test";
import { createInitialState } from "../src/app/appReducer";
import type { AppProgressV1, PersistedMissionAttempt } from "../src/app/appTypes";
import { scenarioCatalog } from "../src/data/scenarios";
import { analyzeBottlenecks } from "../src/domain/bottleneckAnalyzer";
import { requiredEdgesFromScenario } from "../src/domain/scenarioValidation";
import { scheduleStartUpperBound } from "../src/domain/scheduleBounds";
import { simulateSchedule } from "../src/domain/simulator";
import type { LearningStage, ScheduleDraft } from "../src/domain/types";

const stages: readonly LearningStage[] = ["briefing", "relations", "schedule", "simulation", "analysis", "revision", "report"];
const scenario = scenarioCatalog[0]!;
const storageKey = "workflow-bottleneck-center:progress:v1";

const scheduleFixture = (): ScheduleDraft => ({
  entries: scenario.tasks.map((task) => ({
    taskId: task.id,
    plannedStart: 0,
    roleIds: scenario.roles.slice(0, task.peopleRequired).map((role) => role.id),
  })),
  learnerEdges: requiredEdgesFromScenario(scenario),
});

const progressFor = (stage: LearningStage): AppProgressV1 => {
  const progress = structuredClone(createInitialState());
  const encoded = {
    version: 1 as const,
    selectedScenarioId: progress.selectedScenarioId,
    saveEnabled: true as const,
    attempts: Object.fromEntries(Object.entries(progress.attempts).map(([id, attempt]) => [id, {
      scenarioId: attempt.scenarioId,
      stage: attempt.stage,
      conditionsAcknowledged: attempt.conditionsAcknowledged,
      relationEdges: attempt.relationEdges,
      draftSchedule: attempt.draftSchedule,
      prediction: attempt.prediction,
      predictionExplanation: attempt.predictionExplanation,
      selectedFindingId: attempt.selectedFindingId,
      revisedSchedule: attempt.revisedSchedule,
      evidence: attempt.evidence,
      completed: attempt.completed,
    }])),
  } as AppProgressV1;
  const attempt = encoded.attempts[scenario.id] as PersistedMissionAttempt;
  const draft = scheduleFixture();
  const result = simulateSchedule(scenario, draft);
  attempt.stage = stage;
  attempt.conditionsAcknowledged = stage !== "briefing";
  attempt.relationEdges = stage === "briefing" || stage === "relations" ? [] : draft.learnerEdges;
  attempt.draftSchedule = stage === "briefing" || stage === "relations" ? { entries: [], learnerEdges: attempt.relationEdges } : draft;
  attempt.prediction = stage === "analysis" || stage === "revision" || stage === "report" ? result.waits[0]?.reason ?? null : null;
  attempt.selectedFindingId = stage === "revision" || stage === "report" ? analyzeBottlenecks(scenario, result).findings[0]?.id ?? null : null;
  attempt.revisedSchedule = stage === "report" ? draft : null;
  return encoded;
};

const stageLabel: Record<LearningStage, string> = {
  briefing: "안내",
  relations: "관계 설계",
  schedule: "일정표",
  simulation: "가상 실행",
  analysis: "병목 분석",
  revision: "수정",
  report: "개선 보고서",
};

const stageOwnedScreen: Record<LearningStage, { selector: string; heading: string }> = {
  briefing: { selector: ".briefing-screen", heading: "의뢰 접수" },
  relations: { selector: ".relation-screen", heading: "관계 설계판" },
  schedule: { selector: ".schedule-screen", heading: "일정표" },
  simulation: { selector: ".simulation-screen", heading: "가상 실행" },
  analysis: { selector: ".analysis-screen", heading: "병목 분석" },
  revision: { selector: ".revision-screen", heading: "일정 수정" },
  report: { selector: ".report-screen", heading: "개선 보고서" },
};

for (const stage of stages) {
  test(`375px ${stage} stays a single accessible workspace`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: storageKey, value: JSON.stringify(progressFor(stage)) });
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("작업 순서 병목 해결소");
    await expect(page.getByText(`현재 단계: ${stageLabel[stage]}`)).toBeVisible();
    const ownedScreen = page.locator(stageOwnedScreen[stage].selector);
    await expect(ownedScreen).toBeVisible();
    await expect(ownedScreen.getByRole("heading", { name: stageOwnedScreen[stage].heading })).toBeVisible();
    await expect(page.getByRole("button", { name: "업데이트 내역" })).toBeInViewport();
    await expect(page.getByRole("button", { name: /단계 목록 보기|요약 보기/ }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);

    const undersized = await page.locator("button, a, input, select, textarea, summary").evaluateAll((elements) => elements.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width < 44 || rect.height < 44;
    }).map((element) => ({ text: element.textContent?.trim(), width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })));
    expect(undersized, JSON.stringify(undersized)).toEqual([]);

    const outline = await page.locator("button:not(:disabled), select, input:not(:disabled), textarea").first().evaluate((element) => {
      (element as HTMLElement).focus();
      return getComputedStyle(element).outlineWidth;
    });
    expect(parseFloat(outline)).toBeGreaterThanOrEqual(3);

    if (stage === "relations" || stage === "schedule") {
      const workspace = page.locator(stage === "relations" ? ".relation-board" : ".timeline-grid-section");
      const summary = page.locator(".app-stage-summary");
      const workspaceBox = await workspace.boundingBox();
      const summaryBox = await summary.boundingBox();
      expect(workspaceBox).not.toBeNull();
      expect(summaryBox).not.toBeNull();
      expect(summaryBox!.y).toBeGreaterThanOrEqual(workspaceBox!.y + workspaceBox!.height);
    }
  });
}

test("desktop relation and schedule stages use one workspace track", async ({ page }) => {
  for (const stage of ["relations", "schedule"] as const) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: storageKey, value: JSON.stringify(progressFor(stage)) });
    await page.goto("/");
    await expect(page.locator(stageOwnedScreen[stage].selector)).toBeVisible();
    const trackCount = await page.locator(".stage-layout").evaluate((element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length);
    expect(trackCount).toBe(1);
  }
});

test("motion reduction keeps the simulation manual", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: storageKey, value: JSON.stringify(progressFor("simulation")) });
  await page.goto("/");
  await expect(page.locator("[data-reduced-motion='false']")).toBeVisible();
  await expect(page.getByRole("button", { name: "가상 실행 시작" })).toBeVisible();
  expect(scheduleStartUpperBound(scenario)).toBeGreaterThan(0);
});

test("captures representative classroom board screenshots", async ({ page }) => {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: storageKey, value: JSON.stringify(progressFor("briefing")) });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.screenshot({ path: "output/playwright/task-13-briefing-375.png", fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: "output/playwright/task-13-briefing-desktop.png", fullPage: true });
});
