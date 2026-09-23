<template>
  <section class="page page-knowledge">
    <div class="page-heading"><div class="heading-copy"><span class="kicker">Knowledge operations</span><h1>知识库</h1><p>搜索、补充和维护客服 Agent 使用的知识片段。</p></div><div class="count-display"><strong>{{ knowledgeCount }}</strong><span>chunks</span></div></div>
    <div class="knowledge-layout">
      <section class="workspace-card search-workspace">
        <div class="card-heading"><div><span class="kicker">Retrieval</span><h2>检索知识</h2></div><code>POST /search</code></div>
        <div class="search-line"><input :value="searchQuery" placeholder="例如：退款多久到账" @input="$emit('update:searchQuery', $event.target.value)" @keydown.enter="$emit('search')" /><button @click="$emit('search')" :disabled="busy || !searchQuery.trim()">搜索</button></div>
        <div v-if="searchResults.length" class="result-list"><article v-for="(item, index) in searchResults" :key="item.id || item.title || index" class="result-item"><span class="result-number">{{ String(index + 1).padStart(2, '0') }}</span><div><div class="result-title"><strong>{{ item.title || '未命名文档' }}</strong><small>score {{ item.score ?? '-' }}</small></div><p>{{ item.content }}</p></div></article></div>
        <div v-else class="workspace-empty">输入客户问题开始搜索。</div>
      </section>
      <section class="workspace-card import-workspace"><div class="card-heading"><div><span class="kicker">Ingestion</span><h2>添加知识</h2></div><code>ChromaDB</code></div><label><span>标题</span><input :value="docTitle" placeholder="退款补充政策" @input="$emit('update:docTitle', $event.target.value)" /></label><label><span>内容</span><textarea :value="docContent" rows="7" placeholder="输入客服规范、产品说明或排障流程" @input="$emit('update:docContent', $event.target.value)"></textarea></label><div class="side-actions"><button @click="$emit('submit')" :disabled="busy || !docTitle.trim() || !docContent.trim()">添加文档</button><label class="upload-button">上传文件<input type="file" accept=".txt,.md,.json" @change="$emit('upload', $event)" /></label></div></section>
    </div>
    <section class="workspace-card skills-workspace"><div class="card-heading"><div><span class="kicker">Loaded skills</span><h2>已加载能力</h2></div><button class="link-button" @click="$emit('reload-skills')">重新加载</button></div><div class="skill-table"><div v-for="skill in skillsData.skills" :key="skill.name" class="skill-item"><span class="skill-dot"></span><strong>{{ skill.name }}</strong><span>{{ skill.description || '业务规范能力' }}</span><small>{{ skill.content_chars || 0 }} chars</small></div><div v-if="!skillsData.skills.length" class="workspace-empty">暂无已加载 Skill。</div></div></section>
  </section>
</template>
<script setup>
defineProps({ knowledgeCount: [String, Number], searchQuery: String, searchResults: Array, docTitle: String, docContent: String, skillsData: Object, busy: Boolean })
defineEmits(['search', 'submit', 'upload', 'reload-skills', 'update:searchQuery', 'update:docTitle', 'update:docContent'])
</script>
