<template>
  <div data-testid="overview-page">
    <PageIntro status="Application loaded; scenario results are verified by browser tests" tone="success">
      A standalone consumer project for installing and exercising published Vue 2 packages. All records and the HTTP endpoint in this first version are deterministic and local to this lab.
    </PageIntro>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card outlined class="lab-card mb-6">
          <v-card-title>Test workspaces</v-card-title>
          <v-card-subtitle>Each page isolates a different consumer-facing contract.</v-card-subtitle>
          <v-card-text>
            <v-row>
              <v-col v-for="card in cards" :key="card.to" cols="12" md="4">
                <v-card :to="card.to" outlined class="fill-height pa-2" :data-testid="`overview-${card.key}`">
                  <v-card-title class="subtitle-1"><v-icon color="primary" left>{{ card.icon }}</v-icon>{{ card.title }}</v-card-title>
                  <v-card-text class="body-copy">{{ card.description }}</v-card-text>
                  <v-card-actions><v-btn text color="primary">Open test <v-icon right small>mdi-arrow-right</v-icon></v-btn></v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card outlined class="lab-card">
          <v-card-title>Environment</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="item in environment" :key="item.label" cols="6" sm="4"><div class="metric"><span class="section-label">{{ item.label }}</span><strong>{{ item.value }}</strong></div></v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4">
        <v-card outlined class="lab-card mb-6">
          <v-card-title>Scenario checklist</v-card-title>
          <v-card-text>
            <ul class="check-list">
              <li v-for="item in checklist" :key="item"><v-icon small>mdi-checkbox-marked-circle-outline</v-icon><span>{{ item }}</span></li>
            </ul>
            <v-alert text type="info" class="mt-5 mb-0">This list describes coverage, not a fabricated pass status. Actual outcomes live in TEST_REPORT.md after commands run.</v-alert>
          </v-card-text>
        </v-card>
        <v-card outlined class="lab-card">
          <v-card-title>Published package</v-card-title>
          <v-card-text class="body-copy">
            Installed from npm at the exact version <code>0.1.0-beta.2</code>.
            <div class="mt-4"><a href="https://www.npmjs.com/package/vue2-smart-datatable/v/0.1.0-beta.2" target="_blank" rel="noreferrer">npm package</a> · <a href="https://github.com/reydi-dev/vue2-smart-datatable" target="_blank" rel="noreferrer">public repository</a></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import PageIntro from '../app/PageIntro.vue'
export default Vue.extend({
  components: { PageIntro },
  data: () => ({
    cards: [
      { key: 'local', to: '/local', icon: 'mdi-database-outline', title: 'Local Table', description: 'Filtering, sorting, pagination, selection, slots, and row actions over 72 local records.' },
      { key: 'server', to: '/server', icon: 'mdi-server-network', title: 'Server Table', description: 'A real fetch boundary, query contract, cancellation, latency, and request telemetry.' },
      { key: 'scenarios', to: '/scenarios', icon: 'mdi-test-tube', title: 'States & Features', description: 'Empty, error, retry, slow response, RTL, mobile, persistence, and CSV export.' },
    ],
    environment: [
      { label: 'Vue', value: '2.7.16' }, { label: 'Vuetify', value: '2.6.16' }, { label: 'Router', value: '3.6.5' },
      { label: 'Vite', value: '6.1.0' }, { label: 'TypeScript', value: '5.9.2' }, { label: 'Package', value: 'beta.2' },
    ],
    checklist: ['Local data rendering and controls', 'Provider mode through GET /api/users', 'Empty and error states with Retry', 'Narrow viewport and RTL rendering', 'Column visibility, persistence, and CSV export'],
  }),
})
</script>
