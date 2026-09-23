<template>
  <section class="legacy-modules">
    <Rail
      :active-panel="workspace.activePanel.value"
      :drawer-open="workspace.drawerOpen.value"
      @select-panel="workspace.selectPanel"
      @toggle-drawer="workspace.toggleDrawer"
    />
    <Drawer
      :active-panel="workspace.activePanel.value"
      :drawer-open="workspace.drawerOpen.value"
    />
    <Workspace :active-workspace="workspace.activeWorkspace.value" />
  </section>
</template>

<script setup>
import { computed, provide, watch } from 'vue'
import Drawer from './components/layout/Drawer.vue'
import Rail from './components/layout/Rail.vue'
import Workspace from './components/layout/WorkSpace.vue'
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

const { settings, persist } = useSettings()
const backendStatus = useBackendStatus(settings)
const chat = useChat(settings, {
  onStatusText: (text) => { backendStatus.statusText.value = text }
})
const markdown = useMarkdown({ onCopyText: (text) => chat.copyText(text) })
const monitor = useMonitor(settings)
const evalState = useEval(settings)
const knowledge = useKnowledgeBase(settings)
const rag = useRag(settings)

const workspace = useWorkspace({
  onPanelChange: (panel) => {
    if (panel === 'monitor') monitor.startMonitorPolling()
    else if (workspace.activeWorkspace.value !== 'monitor') monitor.stopMonitorPolling()
    if (panel === 'eval' && !evalState.evalReport.value && !evalState.evalBusy.value) {
      evalState.loadEvalReport()
    }
  },
  onWorkspaceChange: (mode) => {
    if (mode === 'monitor') monitor.startMonitorPolling()
    else monitor.stopMonitorPolling()
    if (mode === 'kb' && !knowledge.kbListItems.value.length && !knowledge.kbListBusy.value) {
      knowledge.loadKnowledgeList({ reset: true })
    }
  }
})

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
  if (workspace.activeWorkspace.value === 'monitor') monitor.loadAgentStats()
  if (workspace.activeWorkspace.value === 'eval' || workspace.activePanel.value === 'eval') evalState.resetEval()
  if (workspace.activeWorkspace.value === 'kb') {
    knowledge.resetKnowledgeListState()
    knowledge.loadKnowledgeList({ reset: true })
  }
}

provide(SwitchBackendKey, switchBackend)
backendStatus.checkHealth()
backendStatus.loadStats()

watch(
  () => [workspace.activeWorkspace.value, workspace.activePanel.value],
  ([activeWorkspace, activePanel]) => {
    if (activeWorkspace === 'monitor' || activePanel === 'monitor') monitor.startMonitorPolling()
    if (activeWorkspace === 'eval' || activePanel === 'eval') {
      if (!evalState.evalReport.value && !evalState.evalBusy.value) evalState.loadEvalReport()
    }
    if (activeWorkspace === 'kb' && !knowledge.kbListItems.value.length) {
      knowledge.loadKnowledgeList({ reset: true })
    }
  },
  { immediate: true }
)
</script>
