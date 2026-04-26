
export const PLAYLIST_ICON_OPTIONS = [
  { key: 'brain', emoji: '🧠', label: 'Brain' },
  { key: 'code', emoji: '💻', label: 'Code' },
  { key: 'workflow', emoji: '🧩', label: 'Workflow' },
  { key: 'terminal', emoji: '🖥️', label: 'Terminal' },
  { key: 'palette', emoji: '🎨', label: 'Palette' },
  { key: 'notebook', emoji: '📚', label: 'Notebook' },
  { key: 'git-branch', emoji: '🌿', label: 'Git Branch' },
  { key: 'server', emoji: '🗄️', label: 'Server' },
  { key: 'bot', emoji: '🤖', label: 'Bot' },
  { key: 'sparkles', emoji: '✨', label: 'Sparkles' },
  { key: 'cpu', emoji: '⚙️', label: 'CPU' },
  { key: 'shield', emoji: '🛡️', label: 'Shield' },
  { key: 'layers', emoji: '🧱', label: 'Layers' },
  { key: 'test', emoji: '🧪', label: 'Test'},
  { key: 'ai-frameworks', emoji: '🧬', label: 'AI Frameworks'},
  { key: 'cloud', emoji: '☁️', label: 'Cloud'},
  { key: 'devops', emoji: '🔧', label: 'DevOps & CI/CD'}
] as const

export type PlaylistIconKey = (typeof PLAYLIST_ICON_OPTIONS)[number]['key']

const PLAYLIST_ICON_KEYS = new Set<PlaylistIconKey>(
  PLAYLIST_ICON_OPTIONS.map((option) => option.key),
)

const EMOJI_TO_ICON_KEY = new Map<string, PlaylistIconKey>(
  PLAYLIST_ICON_OPTIONS.map((option) => [option.emoji, option.key]),
)

const LEGACY_ICON_KEY_ALIASES: Record<string, PlaylistIconKey> = {
  'ai-framewoks': 'ai-frameworks',
}

export function normalizePlaylistIconKey(icon: string | null | undefined): PlaylistIconKey {
  if (!icon) return 'layers'

  const normalizedIcon = icon.trim().toLowerCase()

  if (normalizedIcon in LEGACY_ICON_KEY_ALIASES) {
    return LEGACY_ICON_KEY_ALIASES[normalizedIcon]
  }

  if (PLAYLIST_ICON_KEYS.has(normalizedIcon as PlaylistIconKey)) {
    return normalizedIcon as PlaylistIconKey
  }

  return EMOJI_TO_ICON_KEY.get(icon) ?? 'layers'
}

export function getPlaylistIconEmoji(icon: string | null | undefined): string {
  const normalized = normalizePlaylistIconKey(icon)
  return PLAYLIST_ICON_OPTIONS.find((option) => option.key === normalized)?.emoji ?? '🧱'
}

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function getPlaylistHexColor(color: string | null | undefined): string | null {
  if (!color) return null

  const trimmedColor = color.trim()
  return HEX_COLOR_REGEX.test(trimmedColor) ? trimmedColor : null
}
