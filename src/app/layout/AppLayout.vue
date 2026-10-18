<template>
  <div>
    <v-navigation-drawer v-model="drawer" app color="#17213a" dark :permanent="$vuetify.breakpoint.mdAndUp">
      <div class="lab-brand">
        <div class="lab-brand__mark" aria-hidden="true">V2</div>
        <div><strong>Vue 2 Package Lab</strong><small>Consumer test bench</small></div>
      </div>
      <v-list nav class="px-3">
        <v-list-item v-for="item in navigation" :key="item.to" :to="item.to" exact color="white">
          <v-list-item-icon><v-icon>{{ item.icon }}</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>{{ item.label }}</v-list-item-title></v-list-item-content>
        </v-list-item>
      </v-list>
      <template #append>
        <div class="pa-4 drawer-note">Local fixtures only<br />No external API calls</div>
      </template>
    </v-navigation-drawer>

    <v-app-bar app flat color="white" class="lab-app-bar">
      <v-app-bar-nav-icon v-if="$vuetify.breakpoint.smAndDown" aria-label="Open navigation" @click="drawer = !drawer" />
      <div class="page-heading">
        <span class="page-heading__eyebrow">Package test</span>
        <h1>{{ pageTitle }}</h1>
      </div>
      <v-spacer />
      <div class="package-meta d-none d-sm-flex">
        <span><strong>vue2-smart-datatable</strong> <code>0.1.0-beta.2</code></span>
        <a href="https://www.npmjs.com/package/vue2-smart-datatable/v/0.1.0-beta.2" target="_blank" rel="noreferrer">npm</a>
        <a href="https://github.com/reydi-dev/vue2-smart-datatable#readme" target="_blank" rel="noreferrer">Docs</a>
      </div>
    </v-app-bar>

    <v-main class="lab-main">
      <v-container fluid class="lab-container">
        <div class="package-meta package-meta--mobile d-flex d-sm-none mb-4">
          <span><strong>vue2-smart-datatable</strong> <code>0.1.0-beta.2</code></span>
          <a href="https://www.npmjs.com/package/vue2-smart-datatable/v/0.1.0-beta.2" target="_blank" rel="noreferrer">npm</a>
          <a href="https://github.com/reydi-dev/vue2-smart-datatable#readme" target="_blank" rel="noreferrer">Docs</a>
        </div>
        <router-view />
      </v-container>
    </v-main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data: () => ({
    drawer: false,
    navigation: [
      { label: 'Overview', to: '/', icon: 'mdi-view-dashboard-outline' },
      { label: 'Local Table', to: '/local', icon: 'mdi-table' },
      { label: 'Server Table', to: '/server', icon: 'mdi-server-network' },
      { label: 'States & Features', to: '/scenarios', icon: 'mdi-test-tube' },
    ],
  }),
  computed: {
    pageTitle(): string {
      return String(this.$route.meta?.title || 'Vue 2 Package Lab')
    },
  },
})
</script>
