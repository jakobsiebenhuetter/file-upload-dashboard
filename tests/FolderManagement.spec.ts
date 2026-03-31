import { test, expect } from '@playwright/test';

// Wenn zu viele Folder (4) vorhanden sind dann müssen diese gelöscht werden, aber es muss mindestens ein Ordner vorhanden sein
test('create folder', async ({ page }) => {
  await page.goto('http://localhost:2000');
  page.click('#create-folder');
  
  const modal = page.locator('.modal'); // ID des Modals
  await expect(modal).toBeVisible();
  const neFolderName = 'Testordner';
  const input = modal.locator('input'); // Input innerhalb vom Modal
  await input.fill(neFolderName); // ✅ String direkt
  
  await modal.locator('button', { hasText: 'Speichern' }).click();

  await expect(modal).toBeHidden();
  
  const newFolder = page.locator(`text=${neFolderName}`); // sucht nach exaktem Text
  await expect(newFolder).toBeVisible();

});

test('delete folder', async ({ page }) => {
  await page.goto('http://localhost:2000');
})

// Ordner Modal schließen bzw. abbrechen mit ESC. und Button click
// Backdrop muss auch synchron mitagieren wie geplannt