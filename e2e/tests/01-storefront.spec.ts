import { test, expect } from '@playwright/test';

test.describe('Storefront & Catalog Tests', () => {
  test('should load homepage and display store header and products', async ({ page }) => {
    await page.goto('/');

    // Check store name / header
    await expect(page.locator('header')).toBeVisible();

    // Check products grid
    const productCards = page.locator('.group.bg-white.rounded-2xl');
    await expect(productCards.first()).toBeVisible();
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter products when clicking category pills', async ({ page }) => {
    await page.goto('/');

    // Click on "পোশাক ও ফ্যাশন" category pill
    const categoryBtn = page.getByRole('button', { name: 'পোশাক ও ফ্যাশন' });
    await categoryBtn.click();

    // Verify products are filtered
    const cards = page.locator('.group.bg-white.rounded-2xl');
    await expect(cards.first()).toBeVisible();
  });

  test('should search products with live search', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="পণ্য সার্চ করুন"]').first();
    await searchInput.fill('টি-শার্ট');

    // Verify filtered product appears
    await expect(page.getByText('প্রিমিয়াম ড্রপ-শোল্ডার ওভারসাইজড টি-শার্ট')).toBeVisible();
  });

  test('should open product detail modal when clicking a card', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('.group.bg-white.rounded-2xl').first();
    await firstCard.click();

    // Verify modal is displayed with variants & WhatsApp button
    await expect(page.getByText('পছন্দের ভ্যারিয়েন্ট বেছে নিন:')).toBeVisible();
    await expect(page.getByRole('button', { name: 'সরাসরি হোয়াটসঅ্যাপে অর্ডার' })).toBeVisible();
  });
});
