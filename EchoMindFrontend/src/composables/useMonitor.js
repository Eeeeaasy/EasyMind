import { computed, onUnmounted, reactive, ref } from 'vue'
import { requestMonitor } from '../lib/backends'

export function useMonitor(settings) {
  const agentStats = ref({})
  const monitorBusy = ref(false)
  const monitorError = ref('')
  const monitorRawText = ref('')

  // left summary / right details shared state
  const selectedAgentKey = ref('')
  const agentHistory = reactive({})
  const overallHistory = ref([])
  const MAX_POINTS = 90

  let monitorTimer = null

  const monitorRows = computed(() => {
    const s = agentStats.value || {}
    return Object.entries(s)
      .map(([key, v]) => ({ key, ...(v || {}) }))
      .sort((a, b) => (b.routing_score ?? 0) - (a.routing_score ?? 0))
  })

  const selectedAgent = computed(() => {
    const key = selectedAgentKey.value
    if (!key) return null
    return agentStats.value?.[key] ?? null
  })

  const selectedSeries = computed(() => {
    const key = selectedAgentKey.value
    const series = key && agentHistory[key] ? agentHistory[key] : []
    return series.slice(-MAX_POINTS)
  })

  const overallSeries = computed(() => overallHistory.value.slice(-MAX_POINTS))

  function computeOverallFromStats(statsObj) {
    const entries = Object.entries(statsObj || {})
    if (!entries.length) {
      return { total: 0, success_rate: 1, avg_ms: 0, routing_score: 0 }
    }

    let total = 0
    let successEst = 0
    let totalMsEst = 0
    let scoreSum = 0

    for (const [, s] of entries) {
      const t = Number(s?.total ?? 0)
      const sr = Number(s?.success_rate ?? 1)
      const avg = Number(s?.avg_ms ?? 0)
      const score = Number(s?.routing_score ?? 0)

      total += t
      successEst += t * sr
      totalMsEst += t * avg
      scoreSum += score
    }

    const success_rate = total ? successEst / total : 1
    const avg_ms = total ? totalMsEst / total : 0
    const routing_score = entries.length ? scoreSum / entries.length : 0

    return { total, success_rate, avg_ms, routing_score }
  }

  const monitorOverall = computed(() => computeOverallFromStats(agentStats.value))

  function selectAgent(key) {
    if (!key) return
    selectedAgentKey.value = key
  }

  async function loadAgentStats() {
    monitorBusy.value = true
    try {
      monitorError.value = ''
      const data = await requestMonitor(settings.backend, settings)

      // tolerate multiple possible shapes
      const maybeStats = data?.agent_stats ?? data?.agents ?? data?.stats ?? data
      const statsObj = maybeStats || {}

      agentStats.value = statsObj
      monitorRawText.value = JSON.stringify(data, null, 2)

      const now = Date.now()
      for (const [key, s] of Object.entries(statsObj)) {
        if (!agentHistory[key]) agentHistory[key] = []
        agentHistory[key].push({
          t: now,
          success_rate: Number(s?.success_rate ?? 1),
          avg_ms: Number(s?.avg_ms ?? 0),
          routing_score: Number(s?.routing_score ?? 0)
        })
        if (agentHistory[key].length > MAX_POINTS) {
          agentHistory[key].splice(0, agentHistory[key].length - MAX_POINTS)
        }
      }

      const overall = computeOverallFromStats(statsObj)
      overallHistory.value.push({ t: now, ...overall })
      if (overallHistory.value.length > MAX_POINTS) {
        overallHistory.value.splice(0, overallHistory.value.length - MAX_POINTS)
      }

      if (!selectedAgentKey.value) {
        let bestKey = ''
        let bestScore = -Infinity
        for (const [k, s] of Object.entries(statsObj)) {
          const score = Number(s?.routing_score ?? -Infinity)
          if (score > bestScore) {
            bestScore = score
            bestKey = k
          }
        }
        selectedAgentKey.value = bestKey || Object.keys(statsObj)[0] || ''
      }
    } catch (error) {
      monitorError.value = error?.message ?? String(error)
    } finally {
      monitorBusy.value = false
    }
  }

  function startMonitorPolling() {
    stopMonitorPolling()
    loadAgentStats()
    monitorTimer = window.setInterval(loadAgentStats, 2000)
  }

  function stopMonitorPolling() {
    if (monitorTimer) window.clearInterval(monitorTimer)
    monitorTimer = null
  }

  function sparklinePath(values, width = 72, height = 18, padding = 2) {
    const nums = (values || []).map((v) => Number(v)).filter((v) => Number.isFinite(v))
    if (nums.length <= 1) return ''

    let min = Math.min(...nums)
    let max = Math.max(...nums)
    if (min === max) {
      min -= 1
      max += 1
    }

    const w = Math.max(1, width - padding * 2)
    const h = Math.max(1, height - padding * 2)
    const stepX = nums.length === 1 ? 0 : w / (nums.length - 1)

    const points = nums.map((v, i) => {
      const x = padding + i * stepX
      const t = (v - min) / (max - min)
      const y = padding + (1 - t) * h
      return [x, y]
    })

    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`)
      .join(' ')
  }

  onUnmounted(() => {
    stopMonitorPolling()
  })

  return {
    // state
    agentStats,
    monitorBusy,
    monitorError,
    monitorRawText,

    selectedAgentKey,
    agentHistory,
    overallHistory,

    // computed
    monitorRows,
    selectedAgent,
    selectedSeries,
    overallSeries,
    monitorOverall,

    // actions
    selectAgent,
    loadAgentStats,
    startMonitorPolling,
    stopMonitorPolling,

    // utils
    sparklinePath,
    MAX_POINTS
  }
}
