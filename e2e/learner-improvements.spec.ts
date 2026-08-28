import { expect, test } from "@playwright/test";

test("375px briefing keeps the first action within the opening viewport flow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const confirmButton = page.getByRole("button", { name: "조건 확인" });
  await expect(confirmButton).toBeVisible();
  const documentTop = await confirmButton.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  expect(documentTop).toBeLessThan(1800);
});

test("briefing pulse becomes static emphasis when motion is reduced", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const pulse = page.getByRole("button", { name: "조건 확인" });
  const styles = await pulse.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { animationName: computed.animationName, animationDuration: computed.animationDuration, boxShadow: computed.boxShadow };
  });
  expect(styles.animationName).toBe("none");
  expect(styles.animationDuration).toBe("0s");
  expect(styles.boxShadow).not.toBe("none");
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

  for (const button of await page.locator(".relation-list button, .relation-editor button").all()) {
    expect((await button.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});
