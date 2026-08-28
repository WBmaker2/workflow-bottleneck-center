import { expect, type Page } from "@playwright/test";

const tabToProbe = async (page: Page, selector: string): Promise<void> => {
  const target = page.locator(selector);
  await expect(target).toHaveCount(1);
  for (let attempt = 0; attempt < 160; attempt += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error("Native select keyboard probe could not reach its temporary select");
};

export const probeNativeSelectKeyboard = async (page: Page): Promise<boolean> => {
  const selector = "select[data-workflow-native-select-probe]";
  await page.evaluate(() => {
    const select = document.createElement("select");
    select.dataset.workflowNativeSelectProbe = "true";
    select.setAttribute("aria-label", "native select keyboard probe");
    select.innerHTML = "<option value='probe-first'>첫 번째</option><option value='probe-second'>두 번째</option>";
    Object.assign(select.style, { position: "fixed", left: "0", top: "0", opacity: "0" });
    document.body.append(select);
  });
  try {
    await tabToProbe(page, selector);
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Tab");
    return await page.locator(selector).inputValue() === "probe-second";
  } finally {
    await page.locator(selector).evaluate((element) => element.remove());
  }
};

const nativeSelectSupportByPage = new WeakMap<Page, Promise<boolean>>();
export const getNativeSelectSupport = (page: Page): Promise<boolean> => {
  const existing = nativeSelectSupportByPage.get(page);
  if (existing) return existing;
  const probe = probeNativeSelectKeyboard(page);
  nativeSelectSupportByPage.set(page, probe);
  return probe;
};
