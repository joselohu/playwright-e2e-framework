import { customer, products, TAX_RATE } from '../src/data/checkout';
import { expect, test } from '../src/fixtures/test';

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.bikeLight);
    await inventoryPage.openCart();
    await cartPage.checkout();
  });

  test('customer completes an order @smoke', async ({ checkoutPage, inventoryPage, page }) => {
    await checkoutPage.fillCustomer(customer);
    await checkoutPage.continueToOverview();
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    await checkoutPage.finish();

    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('order summary adds up: subtotal, 8% tax and total', async ({ checkoutPage }) => {
    await checkoutPage.fillCustomer(customer);
    await checkoutPage.continueToOverview();

    const prices = await checkoutPage.lineItemPrices();
    const expectedSubtotal = prices.reduce((sum, price) => sum + price, 0);
    const expectedTax = Number((expectedSubtotal * TAX_RATE).toFixed(2));

    expect(await checkoutPage.amount(checkoutPage.subtotal)).toBeCloseTo(expectedSubtotal, 2);
    expect(await checkoutPage.amount(checkoutPage.tax)).toBeCloseTo(expectedTax, 2);
    expect(await checkoutPage.amount(checkoutPage.total)).toBeCloseTo(expectedSubtotal + expectedTax, 2);
  });

  const missingFields = [
    { field: 'first name', info: { lastName: customer.lastName, postalCode: customer.postalCode }, message: 'First Name is required' },
    { field: 'last name', info: { firstName: customer.firstName, postalCode: customer.postalCode }, message: 'Last Name is required' },
    { field: 'postal code', info: { firstName: customer.firstName, lastName: customer.lastName }, message: 'Postal Code is required' },
  ];

  for (const { field, info, message } of missingFields) {
    test(`checkout is blocked without a ${field}`, async ({ checkoutPage, page }) => {
      await checkoutPage.fillCustomer(info);
      await checkoutPage.continue();

      await expect(checkoutPage.error).toContainText(message);
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
  }
});
