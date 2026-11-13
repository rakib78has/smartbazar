import { test, expect } from '@playwright/test';

test.describe('Admin Panel Auth & Management', () => {
  test('should redirect unauthenticated users to /admin/login', async ({ page }) => {
    // Clear any local storage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Try accessing /admin directly
    await page.goto('/admin');

    // Verify redirected to /admin/login
    await expect(page).toHaveURL(/.*\/admin\/login/);
    await expect(page.getByText('অ্যাডমিন প্রবেশদ্বার')).toBeVisible();
  });

  test('should reject wrong admin credentials', async ({ page }) => {
    await page.goto('/admin/login');

    await page.locator('input[type="email"]').fill('wrong@user.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: 'লগইন করুন' }).click();

    await expect(page.getByText('ভুল ইমেইল বা পাসওয়ার্ড!')).toBeVisible();
  });

  test('should login successfully with valid credentials and view dashboard', async ({ page }) => {
    await page.goto('/admin/login');

    await page.locator('input[type="email"]').fill('admin@smartbazar.com');
    await page.locator('input[type="password"]').fill('admin123456');
    await page.getByRole('button', { name: 'লগইন করুন' }).click();

    // Verify successfully entered /admin
    await expect(page).toHaveURL(/.*\/admin$/);
    await expect(page.getByText('অ্যাডমিন হাব')).toBeVisible();

    // Check dashboard metrics
    await expect(page.getByText('মোট সেলস')).toBeVisible();
    await expect(page.getByText('পেন্ডিং অর্ডার')).toBeVisible();

    // Switch to Settings tab
    await page.getByRole('button', { name: /স্টোর ও হোয়াটসঅ্যাপ সেটিংস/ }).click();
    await expect(
      page.getByText('প্রাথমিক হোয়াটসঅ্যাপ নম্বর (যেখানে কাস্টমার মেসেজ পাঠাবে)')
    ).toBeVisible();

    // Switch to Products tab
    await page.getByRole('button', { name: /পণ্য ও স্টক/ }).click();
    await expect(page.getByRole('button', { name: 'নতুন পণ্য যুক্ত করুন' })).toBeVisible();

    // Test Logout
    await page.getByRole('button', { name: 'লগআউট' }).click();
    await expect(page).toHaveURL(/.*\/admin\/login/);
  });
});
