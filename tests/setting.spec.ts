import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/login');

    await page.fill('input[name="username"]', 'pragati_sharma45');
    await page.fill('input[name="email"]', 'pragati8899@gmail.com');
    await page.fill('input[name="password"]', 'pragati@123');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:4200/home');
    await page.goto('http://localhost:4200/setting'); 

    await expect(page).toHaveURL('http://localhost:4200/setting');
});

  test('should display Settings header', async ({ page }) => {
    const header = page.locator('h2:has-text("Settings")');
    await expect(header).toBeVisible();
  });

  test('should display profile picture and username', async ({ page }) => {
    const profilePic = page.locator('img[alt="Profile Picture"]');
    const username = page.locator('label.usernameSec');

    await expect(profilePic).toBeVisible();
    await expect(username).toBeVisible();
  });

  test('should allow selecting an image after clicking Change Profile Picture button', async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button:has-text("Change Profile Picture")').click();
    const fileChooser = await fileChooserPromise;
    await page.waitForTimeout(10000);
    await expect(page.locator('img')).toBeVisible();
});


  test('should allow updating the bio', async ({ page }) => {
    const bioInput = page.locator('textarea');
    await expect(bioInput).toBeVisible();
    
    await bioInput.fill('This is my new bio!');
    const SaveBtn = page.locator('button.saveBtn');
    await SaveBtn.click();
    await page.waitForTimeout(1000); 
    await expect(bioInput).toHaveValue('This is my new bio!');
  });

  test('should open confirmation dialog on logout click', async ({ page }) => {
    const logoutButton = page.locator('button:has-text("Log Out")');
    await logoutButton.click();
    const confirmDialog = page.locator('.mat-mdc-dialog-container:has-text("Confirm Logout")');

    await expect(confirmDialog).toBeVisible();

    await expect(confirmDialog.locator('p:has-text("Are you sure you want to log out?")')).toBeVisible();

    const yesLogout = confirmDialog.locator('button:has-text("Yes, Logout")');
    const cancelBtn = confirmDialog.locator('button:has-text("Cancel")');

    await expect(yesLogout).toBeVisible();
    await expect(cancelBtn).toBeVisible();
});
test('should log out when confirming logout', async ({ page }) => {
    const logoutButton = page.locator('button:has-text("Log Out")');
    await logoutButton.click();

    const yesLogout = page.locator('button:has-text("Yes, Logout")');
    await yesLogout.click();

    await page.waitForTimeout(3000);
    await expect(page).toHaveURL('http://localhost:4200/login');
});

test.only('should stay on the same page when canceling logout', async ({ page }) => {
    const logoutButton = page.locator('button:has-text("Log Out")');
    await logoutButton.click();

    const confirmDialog = page.locator('.mat-mdc-dialog-container:has-text("Confirm Logout")');
    const cancelBtn = confirmDialog.locator('button:has-text("Cancel")');

    await cancelBtn.click();
    await expect(page).not.toHaveURL('http://localhost:4200/login');
});


