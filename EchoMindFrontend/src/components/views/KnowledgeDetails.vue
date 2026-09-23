<template>
  <section class="monitor-panel">
    <header class="monitor-header">
      <div class="monitor-header-left">
        <div class="monitor-title">知识库内容</div>
        <div class="monitor-subtitle">
          {{ currentBackend.label }} · {{ knowledge.kbListBusy.value ? '加载中' : `命中 ${knowledge.kbListTotal.value} / 总 ${knowledge.kbAllTotal.value} 条` }}
        </div>
      </div>
      <div class="monitor-header-actions">
        <button type="button" class="ghost" @click="knowledge.loadKnowledgeList({ reset: true })" :disabled="knowledge.kbListBusy.value">刷新</button>
        <button type="button" class="ghost" @click="workspace.selectWorkspace('chat')">返回对话</button>
      </div>
    </header>

    <div class="monitor-body">
      <div v-if="knowledge.kbListError.value" class="monitor-error">API Error: {{ knowledge.kbListError.value }}</div>

      <section class="monitor-card table-card">
        <div class="table-head">
          <div>
            <div class="table-title">片段列表</div>
            <div class="table-sub mono">offset {{ knowledge.kbListOffset.value }} · limit {{ knowledge.KB_LIST_LIMIT }}</div>
          </div>
          <div class="actions" style="margin-top:0;">
            <button @click="knowledge.kbPrevPage" :disabled="knowledge.kbListBusy.value || knowledge.kbListOffset.value <= 0">上一页</button>
            <button
              @click="knowledge.kbNextPage"
              :disabled="knowledge.kbListBusy.value || (knowledge.kbListOffset.value + knowledge.KB_LIST_LIMIT) >= knowledge.kbListTotal.value"
            >
              下一页
            </button>
          </div>
        </div>

        <div class="inline-form" style="margin: 0 0 8px;">
          <input v-model="knowledge.kbQuery.value" placeholder="关键字模糊匹配（标题/内容）" />
          <button @click="knowledge.loadKnowledgeList({ reset: true })" :disabled="knowledge.kbListBusy.value">查询</button>
        </div>

        <div class="table-wrap">
          <div v-if="knowledge.kbListItems.value.length" class="result-list" style="margin-top: 0;">
            <article v-for="item in knowledge.kbListItems.value" :key="item.id" class="result-item">
              <strong>{{ item.title || '未命名文档' }}</strong>
              <span v-if="item.kind === 'chunk'" class="mono">chunk {{ item.chunk ?? 0 }} / {{ item.total_chunks ?? '-' }}</span>
              <span v-else class="mono">chunks {{ item.chunks ?? '-' }}<span v-if="item.truncated"> · preview</span></span>
              <div>{{ item.content }}</div>
            </article>
          </div>
          <div v-else class="monitor-empty">暂无知识库内容（先在左侧导入文档，或确认后端 /knowledge/list 可用）。</div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { inject } from 'vue'
import { CurrentBackendKey, KnowledgeKey, WorkspaceKey } from '../../keys'

const knowledge = inject(KnowledgeKey)
const workspace = inject(WorkspaceKey)
const currentBackend = inject(CurrentBackendKey)
</script>
