import { test, expect } from '@playwright/test';

test.describe('Admin Full Control & Backoffice Hub Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Login to Admin Panel
    await page.goto('/admin/login');
    await page.locator('input[type="email"]').fill('admin@smartbazar.com');
    await page.locator('input[type="password"]').fill('admin123456');
    await page.getByRole('button', { name: 'লগইন করুন' }).click();
    await expect(page).toHaveURL(/.*\/admin/);
  });

  test('Customer Directory & Bonus Coin Gifting', async ({ page }) => {
    // 1. Click "ক্রেতা ও কয়েন হাব" in sidebar
    await page.getByRole('button', { name: /ক্রেতা ও কয়েন হাব/ }).click();
    await expect(page.getByText('মোট নিবন্ধিত ক্রেতা')).toBeVisible();

    // 2. Verify registered customer table
    await expect(page.getByText('তানভীর আহমেদ').first()).toBeVisible();
    await expect(page.getByText('01712345678').first()).toBeVisible();

    // 3. Click "কয়েন দিন" (Gift bonus coins)
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'কয়েন দিন' }).first().click();

    // Modal opens
    await expect(page.getByText('বোনাস কয়েন উপহার দিন')).toBeVisible();
    await page.getByRole('button', { name: 'উপহার পাঠান' }).click();
  });

  test('Customer Reviews Moderation Hub', async ({ page }) => {
    // 1. Click "রিভিউ মডারেশন" in sidebar
    await page.getByRole('button', { name: /রিভিউ মডারেশন/ }).click();
    await expect(page.getByText('কাস্টমার রিভিউ ও রেটিং মডারেশন')).toBeVisible();

    // 2. Verify review cards
    const toggleBtn = page.getByRole('button', { name: /অনুমোদন/ }).first();
    await expect(toggleBtn).toBeVisible();
  });

  test('Coupon Manager & Dynamic Promotion Creation', async ({ page }) => {
    // 1. Click "কুপন ও প্রমোশন" in sidebar
    await page.getByRole('button', { name: /কুপন ও প্রমোশন/ }).click();
    await expect(page.getByText('কুপন কোড ও প্রমোশন ম্যানেজার')).toBeVisible();

    // 2. Click "নতুন কুপন যোগ করুন"
    await page.getByRole('button', { name: 'নতুন কুপন যোগ করুন' }).click();

    // 3. Fill form
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('input[placeholder="যেমন: EID50 বা SALE10"]').fill('WINTER25');
    await page.getByRole('button', { name: 'কুপন সংরক্ষণ করুন' }).click();

    // 4. Verify new coupon exists in table
    await expect(page.getByText('WINTER25')).toBeVisible();
  });

  test('Store Settings: bKash/Nagad Numbers & Marketing Widget Toggles', async ({ page }) => {
    // 1. Click "স্টোর ও হোয়াটসঅ্যাপ সেটিংস"
    await page.getByRole('button', { name: /স্টোর ও হোয়াটসঅ্যাপ সেটিংস/ }).click();

    // 2. Verify bKash and Nagad personal number fields
    await expect(page.getByText('বিকাশ ও নগদ পার্সোনাল নম্বর')).toBeVisible();
    await expect(page.locator('input[value="01700000000"]').first()).toBeVisible();

    // 3. Verify Marketing toggles
    await expect(page.getByText('মার্কেটিং ও কনভার্সন উইজেট নিয়ন্ত্রণ')).toBeVisible();
    await expect(page.getByText('⚡ ফ্ল্যাশ সেল কাউন্টডাউন টাইমার')).toBeVisible();
    await expect(page.getByText('🔔 লাইভ সেলস পপআপ নোটিফিকেশন')).toBeVisible();
    await expect(page.getByText('🎁 ভাগ্যের চাকা (Spin Wheel Modal)')).toBeVisible();

    // 4. Save settings
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'সেটিংস সংরক্ষণ করুন' }).click();
  });
});
