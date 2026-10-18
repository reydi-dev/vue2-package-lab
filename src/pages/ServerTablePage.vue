<template>
  <div data-testid="server-page">
    <PageIntro :status="statusText" :tone="requestSnapshot && requestSnapshot.status === 'error' ? 'error' : 'success'">
      Server mode through a real browser fetch to <code>/api/users</code>. The endpoint filters, counts, sorts, then paginates; the table owns loading, cancellation, stale-response protection, errors, and retry.
    </PageIntro>

    <v-card outlined class="lab-card mb-6">
      <v-card-text>
        <div class="scenario-controls">
          <v-select v-model="delay" :items="delays" item-text="label" item-value="value" label="Response delay" outlined dense hide-details data-testid="delay-control" />
          <div class="metric py-2"><span class="section-label">Transport</span><strong class="subtitle-1">GET /api/users</strong></div>
          <div class="metric py-2"><span class="section-label">Race protection</span><strong class="subtitle-1">AbortSignal + request ID</strong></div>
        </div>
      </v-card-text>
    </v-card>

    <v-card outlined class="lab-card table-card mb-6">
      <v-card-title>Provider-backed users</v-card-title>
      <v-card-text class="pa-0">
        <div class="table-scroll" data-testid="server-table">
          <SmartDataTable
            v-model="selectedIds"
            :key="tableKey"
            :columns="columns"
            mode="server"
            :data-provider="loadUsers"
            :normalize-response="normalizeResponse"
            :provider-context="providerContext"
            :items-per-page="10"
            :page-size-options="[10, 25, 50]"
            :messages="messages"
            :filter-debounce="120"
            selectable
            @load-start="onLoadStart"
            @load-success="onLoadSuccess"
            @load-error="onLoadError"
          >
            <template v-slot:[`cell.status`]="{ value }"><span class="status-chip" :class="`status-chip--${value}`">{{ value }}</span></template>
          </SmartDataTable>
        </div>
      </v-card-text>
    </v-card>

    <v-expansion-panels flat class="technical-panel">
      <v-expansion-panel>
        <v-expansion-panel-header>Latest request details</v-expansion-panel-header>
        <v-expansion-panel-content><pre data-testid="request-snapshot">{{ requestSnapshot ? JSON.stringify(requestSnapshot, null, 2) : 'Waiting for the initial request…' }}</pre></v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { SmartDataTable } from 'vue2-smart-datatable'
import type { DataProviderRequest } from 'vue2-smart-datatable'
import PageIntro from '../app/PageIntro.vue'
import { fetchUsers, normalizeUsers, type RequestSnapshot } from '../table-scenarios/provider'
import { tableMessages, userColumns } from '../table-scenarios/table-config'

export default Vue.extend({
  components: { SmartDataTable, PageIntro },
  data: () => ({
    columns: userColumns,
    messages: tableMessages,
    normalizeResponse: normalizeUsers,
    selectedIds: [] as number[],
    delay: 0,
    tableKey: 0,
    requestSnapshot: null as RequestSnapshot | null,
    delays: [{ label: 'No delay', value: 0 }, { label: '500 ms', value: 500 }, { label: '1500 ms', value: 1500 }],
  }),
  computed: {
    providerContext(): { delay: number } { return { delay: this.delay } },
    statusText(): string {
      if (!this.requestSnapshot) return 'Waiting for the initial provider request'
      return `Last request: ${this.requestSnapshot.status}`
    },
  },
  methods: {
    loadUsers(request: DataProviderRequest) {
      return fetchUsers(request, { delay: this.delay, scenario: 'normal', onRequest: (snapshot) => { this.requestSnapshot = snapshot } })
    },
    onLoadStart(request: DataProviderRequest) { this.requestSnapshot = { ...(this.requestSnapshot || { url: '', startedAt: new Date().toISOString() }), status: 'loading', reason: request.reason } },
    onLoadSuccess() { /* transport snapshot already contains timing and count */ },
    onLoadError() { /* package error UI is intentionally left visible */ },
  },
})
</script>
