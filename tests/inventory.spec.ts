import { expect, test } from '../src/fixtures/test';
import type { SortOption } from '../src/pages/InventoryPage';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('lists six products, each with a name, price and image', async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(6);
    for (const item of await inventoryPage.items.all()) {
      await expect(item.getByTestId('inventory-item-name')).not.toBeEmpty();
      await expect(item.getByTestId('inventory-item-price')).toHaveText(/^\$\d+\.\d{2}$/);
      await expect(item.getByRole('img')).toHaveAttribute('src', /\.jpg$/);
    }
  });

  const byName = (a: string, b: string) => a.localeCompare(b);
  const nameSorts: { option: SortOption; label: string; compare: (a: string, b: string) => number }[] = [
    { option: 'az', label: 'name A to Z', compare: byName },
    { option: 'za', label: 'name Z to A', compare: (a, b) => byName(b, a) },
  ];

  for (const { option, label, compare } of nameSorts) {
    test(`sorts by ${label}`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);
      const names = await inventoryPage.names();
      expect(names).toEqual([...names].sort(compare));
    });
  }

  const priceSorts: { option: SortOption; label: string; compare: (a: number, b: number) => number }[] = [
    { option: 'lohi', label: 'price low to high', compare: (a, b) => a - b },
    { option: 'hilo', label: 'price high to low', compare: (a, b) => b - a },
  ];

  for (const { option, label, compare } of priceSorts) {
    test(`sorts by ${label}`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);
      const prices = await inventoryPage.prices();
      expect(prices).toEqual([...prices].sort(compare));
    });
  }

  test('product detail page shows the same name and price as the list', async ({ inventoryPage, page }) => {
    const first = inventoryPage.items.first();
    const name = await first.getByTestId('inventory-item-name').innerText();
    const price = await first.getByTestId('inventory-item-price').innerText();

    await first.getByTestId('inventory-item-name').click();

    // The URL changes before the detail view renders, so wait for a detail-only control.
    await expect(page).toHaveURL(/inventory-item\.html/);
    await expect(page.getByTestId('back-to-products')).toBeVisible();
    await expect(page.getByTestId('inventory-item-name')).toHaveText(name);
    await expect(page.getByTestId('inventory-item-price')).toHaveText(price);
  });
});
