import { test, expect } from '@playwright/test';

test.describe('Admin Panel Dashboard & Management', () => {
  test('should load admin dashboard and display metrics', async ({ page }) => {
    await page.goto('/admin');

    // Verify Admin Header
    await expect(page.getByText('অ্যাডমিন হাব')).toBeVisible();

    // Verify Overview Metric Cards
    await expect(page.getByText('মোট সেলস')).toBeVisible();
    await expect(page.getByText('পেন্ডিং অর্ডার')).toBeVisible();
  });

  test('should switch between tabs and view store settings', async ({ page }) => {
    await page.goto('/admin');

    // Click "স্টোর ও হোয়াটসঅ্যাপ সেটিংস" tab
    await page.getByRole('button', { name: /স্টোর ও হোয়াটসঅ্যাপ সেটিংস/ }).click();

    // Verify WhatsApp number input exists
    await expect(
      page.getByText('প্রাথমিক হোয়াটসঅ্যাপ নম্বর (যেখানে কাস্টমার মেসেজ পাঠাবে)')
    ).toBeVisible();

    // Click "পণ্য ও স্টক" tab
    await page.getByRole('button', { name: /পণ্য ও স্টক/ }).click();
    await expect(page.getByRole('button', { name: 'নতুন পণ্য যুক্ত করুন' })).toBeVisible();
  });
});
