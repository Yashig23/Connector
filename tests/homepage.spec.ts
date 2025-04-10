import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {

  await page.goto('http://localhost:4200/login'); 

  await page.fill('input[name="username"]', 'pragati_sharma45');
  await page.fill('input[name="email"]', 'pragati8899@gmail.com');
  await page.fill('input[name="password"]', 'pragati@123'); 

  await page.click('button[type="submit"]'); 

  await expect(page).toHaveURL('http://localhost:4200/home'); 
});

test('Upload profile photo and verify visibility', async ({ page }) => { 

  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.locator('span.absolute.bottom-0.right-1').click();

  const fileChooser = await fileChooserPromise;

  await page.waitForTimeout(10000);

  await page.waitForTimeout(3000);

  await page.locator('img[alt="Your Image"]').click();

  await expect(page.locator('mat-dialog-container')).toBeVisible(); 
});

test('User image click should open the dialog', async ({ page }) => {

    const userImage = page.locator('.contentImage').nth(1);
    await userImage.click();

    const dialog = page.locator('mat-dialog-container'); 
    await expect(dialog).toBeVisible();
});

test('Liking the heart icon should change its class', async ({ page }) => {
  const heartIcon = page.locator('.heart-container .material-icons').nth(1);

  await page.waitForSelector('.heart-container .material-icons', { state: 'visible' });
  await page.waitForSelector('.heart-container .material-icons', { state: 'attached' });

  await expect(heartIcon).toHaveClass('material-icons text-gray-300');

  await heartIcon.scrollIntoViewIfNeeded();
  await heartIcon.click({ force: true });

  await page.waitForTimeout(1000);

  await expect(heartIcon).toHaveClass('material-icons text-gray-300', { timeout: 5000 });
});

test('Clicking bookmark should open bottom sheet', async ({ page }) => {
  const bookmarkButton = page.locator('.bookmarkIcon').nth(1); 
  const bottomSheet = page.locator('.cdk-overlay-container .custom-bottom-sheet');

  await expect(bottomSheet).not.toBeVisible();

  await bookmarkButton.click();

  await page.waitForSelector('.cdk-overlay-container .custom-bottom-sheet', { timeout: 5000 });

  await expect(bottomSheet).toBeVisible();

  const imageElement = page.locator('.cdk-overlay-container .custom-bottom-sheet img');
  await expect(imageElement).toBeVisible();
});

test('Creating new collection should show dialog and close after creation', async ({ page }) => {
  
  const bookmarkButton = page.locator('.bookmarkIcon').nth(1); 
  const bottomSheet = page.locator('.cdk-overlay-container .custom-bottom-sheet');

  await expect(bottomSheet).not.toBeVisible();

  await bookmarkButton.click();

  await page.waitForSelector('.cdk-overlay-container .custom-bottom-sheet', { timeout: 5000 });

  await expect(bottomSheet).toBeVisible();

  const imageElement = page.locator('.cdk-overlay-container .custom-bottom-sheet img');
  await expect(imageElement).toBeVisible();

  await page.locator('.createNewCollectionBtn').click();

  const showCreateCollection = page.locator('.showCreateCollection');
  await expect(showCreateCollection).toBeVisible();

  await page.fill('.collectionName', 'My Collection');
  await page.locator('.createButton').click();

});

test('Send button should send the file and close the bottom sheet', async ({ page }) => {
  const sendButton = page.locator('sendButton').nth(1);
  await expect(sendButton).toBeVisible();
  await sendButton.click();

  const bottomSheet = page.locator('.cdk-overlay-container .custom-bottom-sheet');

  await expect(bottomSheet).toBeVisible({ timeout: 3000 });

  const send2Button = page.locator('.sendButton').nth(1);
  await expect(send2Button).toBeVisible();

  await send2Button.click();

  await page.waitForSelector('.custom-bottom-sheet', { state: 'hidden', timeout: 5000 });
  await expect(bottomSheet).toBeHidden();
});




