<template>
  <v-app>
    <AppLayout />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import AppLayout from './app/layout/AppLayout.vue'

export default Vue.extend({ components: { AppLayout } })
</script>
