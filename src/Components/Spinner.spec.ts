import { test, expect } from '@playwright/test';

/**
 * E2E spec for the Spinner component.
 *
 * Trigger: the App constructor (src/Dashboard/app.ts) calls lockScreen() with
 * { backdropOption: { default: 'bg-slate-400', darkMode: 'dark:bg-slate-700' },
 *   icon: true } for ~1s on every page load — these tests assert against
 * that real mount.
 *
 * Note: testing variants (transparent backdrop, no-icon, manual destroy)
 * would require exposing the Spinner class globally, e.g. adding
 * `(window as any).__Spinner = Spinner;` in src/Playground.ts. Once exposed,
 * tests can `page.evaluate(() => new (window as any).__Spinner({...}))`.
 */

const APP_URL = 'http://localhost:2000';

test.describe('Spinner', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(APP_URL);
    });

    test('mounts the container with spinner-container + flex layout classes', async ({ page }) => {
        const container = page.locator('.spinner-container');
        await expect(container).toBeVisible();
        await expect(container).toHaveClass(/flex/);
        await expect(container).toHaveClass(/flex-col/);
        await expect(container).toHaveClass(/items-center/);
    });

    test('renders the rotating ring with animate-spin and blue border colors', async ({ page }) => {
        const ring = page.locator('.spinner-container > div.animate-spin');
        await expect(ring).toBeVisible();
        await expect(ring).toHaveClass(/border-t-blue-600/);
        await expect(ring).toHaveClass(/border-r-blue-600/);
        await expect(ring).toHaveClass(/rounded-full/);
        await expect(ring).toHaveClass(/w-12/);
        await expect(ring).toHaveClass(/h-12/);
    });

    test('renders the default cloud-upload SVG icon', async ({ page }) => {
        const svg = page.locator('.spinner-container svg');
        await expect(svg).toBeVisible();
        await expect(svg.locator('path')).toHaveAttribute('d', /^M12 16\.5V9\.75/);
    });

    test('renders a solid backdrop with light + dark slate classes', async ({ page }) => {
        const backdrop = page.locator('#spinner-backdrop');
        await expect(backdrop).toBeVisible();
        await expect(backdrop).toHaveClass(/bg-slate-400/);
        await expect(backdrop).toHaveClass(/dark:bg-slate-700/);
    });

    test('backdrop background-color differs between light and dark mode', async ({ page }) => {
        const lightBg = await page
            .locator('#spinner-backdrop')
            .evaluate(el => getComputedStyle(el).backgroundColor);

        await page.locator('.spinner-container').waitFor({ state: 'detached', timeout: 2500 });
        await page.evaluate(() => localStorage.setItem('theme', 'dark'));
        await page.reload();

        const darkBg = await page
            .locator('#spinner-backdrop')
            .evaluate(el => getComputedStyle(el).backgroundColor);

        expect(darkBg).not.toBe(lightBg);
        expect(lightBg).not.toBe('rgba(0, 0, 0, 0)');
        expect(darkBg).not.toBe('rgba(0, 0, 0, 0)');
    });

    test('is removed from the DOM after unlockScreen (~1s)', async ({ page }) => {
        const container = page.locator('.spinner-container');
        await expect(container).toBeVisible();
        await expect(container).toHaveCount(0, { timeout: 2500 });
    });
});
