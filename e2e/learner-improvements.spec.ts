import { expect, test } from "@playwright/test";
import { createInitialState } from "../src/app/appReducer";
import { scenarioCatalog } from "../src/data/scenarios";
import { requiredEdgesFromScenario } from "../src/domain/scenarioValidation";
import { encodeProgress } from "../src/storage/progressCodec";
import {
  addRequiredRelations,
  completeMissionByKeyboard,
  completeMissionByRealKeyboard,
  installPointerFailureGuard,
  installKeyboardOnlyFailureGuard,
  missionSolutions,
  placeEntries,
  pressButton,
} from "./fixtures/missionSolutions";

const stageHelpExpectations = [
  {
    title: "안내 단계 도움말",
    whatToDo: "작업 카드에서 시간, 필요한 사람과 도구, 먼저 할 일을 살펴보세요.",
    successHint: "안전과 품질 조건을 확인한 뒤 ‘조건 확인’을 누르면 관계를 연결할 수 있어요.",
  },
  {
    title: "관계 설계 단계 도움말",
    whatToDo: "어떤 작업을 먼저 끝내야 다음 작업을 시작할 수 있는지 선으로 연결하세요.",
    successHint: "필수 관계를 빠뜨리지 않고 서로 기다리는 순환을 만들지 않으면 일정표로 갈 수 있어요.",
  },
  {
    title: "일정표 단계 도움말",
    whatToDo: "모든 작업의 시작 시점과 필요한 역할을 정해 시간표에 배치하세요.",
    successHint: "모든 작업이 관계와 역할 조건에 맞게 놓이면 ‘실행’으로 결과를 살펴볼 수 있어요.",
  },
  {
    title: "가상 실행 단계 도움말",
    whatToDo: "시간을 한 칸씩 움직이며 작업이 시작하고 멈추는 순간을 관찰하세요.",
    successHint: "기다림이 보이면 왜 멈췄는지 예측하고 실행 기록과 비교해 보세요.",
  },
  {
    title: "병목 분석 단계 도움말",
    whatToDo: "뒤 작업을 늦춘 기다림의 원인을 찾아 병목으로 표시하세요.",
    successHint: "오래 걸린 작업이 아니라 다른 작업을 실제로 늦춘 원인을 고르면 수정할 수 있어요.",
  },
  {
    title: "수정 단계 도움말",
    whatToDo: "찾은 병목을 줄이는 새 일정을 만들고 안전·품질·역할 조건도 지키세요.",
    successHint: "처음 일정과 수정 일정을 실행해 비교하면 무엇이 달라졌는지 알 수 있어요.",
  },
  {
    title: "개선 보고서 단계 도움말",
    whatToDo: "처음과 수정 결과를 비교하고, 왜 그렇게 바꿨는지 네 문장으로 설명하세요.",
    successHint: "안전·품질·협력·시간을 함께 지킨 근거를 모두 적으면 오늘 배운 내용을 정리할 수 있어요.",
  },
] as const;

const expectStageHelp = async (page: import("@playwright/test").Page, expected: (typeof stageHelpExpectations)[number]): Promise<void> => {
  const panel = page.locator(".stage-help-panel");
  await expect(panel.getByRole("heading", { name: expected.title, exact: true })).toBeVisible();
  await expect(panel.locator("dd").nth(0)).toHaveText(expected.whatToDo);
  await expect(panel.locator("dd").nth(1)).toHaveText(expected.successHint);
};

test("first render exposes the seven-step masthead contract without document overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");
  await expect(page.getByTestId("stage-progress").locator("li")).toHaveCount(7);
  await expect(page.getByTestId("stage-progress").locator('[aria-current="step"]')).toHaveCount(1);
  await expect(page.getByText("먼저 할 일과 함께 할 일을 구분하면 기다림을 줄일 수 있어요.")).toBeVisible();
  await expect(page.getByText("가상 시간", { exact: true })).toBeVisible();
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
});

test("375px briefing keeps the first action within the opening viewport flow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");

  const confirmButton = page.getByRole("button", { name: "조건 확인" });
  await expect(confirmButton).toBeVisible();
  const documentTop = await confirmButton.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  expect(documentTop).toBeLessThan(1800);
});

