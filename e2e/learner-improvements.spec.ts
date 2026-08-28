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
