<template>
  <section class="brand monitor-brand">
    <div class="brand-mark">EM</div>
    <div>
      <h1>监控摘要</h1>
      <p>左摘要 · 右详情（含趋势图）</p>
    </div>
  </section>

  <section class="panel monitor-summary">
    <div class="panel-heading">
      <h2>概览</h2>
      <span class="pill soft">Monitor</span>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">总请求</div>
        <div class="kpi-value">{{ monitor.monitorOverall.value.total }}</div>
        <div class="kpi-mini">all agents</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">成功率</div>
        <div class="kpi-value">{{ (monitor.monitorOverall.value.success_rate * 100).toFixed(1) }}%</div>
        <svg class="kpi-spark" viewBox="0 0 72 18" aria-hidden="true">
          <path
            :d="monitor.sparklinePath(monitor.overallSeries.value.map(p => p.success_rate), 72, 18)"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
          />
        </svg>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">平均延迟</div>
        <div class="kpi-value">{{ Math.round(monitor.monitorOverall.value.avg_ms) }}ms</div>
        <svg class="kpi-spark" viewBox="0 0 72 18" aria-hidden="true">
          <path
            :d="monitor.sparklinePath(monitor.overallSeries.value.map(p => p.avg_ms), 72, 18)"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
          />
        </svg>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">路由评分</div>
        <div class="kpi-value">{{ Number(monitor.monitorOverall.value.routing_score ?? 0).toFixed(3) }}</div>
        <svg class="kpi-spark" viewBox="0 0 72 18" aria-hidden="true">
          <path
            :d="monitor.sparklinePath(monitor.overallSeries.value.map(p => p.routing_score), 72, 18)"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
          />
        </svg>
      </div>
    </div>
  </section>

  <section class="panel monitor-agents">
    <div class="panel-heading">
      <h2>Agents</h2>
      <span class="pill">{{ monitor.monitorRows.value.length }}</span>
    </div>

    <div class="agent-list">
      <button
        v-for="r in monitor.monitorRows.value"
        :key="r.key"
        type="button"
        class="agent-row"
        :class="{ active: r.key === monitor.selectedAgentKey.value }"
        @click="monitor.selectAgent(r.key)"
      >
        <div class="agent-row-left">
          <div class="agent-key mono">{{ r.key }}</div>
          <div class="agent-sub">score {{ r.routing_score ?? '-' }} · {{ r.avg_ms ?? '-' }}ms</div>
        </div>
        <svg class="agent-spark" viewBox="0 0 72 18" aria-hidden="true">
          <path
            :d="monitor.sparklinePath((monitor.agentHistory[r.key] || []).map(p => p.routing_score), 72, 18)"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
          />
        </svg>
      </button>
    </div>

    <div class="actions">
      <button @click="monitor.loadAgentStats" :disabled="monitor.monitorBusy.value">刷新</button>
      <button @click="openMonitorDetails" :disabled="monitor.monitorBusy.value">查看详情</button>
      <button @click="workspace.selectWorkspace('chat')">返回对话</button>
    </div>
  </section>
</template>

<script setup>
import { inject } from 'vue'
import { MonitorKey, WorkspaceKey } from '../../keys'

const monitor = inject(MonitorKey)
const workspace = inject(WorkspaceKey)

async function openMonitorDetails() {
  if (!monitor.monitorRows.value.length) {
    await monitor.loadAgentStats()
  }

  if (!monitor.monitorRows.value.length && !monitor.monitorError.value) {
    monitor.monitorError.value =
      'monitor 接口未返回 agent_stats（可能当前选择的是 Java 后端）。请切到 Python 后端或给 Java /monitor 补 agent_stats。'
  }

  workspace.selectWorkspace('monitor')
}
</script>
