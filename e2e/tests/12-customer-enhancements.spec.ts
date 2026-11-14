import { test, expect } from '@playwright/test';

test.describe('New Customer End Enhancements E2E Suite', () => {
  test('Reward Coins, Re-Order, and Cancel Order in Account Portal', async ({ page }) => {
    // 1. Login with demo customer
    await page.goto('/login');
    await page.getByRole('button', { name: /ডেমো অ্যাকাউন্ট দিয়ে অটো-ফিল করুন/ }).click();
    await page.getByRole('button', { name: 'লগইন করুন' }).click();
    await expect(page).toHaveURL(/.*\/account/);

    // 2. Verify Reward Coins Badge in Profile Welcome Card
    await expect(page.getByText(/রিওয়ার্ড কয়েন/)).toBeVisible();

    // 3. Test "আবার কিনুন" (Re-order button)
    const reorderBtn = page.getByRole('button', { name: 'আবার কিনুন' }).first();
    if (await reorderBtn.isVisible()) {
      await reorderBtn.click();
      // Verify Cart Drawer opened
      await expect(page.getByRole('heading', { name: /শপিং ব্যাগ/ })).toBeVisible();
      // Close Cart Drawer
      await page.keyboard.press('Escape');
    }

    // 4. Test "বাতিল করুন" (Cancel pending order) if any pending order exists
    const cancelBtn = page.getByRole('button', { name: 'বাতিল করুন' }).first();
    if (await cancelBtn.isVisible()) {
      page.once('dialog', (dialog) => dialog.accept());
      await cancelBtn.click();
      await expect(page.getByText('বাতিল').first()).toBeVisible();
    }
  });

  test('bKash / Nagad Send Money, Delivery Time Slot, and Coins Redemption in Checkout', async ({ page }) => {
    // 1. Login first to have coins
    await page.goto('/login');
    await page.getByRole('button', { name: /ডেমো অ্যাকাউন্ট দিয়ে অটো-ফিল করুন/ }).click();
    await page.getByRole('button', { name: 'লগইন করুন' }).click();
    await expect(page).toHaveURL(/.*\/account/);

    // 2. Go to Homepage & open Quick Checkout
    await page.goto('/');
    const buyBtn = page.locator('button[title="সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন"]').first();
    await buyBtn.click();

    // 3. Verify Payment Method options
    await expect(page.getByRole('button', { name: /ক্যাশ অন ডেলিভারি/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /বিকাশ/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /নগদ/ })).toBeVisible();

    // 4. Click bKash and verify Send Money instructions & TrxID field appear
    await page.getByRole('button', { name: /বিকাশ/ }).click();
    await expect(page.getByText(/বিকাশ পার্সোনাল নম্বর/)).toBeVisible();
    await expect(page.getByPlaceholder('যেমন: 9K32LM8P')).toBeVisible();

    // 5. Select a preferred Delivery Time Slot
    const slotBtn = page.getByRole('button', { name: 'বিকেল ৫টা - ৮টা' });
    await expect(slotBtn).toBeVisible();
    await slotBtn.click();

    // 6. Test Reward Coins Redemption toggle
    const coinsToggle = page.locator('input[type="checkbox"]').filter({ hasText: '' }).first();
    if (await page.getByText(/কয়েন রিডিম করুন/).isVisible()) {
      await page.getByText(/কয়েন রিডিম করুন/).click();
      await expect(page.getByText(/মোট ডিসকাউন্ট/)).toBeVisible();
    }
  });

  test('Product Share Button, Voice Search Microphone, and Product Reviews', async ({ page }) => {
    // 1. Visit Storefront
    await page.goto('/');

    // 2. Verify Bangla Voice Search microphone button in search bar
    const voiceBtn = page.locator('button[aria-label="ভয়েস সার্চ"]').first();
    await expect(voiceBtn).toBeVisible();

    // 3. Verify Share button on product card
    const cardShareBtn = page.locator('button[title="বন্ধুদের সাথে হোয়াটসঅ্যাপে শেয়ার করুন"]').first();
    await expect(cardShareBtn).toBeVisible();

    // 4. Open Product Detail Modal
    const productCard = page.locator('h3').first();
    await productCard.click();

    // 5. Verify Modal Share Button & Reviews
    await expect(page.locator('button[title="হোয়াটসঅ্যাপে শেয়ার করুন"]')).toBeVisible();
    await expect(page.locator('button[title="লিংক কপি করুন"]')).toBeVisible();
    await expect(page.getByText(/কাস্টমার রিভিউসমূহ/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'রিভিউ সাবমিট করুন' })).toBeVisible();
  });
});
