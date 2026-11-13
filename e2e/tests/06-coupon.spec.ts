import { test, expect } from '@playwright/test';

test.describe('Coupon Code & Promotions', () => {
  test('should apply coupon and recalculate total discount in cart', async ({ page }) => {
    await page.goto('/');

    // Add first item (৳650) to cart
    const buyButton = page.locator('button[title="কার্টে যোগ করুন"]').first();
    await buyButton.click();

    // Verify Cart Drawer is open
    await expect(page.getByText('শপিং ব্যাগ (1)')).toBeVisible();

    // Test invalid coupon
    const couponInput = page.locator('input[placeholder*="কুপন কোড"]');
    await couponInput.fill('INVALID123');
    await page.getByRole('button', { name: 'প্রয়োগ' }).click();

    await expect(page.getByText('অকার্যকর কুপন কোড!')).toBeVisible();

    // Test valid coupon 'SAVE50'
    await couponInput.fill('SAVE50');
    await page.getByRole('button', { name: 'প্রয়োগ' }).click();

    // Verify discount applied
    await expect(page.getByText("কুপন 'SAVE50'")).toBeVisible();
    await expect(page.getByText('-৳50', { exact: true })).toBeVisible();

    // Click cancel coupon
    await page.getByRole('button', { name: 'বাতিল' }).click();
    await expect(page.getByText("কুপন 'SAVE50'")).not.toBeVisible();
  });
});
