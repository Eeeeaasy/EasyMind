<template>
  <header class="topbar">
    <a class="brand" href="#" aria-label="EasyMind 首页" @click.prevent="$emit('navigate', 'chat')">
      <span class="brand-mark">E</span><span class="brand-name">EasyMind</span>
    </a>
    <nav class="view-nav" aria-label="工作区">
      <button v-for="item in views" :key="item.value" :class="{ active: activeView === item.value }" @click="$emit('navigate', item.value)">{{ item.label }}</button>
    </nav>
    <div class="topbar-tools">
      <span class="environment-pill"><i :class="healthOk ? 'online' : 'offline'"></i>{{ currentBackend.label }}</span>
      <a class="docs-link" :href="docsUrl" target="_blank" rel="noreferrer">API 文档</a>
      <button class="theme-toggle" type="button" :aria-label="theme === 'dark' ? '切换到白天模式' : '切换到黑夜模式'" @click="$emit('toggle-theme')"><span aria-hidden="true">{{ theme === 'dark' ? '☀' : '☾' }}</span></button>
      <button class="avatar-button" title="当前用户">{{ userInitial }}</button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  activeView: { type: String, required: true },
  theme: { type: String, required: true },
  healthOk: Boolean,
  currentBackend: { type: Object, required: true },
  docsUrl: { type: String, required: true },
  userInitial: { type: String, required: true }
})
defineEmits(['navigate', 'toggle-theme'])
const views = [
  { value: 'chat', label: '对话' },
  { value: 'knowledge', label: '知识库' },
  { value: 'evaluation', label: '评测' },
  { value: 'debug', label: '调试' },
  { value: 'monitor', label: '监控' }
]
</script>
