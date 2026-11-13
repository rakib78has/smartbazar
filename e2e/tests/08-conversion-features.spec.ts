import { test, expect } from '@playwright/test';

test.describe('High-Conversion Features: 1-Click Quick Buy, Flash Sale, Bottom Nav & Courier Links', () => {
  test('should display flash sale countdown timer on homepage', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('আজকের ধামাকা ফ্ল্যাশ সেল!')).toBeVisible();
    await expect(page.getByText('৫০% পর্যন্ত ছাড়')).toBeVisible();
  });

  test('should open direct WhatsApp quick order modal from product card', async ({ page }) => {
    await page.goto('/');

    // Locate the first "অর্ডার করুন" button on a product card
    const quickOrderBtn = page.locator('button:has-text("অর্ডার করুন")').first();
    await expect(quickOrderBtn).toBeVisible();
    await quickOrderBtn.click();

    // Verify WhatsApp modal opened with single item checkout
    await expect(page.getByText('১-ক্লিকে সরাসরি অর্ডার করুন')).toBeVisible();
    await expect(page.locator('input[placeholder*="তামিম ইকবাল"]')).toBeVisible();
  });

  test('should display courier tracking portal link on track order page', async ({ page }) => {
    await page.goto('/track-order');

    // Search for existing demo order ORD-202611-1001
    await page.fill('input[placeholder*="অর্ডার নম্বর"]', 'ORD-202611-1001');
    await page.click('button:has-text("ট্র্যাক করুন")');

    // Check order card exists
    await expect(page.getByText('#ORD-202611-1001')).toBeVisible();

    // Check customer cash memo button exists
    const memoBtn = page.locator('button:has-text("ক্যাশ মেমো")').first();
    await expect(memoBtn).toBeVisible();
    await memoBtn.click();

    // Check Cash Memo modal opens
    await expect(page.getByText('ক্যাশ মেমো ও ডেলিভারি চালান')).toBeVisible();
  });
});
