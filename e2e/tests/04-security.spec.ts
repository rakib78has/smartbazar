import { test, expect } from '@playwright/test';

test.describe('Security & Validation Checks', () => {
  test('should reject invalid phone numbers and show error', async ({ page }) => {
    await page.goto('/');

    // Open first product & 1-click order
    const firstCard = page.locator('.group.bg-white.rounded-2xl').first();
    await firstCard.click();

    await page.getByRole('button', { name: 'সরাসরি হোয়াটসঅ্যাপে অর্ডার' }).click();

    // Fill invalid phone number
    await page.locator('input[placeholder*="মোঃ তামিম"]').fill('টেস্ট ইউজার');
    await page.locator('input[placeholder="01XXXXXXXXX"]').fill('99999'); // Invalid BD number
    await page.locator('textarea[placeholder*="বাড়ি নং"]').fill('ঢাকা');

    await page.getByRole('button', { name: /হোয়াটসঅ্যাপে অর্ডার পাঠান/ }).click();

    // Verify error message is displayed
    await expect(page.getByText('সঠিক বাংলাদেশি মোবাইল নম্বর দিন')).toBeVisible();
  });
});
