import { expect, test } from "@playwright/test";
import { scenarioCatalog } from "../src/data/scenarios";
import { simulateSchedule } from "../src/domain/simulator";
import { draftFor, completeMissionByKeyboard, installPointerFailureGuard, missionSolutions } from "./fixtures/missionSolutions";
import type { ScenarioId } from "../src/domain/types";

const scenarioIds: readonly ScenarioId[] = ["science-display", "library-cart", "class-presentation", "eco-campaign-booth"];

test.describe("375px keyboard-only learner paths", () => {
  for (const scenarioId of scenarioIds) {
    test(`${scenarioId} completes without pointer input`, async ({ page }) => {
      const scenario = scenarioCatalog.find(({ id }) => id === scenarioId)!;
      const solution = missionSolutions[scenarioId];
      const initial = simulateSchedule(scenario, draftFor(scenarioId, solution.initialEntries));
      const firstWait = initial.waits[0];
      expect(firstWait).toBeDefined();
      expect(scenario.tasks.map(({ id }) => id)).toContain(firstWait!.taskId);
      expect(firstWait!.to - firstWait!.from).toBeGreaterThan(0);

      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
      await installPointerFailureGuard(page);
      await page.addInitScript(() => localStorage.removeItem("workflow-bottleneck-center:progress:v1"));
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto("/");
      await completeMissionByKeyboard(page, solution);

      await expect(page.getByRole("heading", { name: "개선 보고서" })).toBeVisible();
      await expect(page.getByText("안전 조건 충족")).toBeVisible();
      await expect(page.getByText("품질 조건 충족")).toBeVisible();
      await expect(page.getByText("역할 공정성 충족")).toBeVisible();
      await expect(page.getByText("이 결과는 교육용 가상 모델이며 실제 사람의 생산성 평가에 사용할 수 없습니다.").first()).toBeVisible();
      await expect(page.getByRole("heading", { name: "최초 일정", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "수정 일정", exact: true })).toBeVisible();
      await expect(page.getByRole("rowheader", { name: "전체 시간" })).toBeVisible();
      await expect(page.getByRole("rowheader", { name: "전체 대기" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "네 가지 근거 문장" })).toBeVisible();
      await expect(page.getByRole("group", { name: "선행 관계 근거" })).toBeVisible();
      await expect(page.getByRole("group", { name: "병렬 관계 근거" })).toBeVisible();
      await expect(page.getByRole("group", { name: "병목 근거" })).toBeVisible();
      await expect(page.getByRole("group", { name: "절충 근거" })).toBeVisible();
      for (const explanation of Object.values(solution.evidence)) {
        await expect(page.getByText(explanation, { exact: true })).toBeVisible();
      }
      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });
  }
});
