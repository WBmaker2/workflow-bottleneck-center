import { expect, test } from "@playwright/test";
import { createInitialState } from "../src/app/appReducer";
import { scenarioCatalog } from "../src/data/scenarios";
import { requiredEdgesFromScenario } from "../src/domain/scenarioValidation";
import { encodeProgress } from "../src/storage/progressCodec";
import { completeMissionByKeyboard, installKeyboardSelectSupport, missionSolutions } from "./fixtures/missionSolutions";

test("375px briefing keeps the first action within the opening viewport flow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");

  const confirmButton = page.getByRole("button", { name: "조건 확인" });
  await expect(confirmButton).toBeVisible();
  const documentTop = await confirmButton.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  expect(documentTop).toBeLessThan(1800);
});

test("briefing pulse becomes static emphasis when motion is reduced", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");

  const pulse = page.getByRole("button", { name: "조건 확인" });
  const styles = await pulse.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { animationName: computed.animationName, animationDuration: computed.animationDuration, boxShadow: computed.boxShadow };
  });
  expect(styles.animationName).toBe("none");
  expect(styles.animationDuration).toBe("0s");
  expect(styles.boxShadow).not.toBe("none");
});

test("scenario navigation exposes one selected scenario with a visible style", async ({ page }) => {
  await page.goto("./");
  const selected = page.locator(".scenario-navigation__button--selected");
  await expect(selected).toHaveCount(1);
  await expect(selected).toHaveAttribute("aria-current", "page");
  await expect(selected).toHaveText(/선택됨/);
  const selectedStyle = await selected.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { backgroundColor: computed.backgroundColor, borderColor: computed.borderColor };
  });
  expect(selectedStyle).toEqual({ backgroundColor: "rgb(228, 240, 251)", borderColor: "rgb(35, 99, 168)" });
  await page.getByRole("button", { name: /도서 반납 카트/ }).click();
  await expect(page.getByRole("button", { name: /도서 반납 카트/ })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("button", { name: /과학 전시판 준비/ })).not.toHaveAttribute("aria-current");
});

test("mobile update trigger stays below the stage without overlap", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");
  const stage = page.locator(".stage-shell");
  const footer = page.locator("footer.app-footer");
  const trigger = footer.getByRole("button", { name: "업데이트 내역", exact: true });
  await expect(footer).toContainText("업데이트 내역");
  await expect(trigger).toHaveCSS("position", "static");
  const [stageBox, triggerBox] = await Promise.all([stage.boundingBox(), trigger.boundingBox()]);
  expect(stageBox).not.toBeNull();
  expect(triggerBox).not.toBeNull();
  expect(triggerBox!.y).toBeGreaterThanOrEqual(stageBox!.y + stageBox!.height);
});

test("each learner stage presents stage-specific help", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "안내 단계 도움말", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "조건 확인" }).click();
  await expect(page.getByRole("heading", { name: "관계 설계 단계 도움말", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "안내 단계 도움말", exact: true })).toHaveCount(0);
});

test("learner flow stays same-origin and emits no console or page errors", async ({ page }) => {
  const requests: string[] = [];
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("./");
  const origin = new URL(page.url()).origin;
  expect(requests.filter((url) => !url.startsWith(`${origin}/`) && url !== origin)).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("375px relations show the required meaning list before the helper graph", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");
  await page.getByRole("button", { name: "조건 확인" }).click();

  await expect(page.getByRole("heading", { name: "필수 관계 힌트" })).toBeVisible();
  await expect(page.locator(".relation-requirement-list li").first()).toContainText("먼저");
  await expect(page.locator(".relation-graph")).toBeHidden();
  expect(await page.locator(".relation-requirement-list li").count()).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));

  await page.getByLabel("먼저 끝낼 작업").selectOption("verify-content");
  await page.getByLabel("다음에 시작할 작업").selectOption("prepare-print-file");
  await page.getByRole("button", { name: "관계 연결" }).click();
  const deleteButton = page.getByRole("button", { name: "자료 확인과 인쇄 글 정리 관계 삭제" });
  await expect(page.locator(".relation-list")).toContainText("자료 확인 다음에 인쇄 글 정리");
  await expect(deleteButton).toHaveCount(1);
  await expect(deleteButton).toBeVisible();

  for (const button of [page.getByRole("button", { name: "관계 연결" }), deleteButton]) {
    expect((await button.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});

test("375px schedule starts with the step list without document overflow", async ({ page }) => {
  const scenario = scenarioCatalog.find(({ id }) => id === "science-display")!;
  const draft = {
    entries: scenario.tasks.map((task) => ({
      taskId: task.id,
      plannedStart: 0,
      roleIds: scenario.roles.slice(0, task.peopleRequired).map(({ id }) => id),
    })),
    learnerEdges: requiredEdgesFromScenario(scenario),
  };
  const initial = createInitialState();
  const attempt = initial.attempts[scenario.id]!;
  const progress = encodeProgress({
    ...initial,
    selectedScenarioId: scenario.id,
    attempts: {
      ...initial.attempts,
      [scenario.id]: { ...attempt, stage: "schedule", conditionsAcknowledged: true, relationEdges: draft.learnerEdges, draftSchedule: draft },
    },
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: "workflow-bottleneck-center:progress:v1", value: JSON.stringify(progress) });
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "일정표", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "단계 목록 보기" })).toBeVisible();
  await expect(page.getByRole("grid")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
});

test("print media excludes learner controls while keeping the teacher summary", async ({ page }) => {
  await installKeyboardSelectSupport(page);
  await page.addInitScript(() => localStorage.removeItem("workflow-bottleneck-center:progress:v1"));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");
  await completeMissionByKeyboard(page, missionSolutions["science-display"]);
  await expect(page.getByRole("heading", { name: "개선 보고서", exact: true })).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("heading", { name: "교사용 요약", exact: true })).toBeVisible();
  await expect(page.getByTestId("report-interactive")).toHaveCSS("display", "none");
  await expect(page.locator("button").filter({ hasText: "개선 보고서 완성" })).toHaveCSS("display", "none");
  await expect(page.locator("footer.app-footer button").filter({ hasText: "업데이트 내역" })).toHaveCSS("display", "none");
});
