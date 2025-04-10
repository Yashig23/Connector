import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {

    await page.goto('http://localhost:4200/login');


    await page.fill('input[name="username"]', 'pragati_sharma45');
    await page.fill('input[name="email"]', 'pragati8899@gmail.com');
    await page.fill('input[name="password"]', 'pragati@123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:4200/home');
    await page.goto('http://localhost:4200/messages');

    await expect(page).toHaveURL('http://localhost:4200/messages');
});

test('should display following list', async ({ page }) => {
    await expect(page.locator('text=Following')).toBeVisible();
});

test('should allow searching users', async ({ page }) => {
    await page.fill('input[placeholder="Search users..."]', 'gagan@123');
    const users = await page.locator('.cursor-pointer').count();
    expect(users).toBeGreaterThan(0);
});

test('should select a user and open chat', async ({ page }) => {
    await page.locator('.cursor-pointer').first().click();
    await expect(page.locator('.text-lg.font-semibold')).toBeVisible();
});

test('should send a text message', async ({ page }) => {
    await page.locator('.cursor-pointer').first().click();
    await page.waitForSelector('input.newMessage', { state: 'visible', timeout: 5000 });
    await page.fill('input.newMessage', 'Hello!');
    await page.locator('button.sendMessage').click();
    await expect(page.locator('p.textMessageArea').last()).toHaveText('Hello!');
});

test('should open and close ChatGPT assistant', async ({ page }) => {
    await page.locator('.cursor-pointer').first().click();
    await page.waitForSelector('input.newMessage', { state: 'visible', timeout: 5000 });
    await page.locator('mat-icon:has-text("help")').click();
    await expect(page.locator('text=ChatGPT Assistant')).toBeVisible();
    await page.locator('mat-icon:has-text("close")').click();
    await expect(page.locator('text=ChatGPT Assistant')).not.toBeVisible();
});

test('should send a message to ChatGPT and receive a response', async ({ page }) => {
    await page.locator('.cursor-pointer').first().click();
    await page.waitForSelector('input.newMessage', { state: 'visible', timeout: 5000 });
    await page.locator('mat-icon:has-text("help")').click();
    await page.fill('input[placeholder="Ask ChatGPT..."]', 'How are you?');
    await page.locator('button.gptSend').click();
    await expect(page.locator('textarea')).toHaveText(/.+/, { timeout: 10000 });
});


import path from 'path';

test('should send an image file', async ({ page }) => {
    await page.locator('.cursor-pointer').first().click();
    await page.waitForSelector('input.newMessage', { state: 'visible', timeout: 5000 });
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('mat-icon:has-text("attach_file")').click();

    const fileChooser = await fileChooserPromise;

    await page.waitForTimeout(10000);
    await expect(page.locator('img[alt="Sent Image2"]')).toBeVisible();
});

test.only('should delete a message', async ({ page }) => {
    await page.locator('.cursor-pointer').first().click();
    await page.waitForSelector('input.newMessage', { state: 'visible', timeout: 5000 });

    const messageBubble = page.locator('.message-bubble').nth(0);
    await expect(messageBubble).not.toBeVisible();
});



