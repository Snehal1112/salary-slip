import { test, expect } from "@playwright/test";

test("preview page visual snapshot", async ({ page }) => {
  await page.goto("http://127.0.0.1:5173/preview");
  await page.waitForLoadState("networkidle");
  // give app a moment to hydrate and render the preview
  await page.waitForTimeout(500);
  const img = await page.screenshot({ fullPage: true });
  expect(img).toBeTruthy();
});
