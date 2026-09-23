<template>
  <section class="brand">
    <div class="brand-mark">EM</div>
    <div>
      <h1>评测摘要</h1>
      <p>单次评测 · 回归对比 · 失败用例</p>
    </div>
  </section>

  <section class="panel">
    <div class="panel-heading">
      <h2>概览</h2>
      <span class="pill soft">Eval</span>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">通过率</div>
        <div class="kpi-value">{{ (evalState.evalPassRate.value * 100).toFixed(1) }}%</div>
        <div class="kpi-mini">passed {{ evalState.evalPassed.value }} / {{ evalState.evalTotal.value }}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">综合评分</div>
        <div class="kpi-value">{{ evalState.evalOverallAvg.value.toFixed(3) }}</div>
        <div class="kpi-mini">avg overall</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">退化指标</div>
        <div class="kpi-value">{{ evalState.evalRegressions.value.length }}</div>
        <div class="kpi-mini">vs baseline</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">失败用例</div>
        <div class="kpi-value">{{ evalState.evalFailedCount.value }}</div>
        <div class="kpi-mini">need attention</div>
      </div>
    </div>

    <div v-if="evalState.evalError.value" class="monitor-error" style="margin-top: 10px;">API Error: {{ evalState.evalError.value }}</div>

    <div class="actions">
      <button @click="evalState.loadEvalReport" :disabled="evalState.evalBusy.value">评测</button>
      <button @click="openEvalDetails" :disabled="evalState.evalBusy.value">查看详情</button>
      <button @click="workspace.selectWorkspace('chat')">返回对话</button>
    </div>
  </section>

  <section class="panel">
    <div class="panel-heading">
      <h2>建议</h2>
      <span class="pill">{{ evalState.evalRecommendations.value.length }}</span>
    </div>

    <div v-if="evalState.evalRecommendations.value.length" class="result-list">
      <article v-for="r in evalState.evalRecommendations.value" :key="r" class="result-item">
        <p style="margin: 0;">{{ r }}</p>
      </article>
    </div>
    <div v-else class="monitor-empty">暂无建议（先运行一次评测）。</div>
  </section>
</template>

<script setup>
import { inject } from 'vue'
import { EvalKey, WorkspaceKey } from '../../keys'

const evalState = inject(EvalKey)
const workspace = inject(WorkspaceKey)

async function openEvalDetails() {
  if (!evalState.evalReport.value) {
    await evalState.loadEvalReport()
  }

  if (!evalState.evalReport.value && !evalState.evalError.value) {
    evalState.evalError.value = '评测接口未返回报告（/eval/run）。请确认后端已实现该接口。'
  }

  workspace.selectWorkspace('eval')
}
</script>
