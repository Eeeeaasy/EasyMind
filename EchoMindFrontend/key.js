// Centralized injection keys for app-wide state.
// Using Symbols avoids accidental collisions.

export const SettingsKey = Symbol('Settings')
export const PersistSettingsKey = Symbol('PersistSettings')
export const SwitchBackendKey = Symbol('SwitchBackend')
export const CurrentBackendKey = Symbol('CurrentBackend')
export const DocsUrlKey = Symbol('DocsUrl')


export const WorkspaceKey = Symbol('Workspace')
export const BackendStatusKey = Symbol('BackendStatus')

export const MarkdownKey = Symbol('Markdown')
export const ChatKey = Symbol('Chat')
export const RagKey = Symbol('Rag')
export const KnowledgeKey = Symbol('Knowledge')
export const MonitorKey = Symbol('Monitor')
export const EvalKey = Symbol('Eval')
