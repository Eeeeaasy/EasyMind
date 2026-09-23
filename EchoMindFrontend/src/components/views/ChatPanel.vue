<template>
  <section class="chat-panel">
    <header class="chat-header">
      <div class="chat-header-left">
        <div class="chat-title">对话</div>
        <div class="chat-subtitle">{{ currentBackend.label }} · {{ chat.busy.value ? '生成中' : backendStatus.healthLabel.value }}</div>
      </div>
      <div class="chat-header-actions">
        <button type="button" class="ghost" @click="chat.clearMessages" :disabled="chat.busy.value || chat.messages.value.length === 0">清空</button>
      </div>
    </header>

    <div class="messages" ref="messageListEl" @click="markdown.onContainerClick">
      <div class="messages-inner">
        <article v-for="item in chat.messages.value" :key="item.id" :class="['chat-item', item.role]">
          <div :class="['avatar', item.role]" aria-hidden="true">
            <span v-if="item.role === 'assistant'">E</span>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" fill="none" stroke="currentColor" stroke-width="1.6" />
              <path d="M4.5 20a7.5 7.5 0 0 1 15 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </div>

          <div class="chat-bubble-wrap">
            <div class="chat-role">{{ item.role === 'assistant' ? 'AI' : '你' }}</div>

            <div v-if="item.role === 'assistant'" class="chat-bubble markdown" v-html="markdown.renderMarkdown(item.content)"></div>
            <div v-else class="chat-bubble plain">{{ item.content }}</div>

            <div v-if="item.role === 'assistant'" class="chat-actions" aria-label="消息操作">
              <button type="button" class="icon-mini" title="复制" aria-label="复制" @click="chat.copyText(item.content)">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 9h10v10H9z" fill="none" stroke="currentColor" stroke-width="1.6" />
                  <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                </svg>
              </button>

              <button
                v-if="chat.isLastAssistant(item)"
                type="button"
                class="icon-mini"
                title="重新生成"
                aria-label="重新生成"
                @click="chat.regenerateLastAssistant"
                :disabled="chat.busy.value"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 12a8 8 0 1 1-2.34-5.66" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  <path d="M20 4v6h-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>

            <div v-if="item.meta" class="chat-meta">{{ item.meta }}</div>
          </div>
        </article>

        <div v-if="chat.busy.value" class="typing-row" aria-live="polite">
          <div class="avatar assistant" aria-hidden="true">E</div>
          <div class="typing-bubble">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
        </div>

        <div v-if="chat.messages.value.length === 0 && !chat.busy.value" class="empty-state">
          <h3>开始一次对话</h3>
          <p>支持多轮上下文；左侧可切换调试 / RAG 检索 / 知识库。</p>
          <div class="suggestions">
            <button type="button" class="chip" @click="chat.applySuggestion('退款多久到账？')">退款多久到账？</button>
            <button type="button" class="chip" @click="chat.applySuggestion('我想取消订单，怎么操作？')">取消订单怎么操作？</button>
            <button type="button" class="chip" @click="chat.applySuggestion('订单号 #12345 能查一下状态吗？')">查订单状态</button>
          </div>
        </div>
      </div>
    </div>

    <form class="composer" @submit.prevent="chat.sendMessage">
      <div class="composer-inner">
        <textarea
          ref="composerEl"
          v-model="chat.draft.value"
          rows="1"
          placeholder="输入问题…"
          @input="chat.autosizeTextarea"
        ></textarea>
        <button class="send" :disabled="chat.busy.value || !chat.draft.value.trim()" aria-label="发送">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5l0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <path d="M7 10l5-5 5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { inject, nextTick, onMounted, ref } from 'vue'
import { BackendStatusKey, ChatKey, CurrentBackendKey, MarkdownKey } from '../../keys'

const chat = inject(ChatKey)
const markdown = inject(MarkdownKey)
const backendStatus = inject(BackendStatusKey)
const currentBackend = inject(CurrentBackendKey)

// bind DOM refs into composable, so it can autosize/scroll like original.
const messageListEl = ref(null)
const composerEl = ref(null)

onMounted(async () => {
  chat.messageList.value = messageListEl.value
  chat.composerTextarea.value = composerEl.value
  await nextTick()
  chat.autosizeTextarea()
})
</script>
