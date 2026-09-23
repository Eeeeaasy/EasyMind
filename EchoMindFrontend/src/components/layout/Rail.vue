<template>
  <aside class="rail" aria-label="侧边栏">
    <button
      type="button"
      class="rail-button"
      :class="{ active: activePanel === 'debug' }"
      @click="$emit('select-panel', 'debug')"
      title="调试"
      aria-label="调试"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <circle cx="9" cy="7" r="2" fill="none" stroke="currentColor" stroke-width="1.6" />

        <path d="M4 12h16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <circle cx="15" cy="12" r="2" fill="none" stroke="currentColor" stroke-width="1.6" />

        <path d="M4 17h16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <circle cx="11" cy="17" r="2" fill="none" stroke="currentColor" stroke-width="1.6" />
      </svg>
    </button>

    <button
      type="button"
      class="rail-button"
      :class="{ active: activePanel === 'rag' }"
      @click="$emit('select-panel', 'rag')"
      title="RAG 检索"
      aria-label="RAG 检索"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="1.6" />
        <path d="M16.5 16.5L20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
    </button>

    <button
      type="button"
      class="rail-button"
      :class="{ active: activePanel === 'kb' }"
      @click="$emit('select-panel', 'kb')"
      title="知识库"
      aria-label="知识库"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M7 4h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
        <path d="M9 4v18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
    </button>

    <button
      type="button"
      class="rail-button"
      :class="{ active: activePanel === 'monitor' }"
      @click="$emit('select-panel', 'monitor')"
      title="监控"
      aria-label="监控"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20V10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <path d="M10 20V4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <path d="M16 20V14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <path d="M22 20H2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
    </button>

    <button
      type="button"
      class="rail-button"
      :class="{ active: activePanel === 'eval' }"
      @click="$emit('select-panel', 'eval')"
      title="评测"
      aria-label="评测"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 20V10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <path d="M10 20V6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <path d="M15 20V13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <path d="M20 20V4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <path d="M22 20H2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
    </button>

    <div class="rail-spacer"></div>

    <button
      type="button"
      class="rail-button rail-toggle"
      @click="$emit('toggle-drawer')"
      :title="drawerOpen ? '收起面板' : '展开面板'"
      :aria-label="drawerOpen ? '收起面板' : '展开面板'"
    >
      <svg v-if="drawerOpen" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M14 6l-6 6 6 6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M10 6l6 6-6 6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </aside>
</template>

<script setup>
defineProps({
  activePanel: { type: String, required: true },
  drawerOpen: { type: Boolean, required: true }
})

defineEmits(['select-panel', 'toggle-drawer'])
</script>
