import { onMounted } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function useMarkdown({ onCopyText } = {}) {
  function setupMarked() {
    const renderer = new marked.Renderer()
    renderer.code = (code, infostring) => {
      const tokenMode = typeof code === 'object' && code !== null
      const text = tokenMode ? (code.text ?? '') : (code ?? '')
      const langRaw = tokenMode ? (code.lang ?? '') : (infostring ?? '')
      const lang = String(langRaw || '').trim().split(/\s+/)[0]
      const safeLang = lang.replace(/[^a-z0-9_-]/gi, '')

      const escaped = escapeHtml(text)
      const codeHtml = `<pre><code${safeLang ? ` class=\"language-${safeLang}\"` : ''}>${escaped}</code></pre>`

      return `
        <div class=\"md-codeblock\" data-lang=\"${safeLang}\">
          <div class=\"md-codebar\">
            <span class=\"md-lang\">${safeLang || 'code'}</span>
            <button type=\"button\" class=\"md-copy\" data-action=\"copy-code\">复制代码</button>
          </div>
          ${codeHtml}
        </div>
      `
    }

    marked.setOptions({ gfm: true, breaks: true, renderer })
  }

  function renderMarkdown(text) {
    const raw = marked.parse(text ?? '')
    return DOMPurify.sanitize(raw, {
      ADD_TAGS: ['button'],
      ADD_ATTR: ['data-action', 'data-lang', 'class']
    })
  }

  async function defaultCopy(text) {
    await navigator.clipboard.writeText(text ?? '')
  }

  async function onContainerClick(event) {
    const target = event?.target
    if (!(target instanceof Element)) return

    const copyBtn = target.closest('button[data-action="copy-code"]')
    if (!copyBtn) return

    const block = copyBtn.closest('.md-codeblock')
    const codeEl = block?.querySelector('pre code')
    const code = codeEl?.textContent ?? ''

    try {
      if (typeof onCopyText === 'function') await onCopyText(code)
      else await defaultCopy(code)
    } catch {
      // Let caller decide whether to surface error.
    }
  }

  onMounted(() => {
    setupMarked()
  })

  return { renderMarkdown, onContainerClick }
}
