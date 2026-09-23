import { reactive, watch } from 'vue'
import { createInitialSettings, saveSettings } from '../lib/backends'

export function useSettings() {
  const settings = reactive(createInitialSettings())

  function persist() {
    saveSettings(settings)
  }

  // Keep behavior: persist when conversationId changes.
  watch(
    () => settings.conversationId,
    () => persist()
  )

  return { settings, persist }
}
