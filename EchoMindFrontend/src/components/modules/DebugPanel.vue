<template>
  <section class="brand">
    <div class="brand-mark">EM</div>
    <div>
      <h1>EasyMind Console</h1>
      <p>统一调试 Python 与 Java 版本</p>
    </div>
  </section>

  <section class="panel">
    <div class="panel-heading">
      <h2>后端</h2>
      <span class="pill">{{ currentBackend.label }}</span>
    </div>

    <div class="segmented">
      <button :class="{ active: settings.backend === 'java' }" @click="switchBackend('java')">Java</button>
      <button :class="{ active: settings.backend === 'python' }" @click="switchBackend('python')">Python</button>
    </div>

    <label>
      <span>Java API</span>
      <input v-model="settings.endpoints.java" @change="persist" placeholder="/api/java" />
    </label>

    <label>
      <span>Python API</span>
      <input v-model="settings.endpoints.python" @change="persist" placeholder="/api/python" />
    </label>

    <label>
      <span>用户 ID</span>
      <input v-model="settings.userId" @change="persist" placeholder="u1001" />
    </label>

    <label>
      <span>会话 ID</span>
      <input v-model="settings.conversationId" @change="persist" placeholder="自动生成" />
    </label>

    <div class="actions">
      <button @click="backendStatus.checkHealth">健康检查</button>
      <button @click="backendStatus.loadStats">刷新状态</button>
    </div>
  </section>

  <section class="panel status-panel">
    <div class="panel-heading">
      <h2>状态</h2>
      <span :class="['status-dot', backendStatus.healthOk.value ? 'online' : 'offline']"></span>
    </div>

    <dl>
      <div>
        <dt>当前后端</dt>
        <dd>{{ currentBackend.label }}</dd>
      </div>
      <div>
        <dt>健康状态</dt>
        <dd :class="backendStatus.healthOk.value ? 'ok' : 'muted'">{{ backendStatus.healthLabel.value }}</dd>
      </div>
      <div>
        <dt>知识片段</dt>
        <dd>{{ backendStatus.knowledgeCount.value }}</dd>
      </div>
    </dl>

    <pre v-if="backendStatus.statusText.value">{{ backendStatus.statusText.value }}</pre>
  </section>
</template>

<script setup>
import { inject } from 'vue'
import { BackendStatusKey, CurrentBackendKey, PersistSettingsKey, SettingsKey, SwitchBackendKey } from '../../keys'

const settings = inject(SettingsKey)
const persist = inject(PersistSettingsKey)
const switchBackend = inject(SwitchBackendKey)
const backendStatus = inject(BackendStatusKey)
const currentBackend = inject(CurrentBackendKey)
</script>
