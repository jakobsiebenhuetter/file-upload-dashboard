import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:2000/');
  await page.getByText('Ordner erstellen').click();
  await page.getByRole('textbox', { name: 'Unbenannter Ordner' }).click();
  await page.getByRole('textbox', { name: 'Unbenannter Ordner' }).fill('Test');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await page.getByRole('listitem').filter({ hasText: 'gjhgj' }).click();
  await page.getByRole('listitem').filter({ hasText: 'Test' }).click();
  await page.getByRole('listitem').filter({ hasText: 'Test' }).getByRole('img').click();
  await page.getByRole('button', { name: 'Ja' }).click();
  await page.getByText('Ordner erstellen').click();
  await page.getByRole('img').filter({ hasText: /^$/ }).nth(5).click();
});