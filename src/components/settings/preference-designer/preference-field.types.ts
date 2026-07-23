import type { ReactNode } from 'react'
import type { SegmentedOption } from '@/components/settings/SettingsSegmentedControl'

export type PreferenceFieldConfig =
  | {
      kind: 'segmented'
      key: string
      label: string
      hint?: string
      ariaLabel: string
      options: SegmentedOption<string>[]
      columns?: 2 | 3
    }
  | {
      kind: 'toggle'
      key: string
      label: string
      hint?: string
    }
  | {
      kind: 'conditional'
      label: string
      hint?: string
      layout?: 'stacked' | 'inline'
      showChildrenWhenDisabled?: boolean
      isEnabled: (value: Record<string, unknown>) => boolean
      onEnable: () => Record<string, unknown>
      onDisable: () => Record<string, unknown>
      children: PreferenceFieldConfig[]
    }
  | {
      kind: 'accentColor'
      key: string
      label: string
      hint?: string
    }
  | {
      kind: 'group'
      id: string
      layout?: 'vertical' | 'grid'
      columns?: 2 | 3 | 4
      children: PreferenceFieldConfig[]
    }
  | {
      kind: 'custom'
      id: string
      render: () => ReactNode
    }

export type PreferenceSectionConfig = {
  id: string
  title: string
  fields: PreferenceFieldConfig[]
}
