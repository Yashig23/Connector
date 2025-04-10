import { test, expect, chromium } from '@playwright/test';
import v8toIstanbul from 'v8-to-istanbul';

test.beforeEach(async ({ page }) => {
  await page.coverage.startJSCoverage(); 
  await page.goto('http://localhost:4200/');
});


test('Coverage test', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.coverage.startJSCoverage();
    await page.goto('http://localhost:4200/login');
    const coverage = await page.coverage.stopJSCoverage();
    for (const entry of coverage) {
      const converter = v8toIstanbul('', 0);
      await converter.load();
      converter.applyCoverage(entry.functions);
    }
    await browser.close();
  });

test('should load login page initially', async ({ page }) => {
  await expect(page.locator('.auth-heading')).toHaveText(/Login Here/);
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="username"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toHaveText('Log In');
});

test('should toggle to Register mode', async ({ page }) => {
  await page.locator('.register-section').click();
  await expect(page.locator('h3')).toHaveText('Register Here');
  await expect(page.locator('input[name="fullName"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toHaveText('Sign Up');
});

test('should not allow empty form submission', async ({ page }) => {
  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toBe('Please enter both email and password.');
    await dialog.dismiss();
  });

  await page.locator('button:text("Log In")').click();
});

test('should login successfully with valid credentials', async ({ page }) => {
  await page.fill('input[name="username"]', 'pragati_sharma45');
  await page.fill('input[name="email"]', 'pragati8899@gmail.com');
  await page.fill('input[name="password"]', 'pragati@123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('http://localhost:4200/home');
});

test('should show error for invalid login', async ({ page }) => {
  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toMatch(/Firebase: Error.*auth\/invalid-email/);
    await dialog.dismiss();
  });

  await page.fill('input[name="username"]', 'pragati_sharma45');
  await page.fill('input[name="email"]', 'wrong@example.com');
  await page.fill('input[name="password"]', 'wrongpass');
  await page.click('button[type="submit"]');
});

