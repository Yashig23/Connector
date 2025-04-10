import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/login');

    await page.fill('input[name="username"]', 'pragati_sharma45');
    await page.fill('input[name="email"]', 'pragati8899@gmail.com');
    await page.fill('input[name="password"]', 'pragati@123');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:4200/home');
    await page.goto('http://localhost:4200/search');

    await expect(page).toHaveURL('http://localhost:4200/search');
});

test.describe('People Near You Component', () => {
    const searchInput = 'input[placeholder="Search by name or username..."]';
    const peopleList = 'p.filteredUsername';

    test('should display search bar', async ({ page }) => {
        await expect(page.locator(searchInput)).toBeVisible();
    });

    test('should filter people based on search input', async ({ page }) => {
        await page.fill(searchInput, 'anukriti');
        await page.waitForTimeout(1000); 
    
        const filteredList = page.locator('p.filteredUsername');
        await expect(filteredList.nth(0)).toContainText('anukirti_234'); 
    });    
});

test('should display follow button and toggle follow status', async ({ page }) => {
    const followButton = 'button.follow-button';
    const follow = page.locator(followButton).nth(1);
    await expect(follow).toBeVisible();
    await follow.click();

    await expect(follow).toHaveText('Following', { timeout: 3000 }); 
});

// test.describe('Follow Button Toggle', () => {
    
//     test('should search and toggle follow button for gagan@123', async ({ page }) => {
//         const searchInput = 'input[placeholder="Search by name or username..."]';
//         await page.fill(searchInput, 'gagan');
//         await page.waitForTimeout(1000); 

//         const filteredList = page.locator('p.filteredUsername');
//         await expect(filteredList.nth(0)).toContainText('gagan@123'); 

//         const followButton = page.locator('.follow-button').nth(0);

//         await expect(followButton).toBeVisible({ timeout: 5000 });

//         await expect(followButton).toHaveText('Following', { timeout: 5000 });

//         await followButton.click();
//         await expect(followButton).toHaveText('Follow', { timeout: 5000 });
//     });

// });

test.describe('Follow Button Toggle', () => {
    
    test('should search and toggle follow button for Hari_123', async ({ page }) => {
        const searchInput = 'input[placeholder="Search by name or username..."]';
        await page.fill(searchInput, 'Hari_123');
        await page.waitForTimeout(1000); 

        const filteredList = page.locator('p.filteredUsername');
        await expect(filteredList.nth(0)).toContainText('Hari_123'); 

        const followButton = page.locator('.follow-button').nth(0);
        await expect(followButton).toBeVisible({ timeout: 5000 });

        // **Retry Logic**
        let maxRetries = 2;
        for (let i = 0; i < maxRetries; i++) {
            await followButton.click();
            await page.waitForTimeout(2000);
            
            if (await followButton.textContent() === 'Follow') {
                break; 
            }

            if (i < maxRetries - 1) {
                await page.waitForTimeout(5000); 
            }
        }

        await expect(followButton).toHaveText('Follow', { timeout: 5000 });
    });

});


test.describe('Continue the Convo Component', () => {
    test('should display chat list if users exist', async ({ page }) => {
        await expect(page.locator('.chat-list')).toBeVisible();
    });

    // test('should show message if no chat history', async ({ page }) => {
    //     await expect(page.locator('.noChatMessage')).toBeVisible();
    // });

    test('should open chat when chat button is clicked', async ({ page }) => {
        const chatButton = page.locator('button:has(mat-icon.chatBubble)').nth(1);
        await expect(chatButton).toBeVisible();

        await chatButton.click();

        await page.waitForURL(/messages\/[a-zA-Z0-9]+/);
        await expect(page).toHaveURL(/messages\/[a-zA-Z0-9]+/);
        const chatSection = page.locator('.chat-container');
        const profileSection = page.locator('.profile-section');

        await expect(chatSection).toBeVisible();
        await expect(profileSection).toBeVisible();
    });

});
