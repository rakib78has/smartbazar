import { test, expect } from '@playwright/test';

test.describe('Customer Order Self-Tracking', () => {
  test('should search order by order number and display timeline', async ({ page }) => {
    await page.goto('/track-order');

    await expect(page.getByText('আপনার অর্ডার ট্র্যাক করুন')).toBeVisible();

    // Fill valid order number
    const input = page.locator('input[placeholder*="অর্ডার নম্বর বা মোবাইল"]');
    await input.fill('ORD-202611-1001');
    await page.getByRole('button', { name: 'ট্র্যাক করুন' }).click();

    // Verify order results
    await expect(page.getByText('#ORD-202611-1001')).toBeVisible();
    await expect(page.getByText('অর্ডার প্রাপ্তি')).toBeVisible();
    await expect(page.getByText('কনফার্মেশন')).toBeVisible();
  });

  test('should show friendly not-found message for unknown order', async ({ page }) => {
    await page.goto('/track-order');

    const input = page.locator('input[placeholder*="অর্ডার নম্বর বা মোবাইল"]');
    await input.fill('UNKNOWN-9999');
    await page.getByRole('button', { name: 'ট্র্যাক করুন' }).click();

    await expect(page.getByText('কোনো অর্ডার পাওয়া যায়নি')).toBeVisible();
  });
});
