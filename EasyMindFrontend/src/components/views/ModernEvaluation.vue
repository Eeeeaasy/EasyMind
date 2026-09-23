<template>
  <section class="page page-evaluation">
    <div class="page-heading"><div class="heading-copy"><span class="kicker">Evaluation lab</span><h1>评测 Agent</h1><p>运行 FastAPI 内置评测，查看意图识别、对话质量和回归结果。</p></div><button @click="$emit('run')" :disabled="busy">{{ busy ? '运行中...' : '运行评测' }}</button></div>
    <div v-if="evalData" class="evaluation-content"><div class="evaluation-summary"><div class="score-hero"><span>Pass rate</span><strong>{{ formatPercent(evalData.pass_rate) }}</strong><small>{{ evalData.passed }} / {{ evalData.total }} cases passed</small></div><div><span>通过</span><strong>{{ evalData.passed }}</strong></div><div><span>总数</span><strong>{{ evalData.total }}</strong></div><div><span>回归</span><strong :class="evalData.regressions?.length ? 'danger' : 'success'">{{ evalData.regressions?.length || 0 }}</strong></div></div><div class="evaluation-layout"><section class="workspace-card"><div class="card-heading"><div><span class="kicker">Scores</span><h2>平均评分</h2></div></div><div class="score-list"><div v-for="(value, key) in evalData.avg_scores" :key="key"><span>{{ key }}</span><i><b :style="{ width: `${Math.min(Number(value) * 10, 100)}%` }"></b></i><strong>{{ Number(value).toFixed(2) }}</strong></div></div></section><section class="workspace-card"><div class="card-heading"><div><span class="kicker">Recommendations</span><h2>优化建议</h2></div></div><div v-if="evalData.recommendations?.length" class="recommendations"><p v-for="(item, index) in evalData.recommendations" :key="index">{{ item }}</p></div><div v-else class="workspace-empty">本次评测没有返回额外建议。</div></section></div></div><div v-else class="evaluation-empty"><div class="empty-symbol">◎</div><h2>还没有评测结果</h2><p>点击右上角运行一次评测。</p></div>
  </section>
</template>
<script setup>
defineProps({ evalData: Object, busy: Boolean, formatPercent: { type: Function, required: true } })
defineEmits(['run'])
</script>
