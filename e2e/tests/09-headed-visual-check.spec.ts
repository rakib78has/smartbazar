import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/USER/.gemini/antigravity/brain/0a37a0c1-8c68-4caa-b9ca-e15a7b56e735';

test.describe('Headed Visual Inspection Suite', () => {
  test('Complete visual walkthrough across storefront, modal, dark mode, tracking and admin', async ({ page }) => {
    test.setTimeout(120000);

    // 1. Visit Storefront
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);

    // Save screenshot 1: Homepage & Flash Sale
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '01-homepage-flash-sale.png'), fullPage: false });

    // 2. Toggle Language to English and back to Bengali
    const langBtn = page.locator('button:has-text("বাং")');
    if (await langBtn.isVisible()) {
      await langBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '02-english-mode.png'), fullPage: false });
      await page.locator('button:has-text("EN")').click();
      await page.waitForTimeout(800);
    }

    // 3. Toggle Dark Mode
    const themeBtn = page.locator('button[aria-label="ডার্ক মোড পরিবর্তন করুন"]');
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03-dark-mode.png'), fullPage: false });
      await themeBtn.click(); // switch back to light mode
      await page.waitForTimeout(800);
    }

    // 4. Open and Spin the Wheel (ভাগ্যের চাকা)
    const spinBtn = page.locator('button:has-text("ভাগ্যের চাকা")');
    if (await spinBtn.isVisible()) {
      await spinBtn.click({ force: true });
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '04-spin-wheel-modal.png'), fullPage: false });

      // Click Spin Hub
      const centerSpinBtn = page.locator('button:has-text("স্পিন!")');
      if (await centerSpinBtn.isVisible()) {
        await centerSpinBtn.click();
        await page.waitForTimeout(4200); // Watch it spin!
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, '05-spin-wheel-result.png'), fullPage: false });
      }

      // Close modal
      const closeBtn = page.locator('button[aria-label="Close modal"]').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click({ force: true });
        await page.waitForTimeout(800);
      }
    }

    // 5. Open 1-Click Quick Order Modal from Product Card
    const quickOrderBtn = page.locator('button:has-text("অর্ডার করুন")').first();
    await quickOrderBtn.scrollIntoViewIfNeeded();
    await quickOrderBtn.click({ force: true });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '06-quick-order-modal.png'), fullPage: false });

    // Close quick order modal
    const closeQuickBtn = page.locator('button:has-text("✕")').or(page.locator('button[aria-label*="close" i]')).first();
    if (await closeQuickBtn.isVisible()) {
      await closeQuickBtn.click({ force: true });
      await page.waitForTimeout(800);
    }

    // 6. Track Order Page & Cash Memo
    await page.goto('http://localhost:3000/track-order');
    await page.waitForTimeout(800);
    await page.fill('input[placeholder*="অর্ডার নম্বর"]', 'ORD-202611-1001');
    await page.click('button:has-text("ট্র্যাক করুন")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '07-track-order-details.png'), fullPage: false });

    // Open Cash Memo
    const memoBtn = page.locator('button:has-text("ক্যাশ মেমো")').first();
    if (await memoBtn.isVisible()) {
      await memoBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '08-customer-cash-memo.png'), fullPage: false });
      await page.locator('button:has-text("✕")').first().click({ force: true });
      await page.waitForTimeout(800);
    }

    // 7. Admin Panel Walkthrough
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForTimeout(800);
    await page.fill('input[type="email"]', 'admin@smartbazar.com');
    await page.fill('input[type="password"]', 'admin123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1200);

    // Overview Tab Screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '09-admin-dashboard.png'), fullPage: false });

    // Go to Orders Tab
    await page.click('button:has-text("অর্ডার ও কুরিয়ার")');
    await page.waitForTimeout(1000);

    // Toggle fraud shield on first order
    const fraudShieldBtn = page.locator('button[title*="চিহ্নিত করুন"]').first();
    if (await fraudShieldBtn.isVisible()) {
      await fraudShieldBtn.click({ force: true });
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '10-admin-orders-fraud-shield.png'), fullPage: false });

    await page.waitForTimeout(1000);
  });
});
