import { expect, test } from "@playwright/test";
import { completeMissionByKeyboard, installKeyboardSelectSupport, missionSolutions } from "./fixtures/missionSolutions";

test("print media keeps only the teacher summary and hides report controls", async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem("workflow-bottleneck-center:progress:v1"));
  await installKeyboardSelectSupport(page);
  await page.goto("/");
  await completeMissionByKeyboard(page, missionSolutions["science-display"]);

  await expect(page.getByRole("heading", { name: "교사용 요약" })).toBeVisible();
  await expect(page.getByTestId("report-interactive")).toBeVisible();
  await page.emulateMedia({ media: "print" });

  await expect(page.getByRole("heading", { name: "교사용 요약" })).toBeVisible();
  await expect(page.getByTestId("report-interactive")).toHaveCSS("display", "none");
  await expect(page.locator("button").filter({ hasText: "교사용 요약 인쇄" })).toHaveCSS("display", "none");
  await expect(page.locator("button").filter({ hasText: "개선 보고서 완성" })).toHaveCSS("display", "none");
  await expect(page.locator("button").filter({ hasText: "저장된 진행 지우기" })).toHaveCSS("display", "none");
  await expect(page.locator("button").filter({ hasText: "업데이트 내역" })).toHaveCSS("display", "none");
  await expect(page.locator("nav")).toHaveCSS("display", "none");
  await expect(page.locator(".evidence-form")).toHaveCSS("display", "none");
  await expect(page.getByText("안전 조건 충족")).toBeVisible();
  await expect(page.getByText("품질 조건 충족")).toBeVisible();
});
