import type { DataTableColumn, RowAction } from 'vue2-smart-datatable'
import type { User } from '../fixtures/users'

export const userColumns: DataTableColumn<User>[] = [
  { key: 'id', label: 'ID', type: 'number', sortable: true, width: 80, hideable: false },
  { key: 'name', label: 'Name', sortable: true, filterable: true, filter: { operators: ['contains', 'startsWith'] }, mobile: { summary: true, order: 1 } },
  { key: 'email', label: 'Email', sortable: true, filterable: true, filter: { operators: ['contains'] }, minWidth: 220 },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true, filterable: true, filter: { type: 'select', operators: ['eq'] }, options: [
    { label: 'Active', value: 'active' }, { label: 'Invited', value: 'invited' }, { label: 'Suspended', value: 'suspended' },
  ], mobile: { summary: true, order: 2 } },
  { key: 'createdAt', label: 'Created', type: 'date', sortable: true, hiddenByDefault: false },
]

export const rowActions: RowAction<User>[] = [
  { key: 'inspect', label: 'Inspect', icon: 'mdi-eye-outline', color: 'primary', position: 'trailing' },
]

export const tableMessages = {
  loading: 'Loading users…', empty: 'No users match this scenario.', error: 'The users request failed.', retry: 'Retry request',
}
