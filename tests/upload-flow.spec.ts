import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const APP_URL = 'http://localhost:2000';
const FIXTURE = resolve(__dirname, 'fixtures/sample.txt');

/**
 * Simulates a real OS-file drop onto a DOM target.
 * Playwright cannot drop external files via dragAndDrop() — we build the
 * DataTransfer inside the browser context and dispatch dragenter/dragover/drop.
 */
async function dropFileOnto(
    page: Page,
    targetSelector: string,
    filePath: string,
    mimeType = 'text/plain',
) {
    const buffer = readFileSync(filePath);
    const name = filePath.split(/[\\/]/).pop()!;

    await page.evaluate(
        ({ selector, fileName, type, data }) => {
            const target = document.querySelector(selector);
            if (!target) throw new Error(`drop target not found: ${selector}`);

            const file = new File([new Uint8Array(data)], fileName, { type });
            const dt = new DataTransfer();
            dt.items.add(file);

            for (const evt of ['dragenter', 'dragover', 'drop'] as const) {
                target.dispatchEvent(new DragEvent(evt, {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: dt,
                }));
            }
        },
        { selector: targetSelector, fileName: name, type: mimeType, data: Array.from(buffer) },
    );
}

test.describe('File-Upload-Flow', () => {
    test('drop → spinner → toast → file appears in list', async ({ page }) => {
        await page.goto(APP_URL);
        await page.locator('.spinner-container').waitFor({ state: 'detached', timeout: 5000 });

        const initialCount = await page.locator('div.widget').count();

        await dropFileOnto(page, 'div.bg-stone-200.p-4', FIXTURE);

        await expect(page.locator('.spinner-container')).toBeVisible({ timeout: 3000 });

        const toast = page.locator('div[role="alert"].toast-slide-in');
        await expect(toast).toBeVisible({ timeout: 5000 });
        await expect(toast.locator('svg.text-teal-500')).toBeVisible();

        await expect(page.locator('.spinner-container')).toBeHidden({ timeout: 5000 });

        await expect(page.locator('div.widget')).toHaveCount(initialCount + 1);

        await expect(
            page.locator('div.widget', { hasText: 'sample.txt' }),
        ).toBeVisible();
    });
});
