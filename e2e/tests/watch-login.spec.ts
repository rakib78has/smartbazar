import { test, expect } from '@playwright/test';

test.describe('Admin Login Live Visual Walkthrough', () => {
  test('Watch Admin Authentication Live: Rejection, Login, Dashboard & Logout', async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 1280, height: 800 });

    // STEP 1: Open Login Page
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForTimeout(2500);

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.getByRole('button', { name: 'লগইন করুন' });

    // STEP 2: Wrong Password Test
    await emailInput.fill('hacker@unknown.com');
    await page.waitForTimeout(1000);
    await passwordInput.fill('wrongpassword123');
    await page.waitForTimeout(1000);

    await loginButton.click();
    await page.waitForTimeout(3000); // User sees red alert
    await expect(page.getByText('ভুল ইমেইল বা পাসওয়ার্ড!')).toBeVisible();

    // STEP 3: Correct Credentials
    await emailInput.fill('');
    await emailInput.fill('admin@smartbazar.com');
    await page.waitForTimeout(1000);

    await passwordInput.fill('');
    await passwordInput.fill('admin123456');
    await page.waitForTimeout(1500);

    // Click Login
    await loginButton.click();
    await page.waitForURL('**/admin');
    await page.waitForTimeout(3500); // User views dashboard overview

    await expect(page.getByText('অ্যাডমিন হাব')).toBeVisible();
    await expect(page.getByText('মোট সেলস')).toBeVisible();

    // STEP 4: Test Left Sidebar - "পিক্সেল ও কনভার্সন ট্র্যাকিং"
    const pixelTab = page.getByRole('button', { name: /পিক্সেল ও কনভার্সন ট্র্যাকিং/ });
    if (await pixelTab.isVisible()) {
      await pixelTab.click();
      await page.waitForTimeout(2500);

      // Trigger Confetti test from admin
      const confettiBtn = page.getByRole('button', { name: /রঙিন কনফেটি টেস্ট করুন/ });
      if (await confettiBtn.isVisible()) {
        await confettiBtn.click();
        await page.waitForTimeout(3000); // User watches confetti explosion
      }
    }

    // STEP 5: Test Left Sidebar - "অর্ডার ও কুরিয়ার"
    const ordersTab = page.getByRole('button', { name: /অর্ডার ও কুরিয়ার/ });
    if (await ordersTab.isVisible()) {
      await ordersTab.click();
      await page.waitForTimeout(3000); // User sees orders list and Steadfast export button
    }

    // STEP 6: Test Logout
    const logoutBtn = page.getByRole('button', { name: 'লগআউট', exact: true });
    await logoutBtn.click();
    await page.waitForURL('**/admin/login');
    await page.waitForTimeout(3500); // User sees back to login screen
  });
});
