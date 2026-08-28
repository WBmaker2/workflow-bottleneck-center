import { expect, test } from "@playwright/test";

test.describe("업데이트 내역", () => {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 375, height: 812 }]) {
    test(`${viewport.width}px button opens all three dated records`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      const trigger = page.getByRole("button", { name: "업데이트 내역" });
      await expect(trigger).toBeVisible();
      await trigger.scrollIntoViewIfNeeded();
      await expect(trigger).toBeInViewport();
      const position = await trigger.evaluate((element) => getComputedStyle(element).position);
      expect(position).toBe("static");
      await trigger.focus();
      await page.keyboard.press("Enter");
      const dialog = page.getByRole("dialog", { name: "업데이트 내역" });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText("2026-08-26")).toHaveCount(2);
      await expect(dialog.getByText("2026-08-27")).toHaveCount(1);
      await expect(dialog.getByText("최초 설계 문서 작성")).toBeVisible();
      await expect(dialog.getByText("MVP 구현과 네 시나리오 검수")).toBeVisible();
      await expect(dialog.getByText("AppProvider 손상 저장 복구 개선")).toBeVisible();
      await expect(dialog.getByText("2026-08-28")).toHaveCount(1);
      await expect(dialog.getByText("학습자 안내·모바일 탐색 흐름 개선")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    });
  }
});
