import { users } from '../src/data/users';
import { expect, test } from '../src/fixtures/test';

// Login tests need a signed-out browser, so they drop the shared session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user reaches the inventory @smoke', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(users.standard);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('locked out user sees a clear error', async ({ loginPage, page }) => {
    await loginPage.login(users.lockedOut);
    await expect(loginPage.error).toContainText('Sorry, this user has been locked out');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('wrong password is rejected', async ({ loginPage }) => {
    await loginPage.login({ username: users.standard.username, password: 'wrong-password' });
    await expect(loginPage.error).toContainText('Username and password do not match');
  });

  const requiredFields = [
    { name: 'username', user: { username: '', password: 'anything' }, message: 'Username is required' },
    { name: 'password', user: { username: 'anyone', password: '' }, message: 'Password is required' },
  ];

  for (const { name, user, message } of requiredFields) {
    test(`empty ${name} is rejected`, async ({ loginPage }) => {
      await loginPage.login(user);
      await expect(loginPage.error).toContainText(message);
    });
  }

  test('inventory is not reachable without a session', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');
    await expect(loginPage.error).toContainText("You can only access '/inventory.html' when you are logged in");
  });

  test('logout ends the session', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(users.standard);
    await inventoryPage.logout();
    await expect(loginPage.loginButton).toBeVisible();
    await page.goto('/inventory.html');
    await expect(loginPage.error).toBeVisible();
  });
});
