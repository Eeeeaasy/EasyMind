import { ref } from 'vue'
import { addKnowledge, requestKnowledgeList, uploadKnowledge } from '../lib/backends'

export function useKnowledgeBase(settings) {
  // left import form state
  const docTitle = ref('退款补充政策')
  const docContent = ref('大促期间退款审核时间可能延长到 3-5 个工作日。')

  // right list view state
  const kbListItems = ref([])
  const kbListTotal = ref(0)
  const kbListOffset = ref(0)
  const KB_LIST_LIMIT = 50
  const kbQuery = ref('')
  const kbListBusy = ref(false)
  const kbListError = ref('')
  const kbAllTotal = ref(0)

  async function loadKnowledgeList({ reset = false } = {}) {
    kbListBusy.value = true
    try {
      kbListError.value = ''
      if (reset) kbListOffset.value = 0

      const data = await requestKnowledgeList(settings.backend, settings, {
        offset: kbListOffset.value,
        limit: KB_LIST_LIMIT,
        q: kbQuery.value,
        mode: 'doc',
        maxChars: 4000
      })

      kbListItems.value = Array.isArray(data?.items) ? data.items : []
      kbListTotal.value = Number(data?.total ?? kbListItems.value.length)
      kbAllTotal.value = Number(data?.all_total ?? data?.allTotal ?? kbListTotal.value)
    } catch (error) {
      kbListError.value = error?.message ?? String(error)
      kbListItems.value = []
      kbListTotal.value = 0
    } finally {
      kbListBusy.value = false
    }
  }

  function kbPrevPage() {
    if (kbListBusy.value) return
    if (kbListOffset.value <= 0) return
    kbListOffset.value = Math.max(0, kbListOffset.value - KB_LIST_LIMIT)
    loadKnowledgeList()
  }

  function kbNextPage() {
    if (kbListBusy.value) return
    if (kbListOffset.value + KB_LIST_LIMIT >= kbListTotal.value) return
    kbListOffset.value = kbListOffset.value + KB_LIST_LIMIT
    loadKnowledgeList()
  }

  async function submitKnowledge() {
    const title = docTitle.value.trim()
    const content = docContent.value.trim()
    if (!title || !content) return null

    return addKnowledge(settings.backend, settings, [{ title, content }])
  }

  async function uploadFile(file) {
    if (!file) return null
    return uploadKnowledge(settings.backend, settings, file)
  }

  function resetKnowledgeListState() {
    kbListItems.value = []
    kbListTotal.value = 0
    kbListOffset.value = 0
    kbListError.value = ''
    kbAllTotal.value = 0
  }

  return {
    docTitle,
    docContent,

    kbListItems,
    kbListTotal,
    kbListOffset,
    KB_LIST_LIMIT,
    kbQuery,
    kbListBusy,
    kbListError,
    kbAllTotal,

    loadKnowledgeList,
    kbPrevPage,
    kbNextPage,

    submitKnowledge,
    uploadFile,

    resetKnowledgeListState
  }
}
