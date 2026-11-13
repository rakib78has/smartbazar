import { test, expect } from '@playwright/test';

test.describe('New Features: Spin Wheel, Dual Language, Dark Mode & Fraud Shield', () => {
  test('should display floating spin wheel button and open modal', async ({ page }) => {
    await page.goto('/');

    const spinButton = page.locator('button:has-text("ভাগ্যের চাকা")');
    await expect(spinButton).toBeVisible();

    await spinButton.click({ force: true });
    await expect(page.getByText('ভাগ্যের চাকা ঘুরান!')).toBeVisible();
    await expect(page.locator('button:has-text("স্পিন!")')).toBeVisible();
  });

  test('should switch between Bengali and English', async ({ page }) => {
    await page.goto('/');

    // Check default Bengali text
    await expect(page.getByText('ট্র্যাক অর্ডার')).toBeVisible();

    // Click language switcher button
    const langBtn = page.locator('button:has-text("বাং")');
    await expect(langBtn).toBeVisible();
    await langBtn.click();

    // Language switched to EN
    await expect(page.locator('button:has-text("EN")')).toBeVisible();
    await expect(page.getByText('Track Order')).toBeVisible();
    await expect(page.getByText('Cart')).toBeVisible();

    // Switch back to Bengali
    await page.locator('button:has-text("EN")').click();
    await expect(page.getByText('ট্র্যাক অর্ডার')).toBeVisible();
  });

  test('should toggle dark mode theme', async ({ page }) => {
    await page.goto('/');

    // Locate theme toggle button
    const themeBtn = page.locator('button[aria-label="ডার্ক মোড পরিবর্তন করুন"]');
    await expect(themeBtn).toBeVisible();

    // Click to activate dark mode
    await themeBtn.click();
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Click again to deactivate
    await themeBtn.click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test('should allow admin to export orders to CSV and toggle fraud shield', async ({ page }) => {
    // Login to admin panel
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@smartbazar.com');
    await page.fill('input[type="password"]', 'admin123456');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin/);

    // Check Overview tab CSV export button
    const exportBtn = page.getByText('এক্সেল রিপোর্ট');
    await expect(exportBtn).toBeVisible();

    // Navigate to Orders Tab
    await page.click('button:has-text("অর্ডার ও কুরিয়ার")');

    // Check Orders Tab CSV export button
    const ordersExportBtn = page.getByText('এক্সেল এক্সপোর্ট');
    await expect(ordersExportBtn).toBeVisible();

    // Locate Fraud Shield alert button on first order
    const fraudShieldBtn = page.locator('button[title*="চিহ্নিত করুন"]').first();
    if (await fraudShieldBtn.isVisible()) {
      await fraudShieldBtn.click();
      // Should now be flagged as risky
      await expect(page.getByText('ঝুঁকিপূর্ণ কাস্টমার').first()).toBeVisible();
    }
  });
});
