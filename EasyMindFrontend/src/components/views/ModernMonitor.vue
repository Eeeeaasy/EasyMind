<template>
  <section class="page page-monitor">
    <div class="page-heading"><div class="heading-copy"><span class="kicker">Runtime monitor</span><h1>Agent 性能监控</h1><p>查看各 Agent 的请求量、成功率、响应耗时和路由评分。</p></div><button @click="$emit('refresh')" :disabled="busy">刷新数据</button></div>
    <section class="workspace-card monitor-workspace"><div class="monitor-table-wrap"><table v-if="Object.keys(monitorData.agent_stats || {}).length"><thead><tr><th>Agent</th><th>请求数</th><th>成功率</th><th>平均耗时</th><th>路由评分</th></tr></thead><tbody><tr v-for="(item, name) in monitorData.agent_stats" :key="name"><td>{{ name }}</td><td>{{ item.total || 0 }}</td><td>{{ item.success_rate ?? '-' }}</td><td>{{ item.avg_ms ?? '-' }} ms</td><td>{{ item.routing_score ?? '-' }}</td></tr></tbody></table><div v-else class="workspace-empty">暂无监控数据，请确认后端服务已启动。</div></div></section>
  </section>
</template>
<script setup>
defineProps({ monitorData: Object, busy: Boolean })
defineEmits(['refresh'])
</script>
