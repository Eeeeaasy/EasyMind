<template>
  <section class="workspace">
    <header class="workspace-header">
      <div>
        <span class="eyebrow">EasyMind Workspace</span><br />
      </div>
    </header>

    <div class="workspace-body">
      <MonitorDetails v-if="activeWorkspace === 'monitor'" />
      <EvalDetails v-else-if="activeWorkspace === 'eval'" />
      <KnowledgeDetails v-else-if="activeWorkspace === 'kb'" />
      <ChatPanel v-else />
    </div>
  </section>
</template>

<script setup>
import ChatPanel from '../views/ChatPanel.vue'
import EvalDetails from '../views/EvalDetails.vue'
import KnowledgeDetails from '../views/KnowledgeDetails.vue'
import MonitorDetails from '../views/MonitorDetails.vue'

defineProps({
  activeWorkspace: { type: String, required: true }
})
</script>
