import type { AccentColorOption } from '@/features/settings/settings-types'

export const ACCENT_COLOR_PRESETS: AccentColorOption[] = [
  { id: 'blue', label: 'Azul', value: '#0078D4' },
  { id: 'purple', label: 'Roxo', value: '#8764B8' },
  { id: 'green', label: 'Verde', value: '#107C10' },
  { id: 'teal', label: 'Teal', value: '#008575' },
  { id: 'orange', label: 'Laranja', value: '#CA5010' },
  { id: 'red', label: 'Vermelho', value: '#D13438' },
  { id: 'pink', label: 'Rosa', value: '#E3008C' },
  { id: 'gold', label: 'Dourado', value: '#FFB900' },
  { id: 'slate', label: 'Cinza', value: '#69797E' },
]

export const DEFAULT_ACCENT_COLOR = ACCENT_COLOR_PRESETS[0].value
