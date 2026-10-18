<template>
  <v-row class="mb-2">
    <v-col cols="12" md="8">
      <v-card outlined class="lab-card fill-height">
        <v-card-text><span class="section-label">What we test</span><p class="mb-0 mt-2 body-copy"><slot /></p></v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="4">
      <v-card outlined class="lab-card fill-height status-card">
        <v-card-text>
          <span class="section-label">Current status</span>
          <div class="status-line mt-2"><span class="status-dot" :class="`status-dot--${tone}`" aria-hidden="true" />{{ status }}</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({ props: { status: { type: String, required: true }, tone: { type: String, default: 'neutral' } } })
</script>
