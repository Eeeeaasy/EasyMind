<template>
  <section class="monitor-panel">
    <header class="monitor-header">
      <div class="monitor-header-left">
        <div class="monitor-title">端到端评测报告</div>
        <div class="monitor-subtitle">
          {{ currentBackend.label }} · {{ evalState.evalBusy.value ? '运行中' : '按需运行（不会轮询）' }}
        </div>
      </div>
      <div class="monitor-header-actions">
        <button type="button" class="ghost" @click="evalState.loadEvalReport" :disabled="evalState.evalBusy.value">评测</button>
        <button type="button" class="ghost" @click="workspace.selectWorkspace('chat')">返回对话</button>
      </div>
    </header>

    <div class="monitor-body">
      <div v-if="evalState.evalError.value" class="monitor-error">API Error: {{ evalState.evalError.value }}</div>

      <div class="monitor-grid">
        <section class="monitor-card table-card">
          <div class="table-head">
            <div class="table-title">总体</div>
            <div class="table-sub mono">{{ evalState.evalTimestamp.value || '-' }}</div>
          </div>
          <div class="table-wrap">
            <table>
              <tbody>
                <tr><td>pass_rate</td><td class="mono">{{ evalState.evalPassRate.value.toFixed(4) }}</td></tr>
                <tr><td>total</td><td class="mono">{{ evalState.evalTotal.value }}</td></tr>
                <tr><td>passed</td><td class="mono">{{ evalState.evalPassed.value }}</td></tr>
                <tr><td>overall_avg</td><td class="mono">{{ evalState.evalOverallAvg.value.toFixed(4) }}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="monitor-card table-card">
          <div class="table-head">
            <div class="table-title">平均分</div>
            <div class="table-sub">avg_scores</div>
          </div>
          <div class="table-wrap">
            <table v-if="evalState.evalAvgScoresRows.value.length">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in evalState.evalAvgScoresRows.value" :key="row.key">
                  <td class="mono">{{ row.key }}</td>
                  <td class="mono">{{ row.value }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="monitor-empty">暂无 avg_scores。</div>
          </div>
        </section>

        <section class="monitor-card table-card">
          <div class="table-head">
            <div class="table-title">回归退化</div>
            <div class="table-sub">regressions</div>
          </div>
          <div class="table-wrap">
            <div v-if="evalState.evalRegressions.value.length" class="result-list" style="margin-top: 0;">
              <article v-for="r in evalState.evalRegressions.value" :key="r" class="result-item"><p style="margin:0">{{ r }}</p></article>
            </div>
            <div v-else class="monitor-empty">暂无退化指标。</div>
          </div>
        </section>

        <section class="monitor-card table-card">
          <div class="table-head">
            <div class="table-title">失败用例</div>
            <div class="table-sub">{{ evalState.evalFailedCount.value }}</div>
          </div>
          <div class="table-wrap">
            <table v-if="evalState.evalFailedRows.value.length">
              <thead>
                <tr>
                  <th>test_id</th>
                  <th>overall</th>
                  <th>detail</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in evalState.evalFailedRows.value" :key="r.test_id">
                  <td class="mono">{{ r.test_id }}</td>
                  <td class="mono bad">{{ Number(r.scores?.overall ?? 0).toFixed(3) }}</td>
                  <td>{{ r.detail }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="monitor-empty">暂无失败用例（或尚未运行评测）。</div>
          </div>
        </section>
      </div>

      <pre v-if="evalState.evalRawText.value" class="monitor-raw">{{ evalState.evalRawText.value }}</pre>
    </div>
  </section>
</template>

<script setup>
import { inject } from 'vue'
import { CurrentBackendKey, EvalKey, WorkspaceKey } from '../../keys'

const evalState = inject(EvalKey)
const workspace = inject(WorkspaceKey)
const currentBackend = inject(CurrentBackendKey)
</script>
