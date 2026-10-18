import type { DataProviderRequest, FilterClause, NormalizedData } from 'vue2-smart-datatable'
import type { User } from '../fixtures/users'

export interface UsersResponse { data: User[]; total: number }
export interface RequestSnapshot {
  url: string
  startedAt: string
  durationMs?: number
  status: 'loading' | 'success' | 'error' | 'aborted'
  statusCode?: number
  recordCount?: number
  reason: DataProviderRequest['reason']
}

export interface ProviderSettings {
  delay: number
  scenario: string
  scenarioKey?: string
  onRequest(snapshot: RequestSnapshot): void
}

function filterValue(clause: FilterClause | undefined) {
  return clause?.value == null ? '' : String(clause.value)
}

export async function fetchUsers(request: DataProviderRequest, settings: ProviderSettings): Promise<UsersResponse> {
  const query = new URLSearchParams({ page: String(request.page), per_page: String(request.itemsPerPage) })
  if (request.sort) {
    query.set('sort', request.sort.field || request.sort.columnKey)
    query.set('direction', request.sort.direction)
  }
  const name = filterValue(request.filters.name)
  const status = filterValue(request.filters.status)
  if (name) query.set('name', name)
  if (status) query.set('status', status)
  if (settings.delay) query.set('delay', String(settings.delay))
  if (settings.scenario !== 'normal') query.set('scenario', settings.scenario)
  if (settings.scenarioKey) query.set('scenario_key', settings.scenarioKey)

  const url = `/api/users?${query.toString()}`
  const started = performance.now()
  const base: RequestSnapshot = { url, startedAt: new Date().toISOString(), status: 'loading', reason: request.reason }
  settings.onRequest(base)

  try {
    const response = await fetch(url, { signal: request.signal })
    const durationMs = Math.round(performance.now() - started)
    if (!response.ok) {
      settings.onRequest({ ...base, durationMs, status: 'error', statusCode: response.status })
      throw new Error(`GET ${url} failed with HTTP ${response.status}`)
    }
    const payload = await response.json() as UsersResponse
    settings.onRequest({ ...base, durationMs, status: 'success', statusCode: response.status, recordCount: payload.data.length })
    return payload
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      settings.onRequest({ ...base, durationMs: Math.round(performance.now() - started), status: 'aborted' })
    }
    throw error
  }
}

export function normalizeUsers(raw: unknown): NormalizedData<User> {
  const response = raw as UsersResponse
  return { items: response.data, total: response.total }
}
