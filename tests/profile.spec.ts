import { test, expect } from '@playwright/test';


test.beforeEach(async ({ page }) => {

    await page.goto('http://localhost:4200/login');

    await page.fill('input[name="username"]', 'pragati_sharma45');
    await page.fill('input[name="email"]', 'pragati8899@gmail.com');
    await page.fill('input[name="password"]', 'pragati@123');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:4200/home');
    await page.goto('http://localhost:4200/profile'); 

    await expect(page).toHaveURL('http://localhost:4200/profile');
});

  test('should display profile picture, username, and bio', async ({ page }) => {
    const profilePic = page.locator('.profile-container img').nth(1); 
    const username = page.locator('.text-white.font-medium.text-2xl');
    const bio = page.locator('.text-gray-300.font-light.text-xl');

    await expect(profilePic).toBeVisible();
    await expect(username).toBeVisible();
    await expect(bio).toBeVisible();
  });

  test('should allow navigating between sections (Posts, Collections, Followers, Following)', async ({ page }) => {
    const postsTab = page.locator('div.cursor-pointer:has-text("Posts")');
    const collectionsTab = page.locator('div.cursor-pointer:has-text("Collections")');
    const followersTab = page.locator('div.cursor-pointer:has-text("Followers")');
    const followingTab = page.locator('div.cursor-pointer:has-text("Following")');

    await postsTab.click();
    await expect(postsTab).toHaveClass(/bg-slate-800/);

    await collectionsTab.click();
    await expect(collectionsTab).toHaveClass(/bg-slate-800/);

    await followersTab.click();
    await expect(followersTab).toHaveClass(/bg-slate-800/);

    await followingTab.click();
    await expect(followingTab).toHaveClass(/bg-slate-800/);
  });

  test('should show "Add New" button when no posts exist', async ({ page }) => {
    const addNewSection = page.locator('section:has-text("Add New")');
    await expect(addNewSection).toBeVisible();
  });

  test('should allow liking a post', async ({ page }) => {
    const firstLikeButton = page.locator('.heart-container').nth(0);
    const likeCount = firstLikeButton.locator('span.text-gray-400');

    const initialLikes = await likeCount.innerText();

    await firstLikeButton.click();
    await expect(likeCount).not.toHaveText(initialLikes);
  });

  test('should allow commenting on a post', async ({ page }) => {
    const firstCommentButton = page.locator('span.material-icons:has-text("chat_bubble_outline")').first();
    await firstCommentButton.click();

    const commentDialog = page.locator('.custom-dialog-background'); 
    await expect(commentDialog).toBeVisible();
    const commentInput = commentDialog.locator('input[type="text"]'); 
    await expect(commentInput).toBeVisible();

    await commentInput.fill('Nice post!');
    await commentDialog.locator('button:has-text("Post")').click();
    const newComment = commentDialog.locator('.comments-section .comment').last();
    await expect(newComment).toContainText('Nice post!');
});

test('should allow deleting a post', async ({ page }) => {
  const firstPostContainer = page.locator('section:has(img.imageSection)').first();
  await firstPostContainer.hover();
  await page.waitForTimeout(500); 

  const firstDeleteButton = firstPostContainer.locator('button:has(span.deleteIcon)');
  await expect(firstDeleteButton).toBeVisible();
  
  await firstDeleteButton.click();
  await expect(firstPostContainer).toBeHidden();
});

test.describe('Collections Feature', () => {
  test('should be able to move to collections and open dialog', async ({ page }) => {

    const collectionPost = page.locator('div.collectionLable');
    await collectionPost.click();

    const containerExists = await page.locator('div.collectionsContainer').count();

    if (containerExists === 0) {
      console.warn("⚠️ collectionsContainer not found!");
    } else {
      await page.waitForSelector('div.collectionsContainer', { state: 'visible' });
    }

    const collections = page.locator('div.collectionBoxes').nth(0);

      await collections.click();

      const dialogBox = page.locator('.custom-dialog-background'); 
      await expect(dialogBox).toBeVisible();

      const collectionName = page.locator('.custom-dialog-background p'); 
      await expect(collectionName).not.toBeEmpty();
  });
});  


test.describe('Followers Feature', () => {
  test('should be able to move to followers and open profile', async ({ page }) => {

    const collectionPost = page.locator('div.followersLable');
    await collectionPost.click();

    const containerExists = await page.locator('div.followersContainer').count();

    if (containerExists === 0) {
      console.warn("⚠️ Followers Container not found!");
    } else {
      await page.waitForSelector('div.followersLable', { state: 'visible' });
    }

    const collections = page.locator('div.followersData').nth(0);

    await collections.click();
    await page.waitForURL(/\/profile\/rPhaLqrM3PRFQuLQYa74ljGC5ic2\?data=true/, { timeout: 5000 });
    expect(page.url()).toContain('/profile/rPhaLqrM3PRFQuLQYa74ljGC5ic2?data=true');
    const username = page.locator('.username');
    await expect(username).toBeVisible();
    await expect(username).toHaveText('Gyan123');

  });
});  


test.describe.only('Following Feature', () => {
  test('should be able to move to following and open profile', async ({ page }) => {

    const collectionPost = page.locator('div.followingLable');
    await collectionPost.click();

    const containerExists = await page.locator('div.followingLable').count();

    if (containerExists === 0) {
      console.warn("⚠️ Following Container not found!");
    } else {
      await page.waitForSelector('div.followingLable', { state: 'visible' });
    }

    const collections = page.locator('div.followingData').nth(0);

      await collections.click();
    await page.waitForURL(/\/profile\/insta_002\?data=true/);
    expect(page.url()).toContain('/profile/insta_002?data=true');
    const username = page.locator('.username');
    await expect(username).toBeVisible();
    await expect(username).toHaveText('tech_guru');

    const imageSection = page.locator('imageSection').nth(0);
    await imageSection.hover();
  await page.waitForTimeout(500); 

  // const firstDeleteButton = imageSection.locator('button:has(span.deleteIcon)');
  // await expect(firstDeleteButton).N();

    const profileLoader = page.locator('img.profilePicUser');
    await profileLoader.click();
    const dialogBox = page.locator('.mat-mdc-dialog-container');
    await expect(dialogBox).toHaveCount(0);

  });
});  
