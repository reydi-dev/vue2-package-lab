<template>
  <div data-testid="local-page">
    <PageIntro status="Ready for local interaction" tone="success">
      Local mode over 72 stable users: pagination, page size, built-in filters, sortable headers, selection via v-model, a custom status cell, and a harmless row action.
    </PageIntro>

    <v-card outlined class="lab-card table-card mb-6">
      <v-card-title class="d-flex flex-wrap align-center">
        Local users <v-chip small class="ml-3" color="indigo lighten-5" text-color="indigo">{{ localUsers.length }} fixture rows</v-chip>
      </v-card-title>
      <v-card-text class="pa-0">
        <div class="table-scroll" data-testid="local-table">
          <SmartDataTable
            v-model="selectedIds"
            :columns="columns"
            mode="local"
            :items="localUsers"
            :actions="actions"
            :items-per-page="10"
            :page-size-options="[10, 25, 50]"
            :messages="messages"
            selectable
            @selection-change="capture('selection-change', $event)"
            @update:page="capture('update:page', $event)"
            @update:items-per-page="capture('update:items-per-page', $event)"
            @update:sort="capture('update:sort', $event)"
            @update:filters="capture('update:filters', $event)"
            @row-click="onRowClick"
            @row-action="onRowAction"
          >
            <template v-slot:[`cell.status`]="{ value }">
              <span class="status-chip" :class="`status-chip--${value}`">{{ value }}</span>
            </template>
          </SmartDataTable>
        </div>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" md="4"><div class="metric"><span class="section-label">Selected IDs</span><strong data-testid="selected-ids">{{ selectedIds.length ? selectedIds.join(', ') : 'None' }}</strong></div></v-col>
      <v-col cols="12" md="4"><div class="metric"><span class="section-label">Last row click</span><strong>{{ lastRowClick || 'None yet' }}</strong></div></v-col>
      <v-col cols="12" md="4"><div class="metric"><span class="section-label">Last action</span><strong data-testid="last-action">{{ lastAction || 'None yet' }}</strong></div></v-col>
    </v-row>

    <v-expansion-panels flat class="technical-panel mt-3">
      <v-expansion-panel>
        <v-expansion-panel-header>Technical events ({{ events.length }})</v-expansion-panel-header>
        <v-expansion-panel-content><pre data-testid="local-events">{{ events.length ? JSON.stringify(events, null, 2) : 'No events captured yet.' }}</pre></v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { SmartDataTable } from 'vue2-smart-datatable'
import PageIntro from '../app/PageIntro.vue'
import { localUsers } from '../fixtures/users'
import { rowActions, tableMessages, userColumns } from '../table-scenarios/table-config'

export default Vue.extend({
  components: { SmartDataTable, PageIntro },
  data: () => ({
    localUsers,
    columns: userColumns,
    actions: rowActions,
    messages: tableMessages,
    selectedIds: [] as number[],
    lastRowClick: '',
    lastAction: '',
    events: [] as Array<{ event: string; payload: unknown }>,
  }),
  methods: {
    capture(event: string, payload: unknown) {
      this.events.unshift({ event, payload })
      this.events = this.events.slice(0, 12)
    },
    onRowClick(payload: { rowKey: number }) {
      this.lastRowClick = `User #${payload.rowKey}`
      this.capture('row-click', { rowKey: payload.rowKey })
    },
    onRowAction(payload: { action: { key: string }; rowKey: number }) {
      this.lastAction = `${payload.action.key} on user #${payload.rowKey}`
      this.capture('row-action', { action: payload.action.key, rowKey: payload.rowKey })
    },
  },
})
</script>
