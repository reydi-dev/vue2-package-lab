import { expect, test } from '@playwright/test'

test('360px viewport remains usable and table renders mobile cards', async ({ page }) => {
  await page.goto('/scenarios')
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible()
  await expect(page.getByTestId('features-table').locator('.sdt-mobile')).toBeVisible()
  const widths = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }))
  expect(widths.document).toBeLessThanOrEqual(widths.viewport)
})

test('RTL prop changes the table direction', async ({ page }) => {
  await page.goto('/scenarios')
  await page.getByTestId('rtl-toggle').check({ force: true })
  await expect(page.getByTestId('direction-value')).toHaveText('RTL')
  await expect(page.getByTestId('features-table').locator('.sdt-root')).toHaveAttribute('dir', 'rtl')
})

test('768px layout keeps navigation and table content usable', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 })
  await page.goto('/local')
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible()
  await expect(page.getByTestId('local-table').locator('.sdt-mobile')).toBeVisible()
  const widths = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }))
  expect(widths.document).toBeLessThanOrEqual(widths.viewport)
})
