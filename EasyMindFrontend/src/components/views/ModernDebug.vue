<template>
  <section class="page page-debug">
    <div class="page-heading"><div class="heading-copy"><span class="kicker">Debug console</span><h1>调试配置</h1><p>统一配置后端连接、会话参数并查看服务状态。</p></div></div>
    <div class="debug-layout">
      <section class="workspace-card"><div class="card-heading"><div><span class="kicker">Python backend</span><h2>后端连接</h2></div><span class="status-copy" :class="healthOk ? 'success' : 'muted'">{{ healthLabel }}</span></div><label><span>Python API</span><input v-model="settings.endpoints.python" @change="$emit('persist')" placeholder="/api/python" /></label><div class="side-actions"><button @click="$emit('check-health')">检查连接</button><button class="quiet-button" @click="$emit('refresh')">刷新状态</button></div></section>
      <section class="workspace-card"><div class="card-heading"><div><span class="kicker">Session</span><h2>会话参数</h2></div></div><label><span>用户 ID</span><input v-model="settings.userId" @change="$emit('persist')" placeholder="u1001" /></label><label><span>会话 ID</span><input v-model="settings.conversationId" @change="$emit('persist')" placeholder="自动生成" /></label><pre v-if="statusText" class="debug-output">{{ statusText }}</pre></section>
    </div>
  </section>
</template>
<script setup>
defineProps({ settings: Object, healthOk: Boolean, healthLabel: String, statusText: String })
defineEmits(['persist', 'check-health', 'refresh'])
</script>
