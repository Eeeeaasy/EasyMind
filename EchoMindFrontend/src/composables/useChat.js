import { computed, nextTick, ref, watch } from 'vue'
import { requestChat } from '../lib/backends'

export function useChat(settings, { onStatusText } = {}) {
  const messages = ref([])
  const draft = ref('')
  const busy = ref(false)

  const messageList = ref(null)
  const composerTextarea = ref(null)

  const lastAssistantId = computed(() => [...messages.value].reverse().find((m) => m.role === 'assistant')?.id ?? null)

  function autosizeTextarea() {
    const el = composerTextarea.value
    if (!el) return
    el.style.height = 'auto'
    const max = 160
    el.style.height = `${Math.min(el.scrollHeight, max)}px`
  }

  watch(draft, async () => {
    await nextTick()
    autosizeTextarea()
  })

  function clearMessages() {
    messages.value = []
    draft.value = ''
    nextTick(() => {
      messageList.value?.scrollTo({ top: 0 })
      autosizeTextarea()
    })
  }

  function isLastAssistant(item) {
    return item?.role === 'assistant' && item?.id && item.id === lastAssistantId.value
  }

  function applySuggestion(text) {
    draft.value = text
    nextTick(() => {
      autosizeTextarea()
      composerTextarea.value?.focus()
    })
  }

  async function scrollToBottom() {
    await nextTick()
    messageList.value?.scrollTo({ top: messageList.value.scrollHeight, behavior: 'smooth' })
  }

  async function sendMessage() {
    const content = draft.value.trim()
    if (!content) return

    messages.value.push({ id: crypto.randomUUID(), role: 'user', content })
    draft.value = ''
    busy.value = true

    try {
      const response = await requestChat(settings.backend, settings, content)

      if (response.conversationId && !settings.conversationId) {
        settings.conversationId = response.conversationId
      }

      const meta = [
        response.intent,
        response.agentType,
        response.knowledgeUsed ? 'RAG' : '',
        response.escalated ? '转人工' : ''
      ]
        .filter(Boolean)
        .join(' · ')

      messages.value.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response,
        meta
      })
    } catch (error) {
      messages.value.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: error?.message ?? String(error),
        meta: '请求失败'
      })
    } finally {
      busy.value = false
      await scrollToBottom()
    }
  }

  async function regenerateLastAssistant() {
    if (busy.value) return

    const lastUser = [...messages.value].reverse().find((m) => m.role === 'user')
    if (!lastUser) return

    const lastAssistantIndex = (() => {
      for (let i = messages.value.length - 1; i >= 0; i -= 1) {
        if (messages.value[i].role === 'assistant') return i
      }
      return -1
    })()

    if (lastAssistantIndex >= 0) messages.value.splice(lastAssistantIndex, 1)

    busy.value = true
    try {
      const response = await requestChat(settings.backend, settings, lastUser.content)

      const meta = [
        response.intent,
        response.agentType,
        response.knowledgeUsed ? 'RAG' : '',
        response.escalated ? '转人工' : ''
      ]
        .filter(Boolean)
        .join(' · ')

      messages.value.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response,
        meta
      })
    } catch (error) {
      messages.value.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: error?.message ?? String(error),
        meta: '请求失败'
      })
    } finally {
      busy.value = false
      await scrollToBottom()
    }
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text ?? '')
    } catch (error) {
      if (typeof onStatusText === 'function') {
        onStatusText(`复制失败: ${error?.message ?? String(error)}`)
      }
    }
  }

  return {
    messages,
    draft,
    busy,

    messageList,
    composerTextarea,

    lastAssistantId,

    autosizeTextarea,
    clearMessages,
    isLastAssistant,
    applySuggestion,
    sendMessage,
    regenerateLastAssistant,

    copyText
  }
}
