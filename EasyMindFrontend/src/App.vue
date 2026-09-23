<template>
  <main :class="['app-shell', `app-shell-${activeView}`, `theme-${theme}`]">
    <TopBar
      :active-view="activeView"
      :theme="theme"
      :health-ok="healthOk"
      :current-backend="currentBackend"
      :docs-url="docsUrl"
      :user-initial="userInitial"
      @navigate="activeView = $event"
      @toggle-theme="toggleTheme"
    />
    <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    <ModernChat
      v-if="activeView === 'chat'"
      :settings="settings"
      :current-backend="currentBackend"
      :messages="messages"
      v-model:draft="draft"
      :busy="busy"
      :health-ok="healthOk"
      :health-label="healthLabel"
      :last-response="lastResponse"
      :total-requests="totalRequests"
      :agent-count="agentCount"
      :active-alerts="activeAlerts"
      :format-percent="formatPercent"
      :format-json="formatJson"
      @clear="clearConversation"
      @prompt="usePrompt"
      @send="sendMessage"
      @persist="persist"
      @check-health="checkHealth"
      @refresh="refreshConsole"
      @refresh-monitor="loadMonitor"
    />
    <ModernKnowledge
      v-else-if="activeView === 'knowledge'"
      :knowledge-count="knowledgeCount"
      v-model:search-query="searchQuery"
      :search-results="searchResults"
      v-model:doc-title="docTitle"
      v-model:doc-content="docContent"
      :skills-data="skillsData"
      :busy="busy"
      @search="searchKnowledge"
      @submit="submitKnowledge"
      @upload="handleUpload"
      @reload-skills="reloadSkillSet"
    />
    <ModernEvaluation
      v-else-if="activeView === 'evaluation'"
      :eval-data="evalData"
      :busy="busy"
      :format-percent="formatPercent"
      @run="runEvaluation"
    />
    <ModernDebug
      v-else-if="activeView === 'debug'"
      :settings="settings"
      :health-ok="healthOk"
      :health-label="healthLabel"
      :status-text="statusText"
      @persist="persist"
      @check-health="checkHealth"
      @refresh="refreshConsole"
    />
    <ModernMonitor
      v-else
      :monitor-data="monitorData"
      :busy="busy"
      @refresh="loadMonitor"
    />
  </main>
</template>

<script setup>
import {
  computed,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import TopBar from "./components/app/TopBar.vue";
import ModernChat from "./components/views/ModernChat.vue";
import ModernKnowledge from "./components/views/ModernKnowledge.vue";
import ModernEvaluation from "./components/views/ModernEvaluation.vue";
import ModernDebug from "./components/views/ModernDebug.vue";
import ModernMonitor from "./components/views/ModernMonitor.vue";
import {
  addKnowledge,
  backendMeta,
  createInitialSettings,
  reloadSkills,
  requestChat,
  requestHealth,
  requestKnowledgeStats,
  requestMonitor,
  requestSearch,
  requestToolTrace,
  requestSkills,
  runEvaluation as requestEvaluation,
  saveSettings,
  uploadKnowledge,
} from "./lib/backends";

const settings = reactive(createInitialSettings());
const activeView = ref("chat");
const theme = ref( localStorage.getItem("easymind-theme") === "light" ? "light" : "dark");
const messages = ref([]);
const draft = ref("");
const busy = ref(false);
const healthOk = ref(false);
const healthLabel = ref("未检查");
const statusText = ref("");
const knowledgeCount = ref("-");
const searchQuery = ref("退款多久能到账");
const searchResults = ref([]);
const docTitle = ref("退款补充政策");
const docContent = ref("大促期间退款审核时间可能延长到 3-5 个工作日。");
const monitorData = ref({
  agent_stats: {},
  tool_stats: {},
  active_alerts: [],
  suggestions: [],
});
const skillsData = ref({ count: 0, skills: [], errors: [] });
const lastResponse = ref(null);
const lastTrace = ref(null);
const evalData = ref(null);
const toast = ref("");
let toastTimer;
let messageSequence = 0;

const currentBackend = computed(() => backendMeta(settings.backend, settings));
const docsUrl = computed(() => `${currentBackend.value.baseUrl}/docs`);
const userInitial = computed(() =>  (settings.userId || "U").slice(0, 1).toUpperCase());
const activeAlerts = computed(() => monitorData.value.active_alerts || []);
const agentCount = computed(  () => Object.keys(monitorData.value.agent_stats || {}).length);
const totalRequests = computed(() =>
  Object.values(monitorData.value.agent_stats || {}).reduce(
    (sum, item) => sum + Number(item.total || 0),
    0,
  ),
);

watch(() => settings.conversationId, persist);
onMounted(refreshConsole);

function persist() {
  saveSettings(settings);
}
function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  localStorage.setItem("easymind-theme", theme.value);
}
async function refreshConsole() {
  await Promise.allSettled([
    checkHealth(),
    loadStats(),
    loadMonitor(),
    loadSkills(),
  ]);
}

