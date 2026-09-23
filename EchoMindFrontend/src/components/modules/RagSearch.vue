<template>
  <section class="brand">
    <div class="brand-mark">EM</div>
    <div>
      <h1>EasyMind RAG检索</h1>
    </div>
  </section>

  <br />

  <article class="tool-panel">
    <div class="panel-heading">
      <h2>知识库检索</h2>
      <span class="pill soft">RAG</span>
    </div>

    <div class="inline-form">
      <input v-model="rag.searchQuery.value" placeholder="退款多久能到账" />
      <button @click="rag.searchKnowledge()" :disabled="rag.ragBusy.value || !rag.searchQuery.value.trim()">检索</button>
    </div>

    <div v-if="rag.ragError.value" class="monitor-error" style="margin-top: 10px;">
      API Error: {{ rag.ragError.value }}
    </div>

    <div class="result-list">
      <article v-for="item in rag.searchResults.value" :key="item.id || item.title" class="result-item">
        <strong>{{ item.title || '未命名结果' }}</strong>
        <span>score {{ item.score ?? '-' }}</span>
        <p>{{ item.content }}</p>
      </article>
    </div>
  </article>
</template>

<script setup>
import { inject } from 'vue'
import { RagKey } from '../../keys'

const rag = inject(RagKey)
</script>
