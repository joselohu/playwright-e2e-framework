import { products } from '../src/data/checkout';
import { expect, test } from '../src/fixtures/test';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('badge counts items as they are added and removed @smoke', async ({ inventoryPage }) => {
    await expect(inventoryPage.cartBadge).toBeHidden();

    await inventoryPage.addToCart(products.backpack);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.addToCart(products.bikeLight);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.removeFromCart(products.backpack);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('cart lists exactly the products that were added', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.onesie);
    await inventoryPage.openCart();

    await expect(cartPage.itemNames).toHaveText([products.backpack, products.onesie]);
  });

  test('removing a product in the cart updates the list and the badge', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.bikeLight);
    await inventoryPage.openCart();

    await cartPage.remove(products.backpack);

    await expect(cartPage.itemNames).toHaveText([products.bikeLight]);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('cart contents survive a page reload', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.addToCart(products.bikeLight);
    await page.reload();
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.openCart();
    await expect(cartPage.itemNames).toHaveText([products.bikeLight]);
  });
});
