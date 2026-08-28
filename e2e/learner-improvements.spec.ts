import { expect, test } from "@playwright/test";

test("375px briefing keeps the first action within the opening viewport flow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const confirmButton = page.getByRole("button", { name: "조건 확인" });
  await expect(confirmButton).toBeVisible();
  const documentTop = await confirmButton.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  expect(documentTop).toBeLessThan(1800);
});
