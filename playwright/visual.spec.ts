import { test, expect } from "@playwright/test";

test("homepage snapshot", async ({ page }) => {
  await page.goto("http://127.0.0.1:5173/");
  await page.waitForLoadState("networkidle");
  const screenshot = await page.screenshot();
  expect(screenshot).toBeTruthy();
});
