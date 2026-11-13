import { test, expect } from '@playwright/test';

test.describe('Meta Pixel Tracking & Order Celebration Suite', () => {
  test('should access analytics tab in admin panel, trigger test events and test confetti/sound', async ({ page }) => {
    // 1. Login to Admin Panel
    await page.goto('/admin/login');
    await page.locator('input[type="email"]').fill('admin@smartbazar.com');
    await page.locator('input[type="password"]').fill('admin123456');
    await page.getByRole('button', { name: 'লগইন করুন' }).click();

    await expect(page).toHaveURL(/.*\/admin$/);
    await expect(page.getByText('অ্যাডমিন হাব')).toBeVisible();

    // 2. Click Left Sidebar Menu item: "পিক্সেল ও কনভার্সন ট্র্যাকিং"
    const analyticsTabBtn = page.getByRole('button', { name: /পিক্সেল ও কনভার্সন ট্র্যাকিং/ });
    await expect(analyticsTabBtn).toBeVisible();
    await analyticsTabBtn.click();

    // 3. Verify Meta Pixel & GA4 configuration inputs are visible
    await expect(page.getByText('মেটা (ফেসবুক) পিক্সেল ও গুগল অ্যানালিটিক্স হাব')).toBeVisible();
    await expect(page.locator('input[placeholder*="123456789012345"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="G-XXXXXXXXXX"]')).toBeVisible();

    // 4. Test sound and confetti test buttons in the celebration tester card
    const soundBtn = page.getByRole('button', { name: /মিষ্টি সাউন্ড টেস্ট করুন/ });
    await expect(soundBtn).toBeVisible();
    await soundBtn.click();

    const confettiBtn = page.getByRole('button', { name: /রঙিন কনফেটি টেস্ট করুন/ });
    await expect(confettiBtn).toBeVisible();
    await confettiBtn.click();

    // Verify canvas element was injected into DOM
    await expect(page.locator('#order-celebration-confetti')).toBeAttached();

    // 5. Test firing live pixel events
    const fireAddToCartBtn = page.getByRole('button', { name: '+ টেস্ট AddToCart' });
    await fireAddToCartBtn.click();

    const firePurchaseBtn = page.getByRole('button', { name: '+ টেস্ট Purchase (৳১,৪৫০)' });
    await firePurchaseBtn.click();

    // 6. Verify events are recorded in the audit log table
    await expect(page.getByText('AddToCart').first()).toBeVisible();
    await expect(page.getByText('Purchase').first()).toBeVisible();
  });
});
