import { expect, test } from '@playwright/test'

test('server table uses the API and page changes alter query and rows', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => { if (request.url().includes('/api/users?')) requests.push(request.url()) })
  await page.goto('/server')
  const table = page.getByTestId('server-table')
  await expect(table.locator('tbody tr')).toHaveCount(10)
  await expect(table.locator('tbody tr').first()).toContainText('1')

  const responsePromise = page.waitForResponse((response) => response.url().includes('/api/users?') && response.url().includes('page=2'))
  await table.getByRole('button', { name: 'Next page' }).click()
  await responsePromise
  await expect(table.locator('tbody tr').first()).toContainText('11')
  expect(requests.some((url) => url.includes('page=2') && url.includes('per_page=10'))).toBeTruthy()

  await table.getByRole('button', { name: /Filters/i }).click()
  const filtered = page.waitForResponse((response) => response.url().includes('/api/users?') && response.url().includes('name=Noah'))
  await table.locator('.sdt-filter input[type="text"]:not([readonly])').first().fill('Noah')
  await filtered
  await expect(table).toContainText('Noah')
  expect(requests.some((url) => url.includes('name=Noah'))).toBeTruthy()
})

test('empty and error scenarios render package states and Retry', async ({ page }) => {
  await page.goto('/scenarios')
  const scenarioSelect = page.getByTestId('scenario-control')

  await scenarioSelect.click()
  await page.getByRole('option', { name: 'Empty result' }).click()
  await expect(page.getByTestId('scenario-table')).toContainText('No users match this scenario.')

  await scenarioSelect.click()
  await page.getByRole('option', { name: 'Server error' }).click()
  await expect(page.getByTestId('scenario-table').getByRole('button', { name: /Retry request/i })).toBeVisible()
  await expect(page.getByTestId('scenario-event')).toContainText('Error received')
})

test('one-time failure recovers through the package Retry action', async ({ page }) => {
  await page.goto('/scenarios')
  await page.getByTestId('scenario-control').click()
  await page.getByRole('option', { name: 'Fail once, then Retry' }).click()
  const retry = page.getByTestId('scenario-table').getByRole('button', { name: /Retry request/i })
  await expect(retry).toBeVisible()
  await retry.click()
  await expect(page.getByTestId('scenario-table').locator('tbody tr')).toHaveCount(10)
  await expect(page.getByTestId('scenario-event')).toContainText('Success')
})
