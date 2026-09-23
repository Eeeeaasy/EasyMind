import { computed, ref } from 'vue'
import { requestEvalRun } from '../lib/backends'

export function useEval(settings) {
  const evalReport = ref(null)
  const evalBusy = ref(false)
  const evalError = ref('')
  const evalRawText = ref('')

  const evalPassRate = computed(() => Number(evalReport.value?.pass_rate ?? 0))
  const evalTotal = computed(() => Number(evalReport.value?.total ?? 0))
  const evalPassed = computed(() => Number(evalReport.value?.passed ?? 0))
  const evalTimestamp = computed(() => String(evalReport.value?.timestamp ?? ''))
  const evalRegressions = computed(() => (Array.isArray(evalReport.value?.regressions) ? evalReport.value.regressions : []))
  const evalRecommendations = computed(() =>
    Array.isArray(evalReport.value?.recommendations) ? evalReport.value.recommendations : []
  )
  const evalResults = computed(() => (Array.isArray(evalReport.value?.results) ? evalReport.value.results : []))
  const evalFailedRows = computed(() => evalResults.value.filter((r) => r && r.passed === false))
  const evalFailedCount = computed(() => evalFailedRows.value.length)

  const evalAvgScoresRows = computed(() => {
    const s = evalReport.value?.avg_scores
    if (!s || typeof s !== 'object') return []
    return Object.entries(s)
      .map(([k, v]) => ({ key: String(k), value: Number(v).toFixed(4) }))
      .sort((a, b) => a.key.localeCompare(b.key))
  })

  const evalOverallAvg = computed(() => Number(evalReport.value?.avg_scores?.overall ?? 0))

  async function loadEvalReport() {
    evalBusy.value = true
    try {
      evalError.value = ''
      const data = await requestEvalRun(settings.backend, settings, null)
      evalReport.value = data
      evalRawText.value = JSON.stringify(data, null, 2)
    } catch (error) {
      evalError.value = error?.message ?? String(error)
    } finally {
      evalBusy.value = false
    }
  }

  function resetEval() {
    evalReport.value = null
    evalError.value = ''
    evalRawText.value = ''
  }

  return {
    evalReport,
    evalBusy,
    evalError,
    evalRawText,

    evalPassRate,
    evalTotal,
    evalPassed,
    evalTimestamp,
    evalRegressions,
    evalRecommendations,
    evalResults,
    evalFailedRows,
    evalFailedCount,
    evalAvgScoresRows,
    evalOverallAvg,

    loadEvalReport,
    resetEval
  }
}
