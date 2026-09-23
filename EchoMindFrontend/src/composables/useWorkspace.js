import { onMounted, ref, watch } from 'vue'

const LS_DRAWER_OPEN = 'em.drawerOpen'
const LS_ACTIVE_PANEL = 'em.activePanel'
const LS_ACTIVE_WORKSPACE = 'em.activeWorkspace'

/**
 * Manages UI navigation state:
 * - left rail (activePanel)
 * - drawer open/close
 * - right workspace mode (activeWorkspace)
 *
 * Optional callbacks allow orchestrating side effects (polling, lazy loads).
 */
export function useWorkspace({ onPanelChange, onWorkspaceChange } = {}) {
  const drawerOpen = ref(true)
  const activePanel = ref('debug')
  const activeWorkspace = ref('chat')

  function toggleDrawer() {
    drawerOpen.value = !drawerOpen.value
  }

  function selectPanel(panel) {
    activePanel.value = panel

    // When switching the left module, exit the right-side detail views if they don't match.
    if (panel !== 'monitor' && activeWorkspace.value === 'monitor') activeWorkspace.value = 'chat'
    if (panel !== 'eval' && activeWorkspace.value === 'eval') activeWorkspace.value = 'chat'
    if (panel !== 'kb' && activeWorkspace.value === 'kb') activeWorkspace.value = 'chat'

    // Ensure drawer visible when a module is clicked.
    if (!drawerOpen.value) drawerOpen.value = true
  }

  function selectWorkspace(mode) {
    activeWorkspace.value = mode

    // Opening right-side details should also sync left panel.
    if (mode === 'monitor') {
      activePanel.value = 'monitor'
      if (!drawerOpen.value) drawerOpen.value = true
    }
    if (mode === 'eval') {
      activePanel.value = 'eval'
      if (!drawerOpen.value) drawerOpen.value = true
    }
    if (mode === 'kb') {
      activePanel.value = 'kb'
      if (!drawerOpen.value) drawerOpen.value = true
    }
  }

  watch(drawerOpen, (value) => {
    localStorage.setItem(LS_DRAWER_OPEN, value ? '1' : '0')
  })

  watch(activePanel, (value) => {
    localStorage.setItem(LS_ACTIVE_PANEL, value)
    if (typeof onPanelChange === 'function') onPanelChange(value)
  })

  watch(activeWorkspace, (value) => {
    localStorage.setItem(LS_ACTIVE_WORKSPACE, value)
    if (typeof onWorkspaceChange === 'function') onWorkspaceChange(value)
  })

  onMounted(() => {
    const savedOpen = localStorage.getItem(LS_DRAWER_OPEN)
    if (savedOpen !== null) drawerOpen.value = savedOpen === '1'

    const savedPanel = localStorage.getItem(LS_ACTIVE_PANEL)
    if (savedPanel) activePanel.value = savedPanel

    const savedWorkspace = localStorage.getItem(LS_ACTIVE_WORKSPACE)
    if (savedWorkspace) activeWorkspace.value = savedWorkspace
  })

  return {
    drawerOpen,
    activePanel,
    activeWorkspace,
    toggleDrawer,
    selectPanel,
    selectWorkspace
  }
}
