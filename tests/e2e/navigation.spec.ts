import { expect, test } from '@playwright/test'

test('overview and all primary pages render meaningful content', async ({ page }) => {
  for (const route of ['/', '/local', '/server', '/scenarios']) {
    await page.goto(route)
    await expect(page.locator('#app')).not.toBeEmpty()
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('body')).not.toContainText('Cannot read')
  }
})

test('local table filters, sorts, and exposes consumer events', async ({ page }) => {
  await page.goto('/local')
  const table = page.getByTestId('local-table')
  await expect(table.locator('tbody tr')).toHaveCount(10)
  await expect(table).toContainText('Ava Azadi')

  await table.getByRole('button', { name: /Filters/i }).click()
  await table.locator('.sdt-filter input[type="text"]:not([readonly])').first().fill('Noah')
  await expect(table).toContainText('Noah Azadi')
  await expect(table).not.toContainText('Ava Azadi')

  await table.getByRole('button', { name: 'Name', exact: true }).click()
  await table.getByRole('button', { name: 'Name', exact: true }).click()
  await expect(table.locator('tbody tr').first()).toContainText('Noah Hosseini')
  await page.getByText(/Technical events/).click()
  await expect(page.getByTestId('local-events')).toContainText('update:sort')
})
