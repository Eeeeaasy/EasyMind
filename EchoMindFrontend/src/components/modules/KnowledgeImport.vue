<template>
  <section class="brand">
    <div class="brand-mark">EM</div>
    <div>
      <h1>EasyMind 知识库</h1>
    </div>
  </section>

  <br />

  <article class="tool-panel">
    <div class="panel-heading">
      <h2>导入知识</h2>
      <span class="pill soft">Docs</span>
    </div>

    <label>
      <span>标题</span>
      <input v-model="knowledge.docTitle.value" placeholder="退款补充政策" />
    </label>

    <label>
      <span>内容</span>
      <textarea v-model="knowledge.docContent.value" rows="5" placeholder="输入知识库内容"></textarea>
    </label>

    <div class="actions">
      <button @click="onSubmit" :disabled="busy || !knowledge.docTitle.value.trim() || !knowledge.docContent.value.trim()">添加文档</button>

      <label class="file-button">
        上传文件
        <input type="file" accept=".txt,.md,.json" @change="handleUpload" />
      </label>

      <button @click="openKnowledgeDetails" :disabled="knowledge.kbListBusy.value">查看知识库</button>
      <button @click="workspace.selectWorkspace('chat')">返回对话</button>
    </div>

    <pre v-if="backendStatus.statusText.value">{{ backendStatus.statusText.value }}</pre>
  </article>
</template>

<script setup>
import { inject, ref } from 'vue'
import { BackendStatusKey, KnowledgeKey, WorkspaceKey } from '../../keys'

const backendStatus = inject(BackendStatusKey)
const knowledge = inject(KnowledgeKey)
const workspace = inject(WorkspaceKey)

const busy = ref(false)

async function onSubmit() {
  busy.value = true
  try {
    const data = await knowledge.submitKnowledge()
    backendStatus.statusText.value = JSON.stringify(data, null, 2)
    await backendStatus.loadStats()
  } catch (error) {
    backendStatus.statusText.value = error?.message ?? String(error)
  } finally {
    busy.value = false
  }
}

async function handleUpload(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  busy.value = true
  try {
    const data = await knowledge.uploadFile(file)
    backendStatus.statusText.value = JSON.stringify(data, null, 2)
    await backendStatus.loadStats()
  } catch (error) {
    backendStatus.statusText.value = error?.message ?? String(error)
  } finally {
    busy.value = false
  }
}

async function openKnowledgeDetails() {
  await knowledge.loadKnowledgeList({ reset: true })
  workspace.selectWorkspace('kb')
}
</script>
