import { test, expect } from '@playwright/test';

test.describe('Admin Login Live Visual Walkthrough', () => {
  test('Watch Admin Authentication Live: Rejection, Login, Dashboard & Logout', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes

    // STEP 1: Open Login Page
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForTimeout(2000);

    // STEP 2: Test Wrong Credentials (Security Rejection)
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.getByRole('button', { name: 'লগইন করুন' });

    // Type wrong credentials with human-like typing
    await emailInput.fill('wrong-hacker@test.com');
    await page.waitForTimeout(1000);
    await passwordInput.fill('wrongpassword123');
    await page.waitForTimeout(1000);

    // Click Login
    await loginButton.click();
    await page.waitForTimeout(2500); // Let the user see the red error message

    // Verify error message is visible
    await expect(page.getByText('ভুল ইমেইল বা পাসওয়ার্ড!')).toBeVisible();

    // STEP 3: Enter Valid Credentials
    await emailInput.fill('');
    await emailInput.fill('admin@smartbazar.com');
    await page.waitForTimeout(1000);

    await passwordInput.fill('');
    await passwordInput.fill('admin123456');
    await page.waitForTimeout(1500);

    // Click Login to enter Admin Panel
    await loginButton.click();
    await page.waitForURL('**/admin');
    await page.waitForTimeout(3000); // Let user see the dashboard

    // Verify Admin Dashboard is visible
    await expect(page.getByText('অ্যাডমিন হাব')).toBeVisible();
    await expect(page.getByText('মোট সেলস')).toBeVisible();

    // STEP 4: Navigate Left Sidebar Hubs
    // Click "পিক্সেল ও কনভার্সন ট্র্যাকিং"
    const pixelTab = page.getByRole('button', { name: /পিক্সেল ও কনভার্সন ট্র্যাকিং/ });
    if (await pixelTab.isVisible()) {
      await pixelTab.click();
      await page.waitForTimeout(2500);
    }

    // Click "অর্ডার ও কুরিয়ার"
    const ordersTab = page.getByRole('button', { name: /অর্ডার ও কুরিয়ার/ });
    if (await ordersTab.isVisible()) {
      await ordersTab.click();
      await page.waitForTimeout(2500);
    }

    // Click "পণ্য ও স্টক"
    const productsTab = page.getByRole('button', { name: /পণ্য ও স্টক/ });
    if (await productsTab.isVisible()) {
      await productsTab.click();
      await page.waitForTimeout(2500);
    }

    // STEP 5: Logout
    const logoutBtn = page.getByRole('button', { name: 'লগআউট', exact: true });
    await logoutBtn.click();
    await page.waitForURL('**/admin/login');
    await page.waitForTimeout(3000); // Let user see redirected back to login page
  });
});
