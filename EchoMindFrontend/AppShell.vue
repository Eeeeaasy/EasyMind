<template>
  <div class="mac-desktop">
    <div class="mac-window">
      <TitleBar />

      <main :class="['app-shell', { 'drawer-collapsed': !workspace.drawerOpen.value }]">
        <Rail
          :active-panel="workspace.activePanel.value"
          :drawer-open="workspace.drawerOpen.value"
          @select-panel="workspace.selectPanel"
          @toggle-drawer="workspace.toggleDrawer"
        />

        <Drawer :active-panel="workspace.activePanel.value" :drawer-open="workspace.drawerOpen.value" />

        <Workspace :active-workspace="workspace.activeWorkspace.value" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, provide, watch } from 'vue'

import TitleBar from './components/layout/TitleBar.vue'
import Rail from './components/layout/Rail.vue'
import Drawer from './components/layout/Drawer.vue'
import Workspace from './components/layout/Workspace.vue'

import {
  BackendStatusKey,
  ChatKey,
  CurrentBackendKey,
  DocsUrlKey,
  EvalKey,
  KnowledgeKey,
  MarkdownKey,
  MonitorKey,
  PersistSettingsKey,
  RagKey,
  SettingsKey,
  SwitchBackendKey,
  WorkspaceKey
} from './keys'

import { useBackendStatus } from './composables/useBackendStatus'
import { useChat } from './composables/useChat'
import { useEval } from './composables/useEval'
import { useKnowledgeBase } from './composables/useKnowledgeBase'
import { useMarkdown } from './composables/useMarkdown'
import { useMonitor } from './composables/useMonitor'
import { useRag } from './composables/useRag'
import { useSettings } from './composables/useSettings'
import { useWorkspace } from './composables/useWorkspace'

// ========== Settings (persisted) ==========
const { settings, persist } = useSettings()

// ========== Backend status ==========
const backendStatus = useBackendStatus(settings)

// Allow chat to push copy errors into statusText (keeps original UX).
const chat = useChat(settings, {
  onStatusText: (text) => {
    backendStatus.statusText.value = text
  }
})

const markdown = useMarkdown({
  onCopyText: (text) => chat.copyText(text)
})

const monitor = useMonitor(settings)
const evalState = useEval(settings)
const knowledge = useKnowledgeBase(settings)
const rag = useRag(settings)

// ========== Workspace state machine ==========
const workspace = useWorkspace({
  onPanelChange: (panel) => {
    // Mirror original behavior: entering monitor starts polling; leaving stops if not in monitor details.
    if (panel === 'monitor') monitor.startMonitorPolling()
    else if (workspace.activeWorkspace.value !== 'monitor') monitor.stopMonitorPolling()

    // Entering eval triggers one-time load.
    if (panel === 'eval' && !evalState.evalReport.value && !evalState.evalBusy.value) {
      evalState.loadEvalReport()
    }
  },
  onWorkspaceChange: (mode) => {
    if (mode === 'monitor') monitor.startMonitorPolling()
    else monitor.stopMonitorPolling()

    if (mode === 'kb') {
      if (!knowledge.kbListItems.value.length && !knowledge.kbListBusy.value) {
        knowledge.loadKnowledgeList({ reset: true })
      }
    }
  }
})

// ========== Derived / provide ==========
const currentBackend = computed(() => backendStatus.currentBackend.value)

provide(SettingsKey, settings)
provide(PersistSettingsKey, persist)
provide(CurrentBackendKey, currentBackend)
provide(DocsUrlKey, backendStatus.docsUrl)

provide(WorkspaceKey, workspace)
provide(BackendStatusKey, backendStatus)

provide(MarkdownKey, markdown)
provide(ChatKey, chat)
provide(MonitorKey, monitor)
provide(EvalKey, evalState)
provide(KnowledgeKey, knowledge)
provide(RagKey, rag)

function switchBackend(type) {
  settings.backend = type
  persist()

  backendStatus.resetHealth()
  rag.resetRag()

  backendStatus.checkHealth()

  // Switching backend: if in monitor details, refresh immediately.
  if (workspace.activeWorkspace.value === 'monitor') {
    monitor.loadAgentStats()
  }

  // Eval results should not be reused across backends.
  if (workspace.activeWorkspace.value === 'eval' || workspace.activePanel.value === 'eval') {
    evalState.resetEval()
  }

  // Knowledge list belongs to backend.
  if (workspace.activeWorkspace.value === 'kb') {
    knowledge.resetKnowledgeListState()
    knowledge.loadKnowledgeList({ reset: true })
  }
}

provide(SwitchBackendKey, switchBackend)

// Equivalent to original mounted startup behavior.
backendStatus.checkHealth()
backendStatus.loadStats()

// If refresh lands on monitor/eval/kb, do the correct lazy loads.
watch(
  () => [workspace.activeWorkspace.value, workspace.activePanel.value],
  ([ws, panel]) => {
    if (ws === 'monitor' || panel === 'monitor') monitor.startMonitorPolling()
    if (ws === 'eval' || panel === 'eval') {
      if (!evalState.evalReport.value && !evalState.evalBusy.value) evalState.loadEvalReport()
    }
    if (ws === 'kb') {
      if (!knowledge.kbListItems.value.length && !knowledge.kbListBusy.value) knowledge.loadKnowledgeList({ reset: true })
    }
  },
  { immediate: true }
)
</script>