async function checkHealth() {
  try {
    const data = await requestHealth(settings.backend, settings);
    healthOk.value = data.status === "ok";
    healthLabel.value = data.status || "ok";
    statusText.value = JSON.stringify(data, null, 2);
  } catch (error) {
    healthOk.value = false;
    healthLabel.value = "不可用";
    statusText.value = error.message;
  }
}
async function loadStats() {
  try {
    const data = await requestKnowledgeStats(settings.backend, settings);
    knowledgeCount.value = data.total_chunks ?? data.totalChunks ?? "-";
  } catch {
    knowledgeCount.value = "-";
  }
}
async function loadMonitor() {
  try {
    monitorData.value = await requestMonitor(settings.backend, settings);
  } catch {
    monitorData.value = {
      agent_stats: {},
      tool_stats: {},
      active_alerts: [],
      suggestions: [],
    };
  }
}
async function loadSkills() {
  try {
    skillsData.value = await requestSkills(settings.backend, settings);
  } catch {
    skillsData.value = { count: 0, skills: [], errors: [] };
  }
}
async function reloadSkillSet() {
  busy.value = true;
  try {
    skillsData.value = await reloadSkills(settings.backend, settings);
    showToast("Skills 已重新加载");
  } catch (error) {
    statusText.value = error.message;
    showToast("Skills 加载失败");
  } finally {
    busy.value = false;
  }
}

async function sendMessage() {
  const content = draft.value.trim();
  if (!content || busy.value) return;
  messages.value.push({ id: createMessageId(), role: "user", content });
  draft.value = "";
  busy.value = true;
  try {
    const response = await requestChat(settings.backend, settings, content);
    if (response.conversationId && !settings.conversationId) {
      settings.conversationId = response.conversationId;
      persist();
    }
    lastResponse.value = response;
    lastTrace.value = await loadToolTrace(response.requestId);
    messages.value.push({
      id: createMessageId(),
      role: "assistant",
      content: response.response,
      meta: [
        response.intent,
        response.primaryAgent || response.agentType,
        response.knowledgeUsed ? "RAG" : "",
        response.escalated ? "转人工" : "",
      ]
        .filter(Boolean)
        .join(" · "),
    });
    await loadMonitor();
  } catch (error) {
    messages.value.push({
      id: createMessageId(),
      role: "assistant",
      content: error.message,
      meta: "请求失败",
    });
  } finally {
    busy.value = false;
  }
}
function usePrompt(prompt) {
  draft.value = prompt;
}
function clearConversation() {
  messages.value = [];
  lastResponse.value = null;
  lastTrace.value = null;
  settings.conversationId = "";
  persist();
}
async function searchKnowledge() {
  busy.value = true;
  try {
    const data = await requestSearch(
      settings.backend,
      settings,
      searchQuery.value,
      5,
    );
    searchResults.value = data.results || [];
    showToast(`检索完成，返回 ${searchResults.value.length} 条结果`);
  } catch (error) {
    statusText.value = error.message;
    showToast("检索失败，请检查连接");
  } finally {
    busy.value = false;
  }
}
async function submitKnowledge() {
  busy.value = true;
  try {
    const data = await addKnowledge(settings.backend, settings, [
      { title: docTitle.value.trim(), content: docContent.value.trim() },
    ]);
    statusText.value = JSON.stringify(data, null, 2);
    await loadStats();
    showToast("文档已添加");
  } catch (error) {
    statusText.value = error.message;
    showToast("文档导入失败");
  } finally {
    busy.value = false;
  }
}
async function handleUpload(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  busy.value = true;
  try {
    const data = await uploadKnowledge(settings.backend, settings, file);
    statusText.value = JSON.stringify(data, null, 2);
    await loadStats();
    showToast(`${file.name} 导入成功`);
  } catch (error) {
    statusText.value = error.message;
    showToast("文件导入失败");
  } finally {
    busy.value = false;
  }
}
async function runEvaluation() {
  busy.value = true;
  try {
    evalData.value = await requestEvaluation(settings.backend, settings);
    showToast("评测完成");
  } catch (error) {
    statusText.value = error.message;
    showToast("评测运行失败");
  } finally {
    busy.value = false;
  }
}
async function loadToolTrace(requestId) {
  try {
    return await requestToolTrace(settings.backend, settings, requestId);
  } catch {
    return null;
  }
}
function formatPercent(value) {
  const number = Number(value || 0);
  return `${(number <= 1 ? number * 100 : number).toFixed(1)}%`;
}
function formatJson(value) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return String(value ?? "");
  }
}
function createMessageId() {
  messageSequence += 1;
  return `message-${Date.now()}-${messageSequence}`;
}
function showToast(message) {
  toast.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = "";
  }, 2600);
}
</script>
