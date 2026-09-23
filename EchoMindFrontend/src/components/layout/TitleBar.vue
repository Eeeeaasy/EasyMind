<template>
  <header class="titlebar">
    <div class="traffic-lights" aria-hidden="true">
      <div class="titlebar-badge" aria-label="Easy" title="Easy"><span>Easy</span></div>
    </div>
    <div class="titlebar-title">EasyMind Console</div>
    <div class="titlebar-actions">
      <a :href="docsUrl" target="_blank" rel="noreferrer">API 文档</a>
    </div>
  </header>
</template>

<script setup>
import { inject } from 'vue'
import { DocsUrlKey } from '../../keys'

const docsUrl = inject(DocsUrlKey)
</script>
