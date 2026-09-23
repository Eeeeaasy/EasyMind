<template>
  <aside class="drawer" :class="{ open: drawerOpen }">
    <div class="drawer-inner">
      <MonitorSummary v-if="activePanel === 'monitor'" />
      <EvalSummary v-else-if="activePanel === 'eval'" />
      <DebugPanel v-else-if="activePanel === 'debug'" />
      <RagSearch v-else-if="activePanel === 'rag'" />
      <KnowledgeImport v-else />
    </div>
  </aside>
</template>

<script setup>
import DebugPanel from '../modules/DebugPanel.vue'
import EvalSummary from '../modules/EvalSummary.vue'
import KnowledgeImport from '../modules/KnowledgeImport.vue'
import MonitorSummary from '../modules/MonitorSummary.vue'
import RagSearch from '../modules/RagSearch.vue'

defineProps({
  activePanel: { type: String, required: true },
  drawerOpen: { type: Boolean, required: true }
})
</script>
