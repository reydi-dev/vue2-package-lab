<template>
  <div data-testid="scenarios-page">
    <PageIntro :status="scenarioStatus" :tone="lastError ? 'error' : 'success'">
      Real provider states plus consumer features. Choose a state to drive the mock HTTP API; the table below—not a decorative card—must render the resulting loading, empty, error, or recovered state.
    </PageIntro>

    <v-card outlined class="lab-card mb-6">
      <v-card-title>Provider scenario</v-card-title>
      <v-card-text>
        <div class="scenario-controls">
          <v-select v-model="scenario" :items="scenarios" item-text="label" item-value="value" label="Scenario" outlined dense hide-details data-testid="scenario-control" />
          <div class="metric py-2"><span class="section-label">Last load event</span><strong class="subtitle-1" data-testid="scenario-event">{{ lastEvent }}</strong></div>
          <div class="metric py-2"><span class="section-label">Expected behavior</span><strong class="subtitle-1">{{ scenarioHelp }}</strong></div>
        </div>
      </v-card-text>
      <v-card-text class="pa-0">
        <div class="table-scroll table-scroll--mobile" data-testid="scenario-table">
          <SmartDataTable
            :key="scenarioKey"
            :columns="columns"
            mode="server"
            :data-provider="loadScenario"
            :normalize-response="normalizeResponse"
            :provider-context="providerContext"
            :items-per-page="10"
            :messages="messages"
            :filter-debounce="80"
            @load-start="onLoadStart"
            @load-success="onLoadSuccess"
            @load-error="onLoadError"
          >
            <template v-slot:[`cell.status`]="{ value }"><span class="status-chip" :class="`status-chip--${value}`">{{ value }}</span></template>
          </SmartDataTable>
        </div>
      </v-card-text>
    </v-card>

    <v-card outlined class="lab-card table-card mb-6">
      <v-card-title class="d-flex flex-wrap align-center">
        RTL, mobile & optional features
        <v-spacer />
        <v-switch v-model="rtl" label="RTL table direction" hide-details inset data-testid="rtl-toggle" />
      </v-card-title>
      <v-card-subtitle>
        Mobile cards activate at the package's Vuetify breakpoint. Column visibility persists locally: hide a column, refresh the page, and confirm it remains hidden.
      </v-card-subtitle>
      <v-card-text class="pa-0">
        <div class="table-scroll table-scroll--mobile" data-testid="features-table">
          <SmartDataTable
            v-model="selectedIds"
            :columns="columns"
            mode="local"
            :items="featureRows"
            :items-per-page="10"
            :direction="rtl ? 'rtl' : 'ltr'"
            :persistence-adapter="persistenceAdapter"
            persistence-key="feature-table-columns-v1"
            :exporters="exporters"
            export-file-name="vue2-package-lab-users"
            :messages="messages"
            selectable
            @export-success="lastFeatureEvent = 'CSV export completed'"
            @column-visibility-change="lastFeatureEvent = 'Column visibility changed and saved'"
            @selection-change="lastFeatureEvent = `Selection changed (${ $event.keys.length })`"
          >
            <template v-slot:[`cell.status`]="{ value }"><span class="status-chip" :class="`status-chip--${value}`">{{ value }}</span></template>
          </SmartDataTable>
        </div>
      </v-card-text>
      <v-card-actions class="px-5 py-4 feature-footer">
        <span><strong>Direction:</strong> <span data-testid="direction-value">{{ rtl ? 'RTL' : 'LTR' }}</span></span>
        <span><strong>Selected:</strong> {{ selectedIds.length ? selectedIds.join(', ') : 'none' }}</span>
        <span><strong>Latest:</strong> {{ lastFeatureEvent }}</span>
      </v-card-actions>
    </v-card>

    <v-alert text type="info" class="mb-0">
      Live global Vuetify RTL switching is intentionally not used: this test changes the table's documented <code>direction</code> prop, keeping the rest of the lab stable.
    </v-alert>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { SmartDataTable, createCsvExporter, createLocalStoragePersistenceAdapter } from 'vue2-smart-datatable'
import type { DataProviderRequest } from 'vue2-smart-datatable'
import PageIntro from '../app/PageIntro.vue'
import { localUsers } from '../fixtures/users'
import { fetchUsers, normalizeUsers } from '../table-scenarios/provider'
import { tableMessages, userColumns } from '../table-scenarios/table-config'

export default Vue.extend({
  components: { SmartDataTable, PageIntro },
  data: () => ({
    columns: userColumns,
    messages: tableMessages,
    normalizeResponse: normalizeUsers,
    scenario: 'normal',
    scenarioKey: 1,
    lastEvent: 'Waiting for initial load',
    lastError: false,
    rtl: false,
    selectedIds: [] as number[],
    featureRows: localUsers.slice(0, 30),
    persistenceAdapter: createLocalStoragePersistenceAdapter({ prefix: 'vue2-package-lab:' }),
    exporters: [createCsvExporter({ label: 'CSV' })],
    lastFeatureEvent: 'No feature event yet',
    scenarios: [
      { label: 'Normal response', value: 'normal', help: 'Rows appear from the API' },
      { label: 'Empty result', value: 'empty', help: 'Package empty state appears' },
      { label: 'Server error', value: 'error', help: 'Error and Retry remain visible' },
      { label: 'Fail once, then Retry', value: 'error-once', help: 'First request fails; Retry succeeds' },
      { label: 'Slow response', value: 'slow', help: 'Loading state stays visible for 1.5s' },
      { label: 'Rapid filters', value: 'rapid', help: 'Type quickly; old requests are aborted' },
    ],
  }),
  computed: {
    providerContext(): { scenario: string; key: number } { return { scenario: this.scenario, key: this.scenarioKey } },
    scenarioHelp(): string { return this.scenarios.find((item) => item.value === this.scenario)?.help || '' },
    scenarioStatus(): string { return this.lastError ? 'Package error state is visible' : this.lastEvent },
  },
  watch: {
    scenario() {
      this.scenarioKey += 1
      this.lastError = false
      this.lastEvent = 'Scenario changed; loading'
    },
  },
  methods: {
    loadScenario(request: DataProviderRequest) {
      const apiScenario = this.scenario === 'rapid' ? 'normal' : this.scenario
      const delay = this.scenario === 'rapid' ? 1500 : 0
      return fetchUsers(request, { delay, scenario: apiScenario, scenarioKey: String(this.scenarioKey), onRequest: () => {} })
    },
    onLoadStart(request: DataProviderRequest) { this.lastError = false; this.lastEvent = `Loading (${request.reason})` },
    onLoadSuccess(payload: { result: { items: unknown[] } }) { this.lastError = false; this.lastEvent = `Success: ${payload.result.items.length} rows` },
    onLoadError() { this.lastError = true; this.lastEvent = 'Error received; Retry available' },
  },
})
</script>

<style scoped>
.feature-footer { display: flex; flex-wrap: wrap; gap: 18px; color: #526078; font-size: 13px; }
</style>
