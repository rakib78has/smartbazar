import { test, expect } from '@playwright/test';

test.describe('Customer Account & Authentication E2E Flow', () => {
  const timestamp = Date.now().toString().slice(-6);
  const testPhone = `01799${timestamp}`;
  const testName = `রফিক আহমেদ ${timestamp}`;
  const testPass = 'pass123456';
  const testAddress = 'বাড়ি ১২, রোড ৪, মিরপুর-১০, ঢাকা';

  test('Customer registration, account portal, address update, and logout', async ({ page }) => {
    // 1. Visit Register Page
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'নতুন অ্যাকাউন্ট খুলুন' })).toBeVisible();

    // 2. Fill registration form
    await page.locator('input[placeholder="যেমন: মোঃ সাকিব হাসান"]').fill(testName);
    await page.locator('input[placeholder="01XXXXXXXXX"]').fill(testPhone);
    await page.locator('input[placeholder="একটি নিরাপদ পাসওয়ার্ড দিন"]').fill(testPass);
    await page.locator('textarea[placeholder="বাড়ি নং, রোড নং, এলাকা..."]').fill(testAddress);

    // 3. Submit Registration
    await page.getByRole('button', { name: 'রেজিস্ট্রেশন সম্পন্ন করুন' }).click();

    // 4. Verify redirected to /account
    await expect(page).toHaveURL(/.*\/account/);
    await expect(page.getByRole('heading', { name: testName })).toBeVisible();
    await expect(page.getByText(testPhone).first()).toBeVisible();

    // 5. Test Address Tab & Update
    await page.getByRole('button', { name: /সেভ করা ডেলিভারি ঠিকানা/ }).click();
    const updatedAddress = 'বাড়ি ৯৯, ধানমন্ডি ২/এ, ঢাকা';
    await page.locator('textarea').fill(updatedAddress);
    await page.getByRole('button', { name: 'ঠিকানা সংরক্ষণ করুন' }).click();
    await expect(page.getByText('ঠিকানা সফলভাবে সংরক্ষণ করা হয়েছে!')).toBeVisible();

    // 6. Test Logout
    await page.getByRole('button', { name: 'লগআউট' }).click();
    await expect(page).toHaveURL(/.*(?:\/|\/login)/);
  });

  test('Demo customer login and WhatsApp Checkout autofill', async ({ page }) => {
    // 1. Go to Login page
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'কাস্টমার লগইন' })).toBeVisible();

    // 2. Click Demo Fill Button
    await page.getByRole('button', { name: /ডেমো অ্যাকাউন্ট দিয়ে অটো-ফিল করুন/ }).click();

    // 3. Verify inputs filled
    await expect(page.locator('input[placeholder="যেমন: 017XXXXXXXX বা email"]')).toHaveValue('01712345678');

    // 4. Login
    await page.getByRole('button', { name: 'লগইন করুন' }).click();
    await expect(page).toHaveURL(/.*\/account/);
    await expect(page.getByRole('heading', { name: 'তানভীর আহমেদ' })).toBeVisible();

    // 5. Go to homepage and check checkout modal autofill
    await page.goto('/');
    
    // Open Quick Buy modal on first available product
    const directBuyBtn = page.locator('button[title="সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন"]').first();
    await directBuyBtn.click();

    // 6. Verify modal opened and fields are prefilled with Tanveer Ahmed's info
    const nameInput = page.locator('input[placeholder="যেমন: মোঃ তামিম ইকবাল"]');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue('তানভীর আহমেদ');

    const phoneInput = page.locator('input[placeholder="01XXXXXXXXX"]').first();
    await expect(phoneInput).toHaveValue('01712345678');

    const addressInput = page.locator('textarea[placeholder="বাড়ি নং, রোড নং, এলাকা, থানা ও জেলার নাম"]');
    await expect(addressInput).toHaveValue('বাড়ি # ১২, রোড # ৪, সেক্টর-৩, উত্তরা');

    // 7. Verify Logged-in banner
    await expect(page.getByText(/লগইন করা আছে: তানভীর আহমেদ/)).toBeVisible();
  });
});
