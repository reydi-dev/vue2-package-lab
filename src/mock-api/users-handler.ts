import type { IncomingMessage, ServerResponse } from 'node:http'
import { serverUsers, type User } from '../fixtures/users'

const sortableFields = new Set<keyof User>(['id', 'name', 'email', 'role', 'status', 'createdAt'])
const oneTimeFailures = new Set<string>()

function send(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

function positiveInteger(value: string | null, fallback: number, max = Number.MAX_SAFE_INTEGER) {
  if (value === null) return fallback
  if (!/^\d+$/.test(value)) return null
  const number = Number(value)
  return number >= 1 && number <= max ? number : null
}

export async function handleUsersApi(request: IncomingMessage, response: ServerResponse) {
  if (!request.url) return false
  const url = new URL(request.url, 'http://localhost')
  if (url.pathname !== '/api/users') return false
  if (request.method !== 'GET') {
    send(response, 405, { error: 'Method not allowed' })
    return true
  }

  const page = positiveInteger(url.searchParams.get('page'), 1)
  const perPage = positiveInteger(url.searchParams.get('per_page'), 10, 100)
  const sort = url.searchParams.get('sort')
  const direction = url.searchParams.get('direction') || 'asc'
  const name = (url.searchParams.get('name') || '').trim().toLocaleLowerCase()
  const status = (url.searchParams.get('status') || '').trim().toLocaleLowerCase()
  const scenario = url.searchParams.get('scenario') || 'normal'
  const scenarioKey = url.searchParams.get('scenario_key') || 'default'
  const requestedDelay = Number(url.searchParams.get('delay') || 0)

  if (page === null || perPage === null) {
    send(response, 400, { error: 'page and per_page must be positive integers; per_page may not exceed 100' })
    return true
  }
  if (sort && !sortableFields.has(sort as keyof User)) {
    send(response, 400, { error: `Unsupported sort field: ${sort}` })
    return true
  }
  if (!['asc', 'desc'].includes(direction)) {
    send(response, 400, { error: 'direction must be asc or desc' })
    return true
  }
  if (status && !['active', 'invited', 'suspended'].includes(status)) {
    send(response, 400, { error: `Unsupported status filter: ${status}` })
    return true
  }
  if (!Number.isFinite(requestedDelay) || requestedDelay < 0 || requestedDelay > 5000) {
    send(response, 400, { error: 'delay must be between 0 and 5000 milliseconds' })
    return true
  }

  const delay = scenario === 'slow' ? Math.max(1500, requestedDelay) : requestedDelay
  await new Promise((resolve) => setTimeout(resolve, delay))
  if (response.writableEnded || request.destroyed) return true

  if (scenario === 'error') {
    send(response, 503, { error: 'Intentional scenario failure' })
    return true
  }
  if (scenario === 'error-once') {
    const key = `${scenarioKey}:${name}:${status}`
    if (!oneTimeFailures.has(key)) {
      oneTimeFailures.add(key)
      send(response, 503, { error: 'Intentional one-time failure' })
      return true
    }
  }

  let rows = scenario === 'empty' ? [] : serverUsers.filter((user) => {
    const nameMatches = !name || user.name.toLocaleLowerCase().includes(name)
    const statusMatches = !status || user.status === status
    return nameMatches && statusMatches
  })
  const total = rows.length

  if (sort) {
    rows = [...rows].sort((left, right) => {
      const result = String(left[sort as keyof User]).localeCompare(String(right[sort as keyof User]), 'en', { numeric: true })
      return direction === 'desc' ? -result : result
    })
  }

  const offset = (page - 1) * perPage
  send(response, 200, { data: rows.slice(offset, offset + perPage), total })
  return true
}
