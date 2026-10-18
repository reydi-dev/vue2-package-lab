import { expect, test } from '@playwright/test'

test('rapid filters leave the newest provider response visible', async ({ page }) => {
  await page.goto('/scenarios')
  await page.getByTestId('scenario-control').click()
  await page.getByRole('option', { name: 'Rapid filters' }).click()
  const table = page.getByTestId('scenario-table')
  await table.getByRole('button', { name: /Filters/i }).click()
  const nameInput = table.locator('.sdt-filter input[type="text"]:not([readonly])').first()
  await nameInput.fill('Ava')
  await nameInput.fill('Noah')
  await expect(table.locator('tbody tr').first()).toContainText('Noah', { timeout: 8_000 })
  await expect(table.locator('tbody')).not.toContainText('Ava')
})

test('column visibility persists after reload and CSV exports', async ({ page }) => {
  await page.goto('/scenarios')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  const table = page.getByTestId('features-table')

  await table.getByRole('button', { name: /Columns/i }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByText('Email', { exact: true }).click()
  await expect(dialog.getByRole('checkbox', { name: 'Email' })).not.toBeChecked()
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await expect(table.locator('thead')).not.toContainText('Email')

  await page.reload()
  await expect(page.getByTestId('features-table').locator('thead')).not.toContainText('Email')

  await page.getByTestId('features-table').getByRole('button', { name: /Export/i }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByText('CSV — Current page', { exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/vue2-package-lab-users.*\.csv$/)
})
