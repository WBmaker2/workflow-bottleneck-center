import { expect, test } from "@playwright/test";
import { chooseSelectValue, installKeyboardSelectSupport, pressButton } from "./fixtures/missionSolutions";
import { scenarioCatalog } from "../src/data/scenarios";
import { requiredEdgesFromScenario } from "../src/domain/scenarioValidation";

const key = "workflow-bottleneck-center:progress:v1";
const unrelatedKey = "workflow-bottleneck-center:unrelated-test-value";

const addRelation = async (page: import("@playwright/test").Page, before: string, after: string): Promise<void> => {
  await chooseSelectValue(page, "다음에 시작할 작업", after);
  await chooseSelectValue(page, "먼저 끝낼 작업", before);
  await pressButton(page, "관계 연결");
};

test.describe("opt-in local progress", () => {
  test.beforeEach(async ({ page }) => {
    await installKeyboardSelectSupport(page);
  });

  test("reload starts over when saving is off", async ({ page }) => {
    await page.goto("./");
    await pressButton(page, "조건 확인");
    await expect(page.getByRole("heading", { name: "관계 설계판", exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "의뢰 접수", exact: true })).toBeVisible();
  });

  test("reload restores the saved stage and placed role", async ({ page }) => {
    await page.goto("./");
    const save = page.getByRole("checkbox", { name: "이 기기에 진행 저장" });
    await save.focus();
    await page.keyboard.press("Space");
    await pressButton(page, "조건 확인");
    const scenario = scenarioCatalog.find(({ id }) => id === "science-display")!;
    for (const edge of requiredEdgesFromScenario(scenario)) await addRelation(page, edge.beforeTaskId, edge.afterTaskId);
    await pressButton(page, "관계 확인");
    await chooseSelectValue(page, "배치할 작업", "verify-content");
    await chooseSelectValue(page, "시작 시점", "0");
    const role = page.getByRole("checkbox", { name: "역할 A" });
    await role.focus();
    await page.keyboard.press("Space");
    await pressButton(page, "일정에 배치");
    await page.reload();
    await expect(page.getByRole("heading", { name: "일정표", exact: true })).toBeVisible();
    await expect(page.locator('.timeline-grid [role="row"][aria-label*="자료 확인"][aria-label*="역할 A"]')).toHaveCount(1);
  });

  test("switching saving off clears only the versioned progress key", async ({ page }) => {
    await page.addInitScript((otherKey) => localStorage.setItem(otherKey, "keep-me"), unrelatedKey);
    await page.goto("./");
    const save = page.getByRole("checkbox", { name: "이 기기에 진행 저장" });
    await save.focus();
    await page.keyboard.press("Space");
    await expect.poll(() => page.evaluate((progressKey) => localStorage.getItem(progressKey), key)).not.toBeNull();
    await save.focus();
    await page.keyboard.press("Space");
    await expect.poll(() => page.evaluate((progressKey) => localStorage.getItem(progressKey), key)).toBeNull();
    expect(await page.evaluate((otherKey) => localStorage.getItem(otherKey), unrelatedKey)).toBe("keep-me");
  });

  test("corrupt saved data recovers without crashing the learner path", async ({ page }) => {
    await page.addInitScript((progressKey) => localStorage.setItem(progressKey, "not-json"), key);
    await page.goto("./");
    await expect(page.getByRole("heading", { name: "의뢰 접수", exact: true })).toBeVisible();
    await expect(page.getByRole("status")).toHaveText(/저장된 진행/);
  });

  test("never renders a learner-name field", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("input[name*='name' i], textarea[name*='name' i]")).toHaveCount(0);
    await expect(page.getByText(/학생 이름이나 온라인 계정은 사용하지 않습니다/)).toBeVisible();
  });
});
