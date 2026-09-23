import { computed, ref } from 'vue'
import { backendMeta, requestHealth, requestKnowledgeStats, requestMonitor } from '../lib/backends'

export function useBackendStatus(settings) {
  const healthOk = ref(false)
  const healthLabel = ref('未检查')
  const statusText = ref('')
  const knowledgeCount = ref('-')

  const currentBackend = computed(() => backendMeta(settings.backend, settings))

  const docsUrl = computed(() => {
    const meta = currentBackend.value
    const base = String(meta.baseUrl || '')

    if (/^https?:\/\//i.test(base)) {
      return `${base.replace(/\/+$/, '')}/docs`
    }

    const proto = window.location?.protocol || 'http:'
    const host = window.location?.hostname || 'localhost'
    return `${proto}//${host}:${meta.port}/docs`
  })

  async function checkHealth() {
    try {
      const data = await requestHealth(settings.backend, settings)
      healthOk.value = data.status === 'ok'
      healthLabel.value = data.status || 'ok'
      statusText.value = JSON.stringify(data, null, 2)
    } catch (error) {
      healthOk.value = false
      healthLabel.value = '不可用'
      statusText.value = error?.message ?? String(error)
    }
  }

  async function loadStats() {
    try {
      const [stats, monitor] = await Promise.allSettled([
        requestKnowledgeStats(settings.backend, settings),
        requestMonitor(settings.backend, settings)
      ])

      if (stats.status === 'fulfilled') {
        knowledgeCount.value = stats.value.total_chunks ?? stats.value.totalChunks ?? '-'
      }

      if (monitor.status === 'fulfilled') {
        statusText.value = JSON.stringify(monitor.value, null, 2)
      }
    } catch (error) {
      statusText.value = error?.message ?? String(error)
    }
  }

  function resetHealth() {
    healthOk.value = false
    healthLabel.value = '未检查'
    statusText.value = ''
  }

  return {
    currentBackend,
    docsUrl,

    healthOk,
    healthLabel,
    statusText,
    knowledgeCount,

    checkHealth,
    loadStats,
    resetHealth
  }
}
