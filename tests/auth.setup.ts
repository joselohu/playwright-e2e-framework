import { expect, test as setup } from '@playwright/test';
import { STORAGE_STATE } from '../playwright.config';
import { users } from '../src/data/users';
import { LoginPage } from '../src/pages/LoginPage';

setup('log in as the standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(users.standard);
  await expect(page).toHaveURL(/inventory\.html/);
  await page.context().storageState({ path: STORAGE_STATE });
});