test("learner task summary keeps meta and condition copy at a readable 1rem minimum", async ({ page }) => {
  await page.goto("./");

  const summaryItems = page.locator('.task-card-summary ol [data-testid="task-summary-item"]');
  const metaCopy = summaryItems.locator(":scope > span");
  const conditionCopy = summaryItems.locator(":scope > small");
  await expect(summaryItems).toHaveCount(scenarioCatalog[0]!.tasks.length);
  await expect(metaCopy).toHaveCount(scenarioCatalog[0]!.tasks.length);
  await expect(conditionCopy).toHaveCount(scenarioCatalog[0]!.tasks.length);
  await expect(conditionCopy.first()).toContainText(/안전|품질/);

  const fontSizes = await metaCopy.evaluateAll((elements) => elements.map((element) => parseFloat(getComputedStyle(element).fontSize)));
  const conditionFontSizes = await conditionCopy.evaluateAll((elements) => elements.map((element) => parseFloat(getComputedStyle(element).fontSize)));
  for (const fontSize of [...fontSizes, ...conditionFontSizes]) {
    expect(fontSize).toBeGreaterThanOrEqual(16);
  }
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

test("each learner stage presents its title and unique help copy", async ({ page }) => {
  const solution = missionSolutions["science-display"];
  await page.setViewportSize({ width: 375, height: 812 });
  await installPointerFailureGuard(page);
  await page.addInitScript(() => localStorage.removeItem("workflow-bottleneck-center:progress:v1"));
  await page.goto("./");
  await expectStageHelp(page, stageHelpExpectations[0]!);
  await pressButton(page, "조건 확인");
  await expectStageHelp(page, stageHelpExpectations[1]!);
  await addRequiredRelations(page, solution.scenarioId);
  await expectStageHelp(page, stageHelpExpectations[2]!);
  await placeEntries(page, solution.scenarioId, solution.initialEntries);
  await pressButton(page, "실행");
  await expectStageHelp(page, stageHelpExpectations[3]!);
  await pressButton(page, "가상 실행 시작");
  const waitReason = await page.locator("input[name='wait-reason']").first().getAttribute("value");
  expect(waitReason).toBeTruthy();
  await page.locator(`input[name='wait-reason'][value='${waitReason}']`).focus();
  await page.keyboard.press("Space");
  await page.getByLabel("기다림을 예상한 이유 (10자 이상)").focus();
  await page.keyboard.type("작업 카드의 조건을 살펴보면 알 수 있습니다");
  await pressButton(page, "예측 저장");
  await pressButton(page, "분석으로 이동");
  await expectStageHelp(page, stageHelpExpectations[4]!);
  await page.locator("input[name='bottleneck-finding']").first().focus();
  await page.keyboard.press("Space");
  await pressButton(page, "병목 표시");
  await pressButton(page, "수정 시작");
  await expectStageHelp(page, stageHelpExpectations[5]!);
  await placeEntries(page, solution.scenarioId, solution.revisedEntries);
  await pressButton(page, "수정안 실행·비교");
  await pressButton(page, "보고서 작성");
  await expectStageHelp(page, stageHelpExpectations[6]!);
});

for (const scenarioId of ["science-display", "library-cart", "class-presentation", "eco-campaign-booth"] as const) {
  test(`${scenarioId} full 375px learner flow stays same-origin and error-free`, async ({ page }) => {
    const requests: string[] = [];
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.addInitScript(() => {
      const trace = { forwardTabs: 0, backwardTabs: 0, activationKeys: [] as string[] };
      Object.assign(window, { __workflowKeyboardTrace: trace });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Tab") {
          if (event.shiftKey) trace.backwardTabs += 1;
          else trace.forwardTabs += 1;
          trace.activationKeys.push(event.shiftKey ? "Shift+Tab" : "Tab");
        } else if (event.key === "Enter") {
          trace.activationKeys.push("Enter");
        }
      }, true);
    });
    await installKeyboardOnlyFailureGuard(page);
    await page.addInitScript(() => localStorage.removeItem("workflow-bottleneck-center:progress:v1"));
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("./");
    await completeMissionByRealKeyboard(page, missionSolutions[scenarioId]);
    await expect(page.getByRole("heading", { name: "개선 보고서", exact: true })).toBeVisible();
    const keyboardTrace = await page.evaluate(() => (window as Window & {
      __workflowKeyboardTrace?: { forwardTabs: number; backwardTabs: number; activationKeys: string[] };
    }).__workflowKeyboardTrace ?? { forwardTabs: 0, backwardTabs: 0, activationKeys: [] });
    expect(keyboardTrace.forwardTabs).toBeGreaterThan(0);
    expect(keyboardTrace.backwardTabs).toBeGreaterThan(0);
    const backwardIndexes = keyboardTrace.activationKeys.flatMap((key, index) => key === "Shift+Tab" ? [index] : []);
    expect(backwardIndexes.length).toBeGreaterThan(0);
    for (const index of backwardIndexes) {
      expect(keyboardTrace.activationKeys.slice(index, index + 3)).toEqual(["Shift+Tab", "Tab", "Enter"]);
    }
    await page.waitForTimeout(50);
    const origin = new URL(page.url()).origin;
    expect(requests.filter((url) => !url.startsWith(`${origin}/`) && url !== origin)).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
}

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
