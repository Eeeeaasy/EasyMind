<template>
  <section class="monitor-panel">
    <header class="monitor-header">
      <div class="monitor-header-left">
        <div class="monitor-title">Agent 性能监控</div>
        <div class="monitor-subtitle">
          {{ currentBackend.label }} · {{ monitor.monitorBusy.value ? '刷新中' : '每 2 秒刷新' }}
        </div>
      </div>
      <div class="monitor-header-actions">
        <button type="button" class="ghost" @click="monitor.loadAgentStats" :disabled="monitor.monitorBusy.value">刷新</button>
        <button type="button" class="ghost" @click="workspace.selectWorkspace('chat')">返回对话</button>
      </div>
    </header>

    <div class="monitor-body">
      <div v-if="monitor.monitorError.value" class="monitor-error">API Error: {{ monitor.monitorError.value }}</div>

      <div class="monitor-grid">
        <section class="monitor-card chart-card">
          <div class="chart-head">
            <div>
              <div class="chart-title">选中 Agent</div>
              <div class="chart-sub mono">{{ monitor.selectedAgentKey.value || '-' }}</div>
            </div>
            <div class="chart-metrics" v-if="monitor.selectedAgent.value">
              <span>success {{ monitor.selectedAgent.value.success_rate }}</span>
              <span>avg {{ monitor.selectedAgent.value.avg_ms }}ms</span>
              <span>score {{ monitor.selectedAgent.value.routing_score }}</span>
            </div>
          </div>

          <div class="chart-row">
            <div class="chart-block">
              <div class="chart-label">routing_score 趋势</div>
              <svg class="chart" viewBox="0 0 520 120" preserveAspectRatio="none" aria-hidden="true">
                <path
                  :d="monitor.sparklinePath(monitor.selectedSeries.value.map(p => p.routing_score), 520, 120)"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </div>

            <div class="chart-block">
              <div class="chart-label">avg_ms 趋势</div>
              <svg class="chart" viewBox="0 0 520 120" preserveAspectRatio="none" aria-hidden="true">
                <path
                  :d="monitor.sparklinePath(monitor.selectedSeries.value.map(p => p.avg_ms), 520, 120)"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </div>
          </div>
        </section>

        <section class="monitor-card table-card">
          <div class="table-head">
            <div class="table-title">所有 Agents</div>
            <div class="table-sub">按 routing_score 排序</div>
          </div>

          <div class="table-wrap">
            <table v-if="monitor.monitorRows.value.length">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Total</th>
                  <th>Success</th>
                  <th>Avg ms</th>
                  <th>Penalty</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in monitor.monitorRows.value"
                  :key="r.key"
                  :class="{ selected: r.key === monitor.selectedAgentKey.value }"
                  @click="monitor.selectAgent(r.key)"
                  style="cursor: pointer;"
                >
                  <td class="mono">{{ r.key }}</td>
                  <td>{{ r.total }}</td>
                  <td :class="{ bad: r.success_rate < 0.9 }">{{ r.success_rate }}</td>
                  <td :class="{ warn: r.avg_ms > 4000 }">{{ r.avg_ms }}</td>
                  <td>{{ r.monitor_penalty }}</td>
                  <td :class="{ bad: r.routing_score < 0.6 }">{{ r.routing_score }}</td>
                </tr>
              </tbody>
            </table>

            <div v-else class="monitor-empty">暂无指标数据（检查 requestMonitor 返回结构/后端 monitor 接口）。</div>
          </div>
        </section>
      </div>

      <pre v-if="monitor.monitorRawText.value" class="monitor-raw">{{ monitor.monitorRawText.value }}</pre>
    </div>
  </section>
</template>

<script setup>
import { inject } from 'vue'
import { CurrentBackendKey, MonitorKey, WorkspaceKey } from '../../keys'

const monitor = inject(MonitorKey)
const workspace = inject(WorkspaceKey)
const currentBackend = inject(CurrentBackendKey)
</script>
