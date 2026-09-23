import { ref } from 'vue'
import { requestSearch } from '../lib/backends'

export function useRag(settings) {
  const searchQuery = ref('退款多久能到账')
  const searchResults = ref([])
  const ragBusy = ref(false)
  const ragError = ref('')

  async function searchKnowledge(topK = 5) {
    ragBusy.value = true
    try {
      ragError.value = ''
      const data = await requestSearch(settings.backend, settings, searchQuery.value, topK)
      searchResults.value = data?.results || []
    } catch (error) {
      ragError.value = error?.message ?? String(error)
      searchResults.value = []
    } finally {
      ragBusy.value = false
    }
  }

  function resetRag() {
    searchResults.value = []
    ragError.value = ''
    ragBusy.value = false
  }

  return {
    searchQuery,
    searchResults,
    ragBusy,
    ragError,
    searchKnowledge,
    resetRag
  }
}
