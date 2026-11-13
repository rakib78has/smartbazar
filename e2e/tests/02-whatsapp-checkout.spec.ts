import { test, expect } from '@playwright/test';

test.describe('WhatsApp Checkout Automation', () => {
  test('should add product to cart and open WhatsApp checkout', async ({ page, context }) => {
    await page.goto('/');

    // Click "কিনুন" (Buy) button on first card
    const buyButton = page.locator('button[title="কার্টে যোগ করুন"]').first();
    await buyButton.click();

    // Verify Cart Drawer is opened
    await expect(page.getByText('শপিং ব্যাগ (1)')).toBeVisible();

    // Click "অর্ডার করুন (WhatsApp)"
    await page.getByRole('button', { name: 'অর্ডার করুন (WhatsApp)' }).click();

    // Verify WhatsApp checkout modal is visible
    await expect(page.getByText('হোয়াটসঅ্যাপে অর্ডার কনফার্ম করুন')).toBeVisible();

    // Fill form
    await page.locator('input[placeholder*="মোঃ তামিম"]').fill('আব্দুর রহমান');
    await page.locator('input[placeholder="01XXXXXXXXX"]').fill('01712345678');
    await page.locator('textarea[placeholder*="বাড়ি নং"]').fill('হাউজ ১০, ধানমন্ডি, ঢাকা');

    // Intercept window.open
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: /হোয়াটসঅ্যাপে অর্ডার পাঠান/ }).click();

    // Verify success confirmation
    await expect(page.getByText('অর্ডার হোয়াটসঅ্যাপে পাঠানো হয়েছে!')).toBeVisible();

    // Check popup url redirected to WhatsApp
    const popup = await popupPromise;
    const url = popup.url();
    expect(url).toContain('whatsapp.com');
    expect(url).toContain('01712345678');
  });
});
