import { test, expect } from '@playwright/test';

test.describe('Left User Sidepane & Customer Navigation Suite', () => {
  test('Guest User Sidepane Navigation & Feature Inspection', async ({ page }) => {
    await page.goto('/');

    // 1. Open User Sidepane from Navbar left menu button
    const menuBtn = page.getByRole('button', { name: 'মেনু সাইডবার খুলুন' }).first();
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // 2. Verify Sidepane Drawer is visible
    const sidepane = page.locator('aside');
    await expect(sidepane).toBeVisible();

    // 3. Verify Guest Welcome Banner & 50 Coins Notice
    await expect(sidepane.getByText('স্মার্টবাজারে স্বাগতম!')).toBeVisible();
    await expect(sidepane.getByRole('link', { name: 'লগইন করুন' })).toBeVisible();
    await expect(sidepane.getByRole('link', { name: 'নতুন অ্যাকাউন্ট' })).toBeVisible();

    // 4. Verify Categories
    await expect(sidepane.getByText('ইলেকট্রনিক্স ও গ্যাজেট')).toBeVisible();
    await expect(sidepane.getByText('পোশাক ও ফ্যাশন')).toBeVisible();

    // 5. Verify Active Coupons & 1-Click Copy
    await expect(sidepane.getByText('SAVE50')).toBeVisible();
    const copyBtn = sidepane.getByRole('button', { name: /কপি/ }).first();
    await copyBtn.click();
    await expect(sidepane.getByText('কপি হয়েছে!').first()).toBeVisible();

    // 6. Verify Spin Wheel trigger
    await sidepane.getByRole('button', { name: 'ভাগ্যের চাকা ঘুরিয়ে কুপন জিতুন!' }).click();
    await expect(page.getByText('ভাগ্যের চাকা ঘুরান!')).toBeVisible();

    // Close Spin Wheel
    await page.keyboard.press('Escape');
  });

  test('Logged-in User Profile, Reward Coins, and Logout in Sidepane', async ({ page }) => {
    // 1. Login with demo customer
    await page.goto('/login');
    await page.getByRole('button', { name: /ডেমো অ্যাকাউন্ট দিয়ে অটো-ফিল করুন/ }).click();
    await page.getByRole('button', { name: 'লগইন করুন' }).click();
    await expect(page).toHaveURL(/.*\/account/);

    // 2. Open User Sidepane from Navbar
    await page.getByRole('button', { name: 'মেনু সাইডবার খুলুন' }).first().click();

    const sidepane = page.locator('aside');
    await expect(sidepane).toBeVisible();

    // 3. Verify Customer Info & Reward Coins Wallet Badge
    await expect(sidepane.getByText('তানভীর আহমেদ')).toBeVisible();
    await expect(sidepane.getByText('01712345678')).toBeVisible();
    await expect(sidepane.getByText('রিওয়ার্ড কয়েন ওয়ালেট')).toBeVisible();
    await expect(sidepane.getByText(/50 কয়েন/)).toBeVisible();

    // 4. Test Cart Drawer trigger from Sidepane
    await sidepane.getByRole('button', { name: /শপিং কার্ট/ }).click();
    await expect(page.getByText(/শপিং ব্যাগ/)).toBeVisible();

    // Close Cart Drawer
    await page.getByRole('button', { name: 'শপিং ব্যাগ বন্ধ করুন' }).click();

    // 5. Re-open Sidepane and test Logout
    await page.getByRole('button', { name: 'মেনু সাইডবার খুলুন' }).first().click();
    await page.locator('aside').getByRole('button', { name: 'লগআউট' }).click();

    // Verify redirected to login page upon logout
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('button', { name: 'লগইন করুন' })).toBeVisible();
  });
});
