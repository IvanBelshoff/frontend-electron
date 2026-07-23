import AccentColorField from '@/components/settings/preference-designer/fields/AccentColorField'
import ConditionalGroupField from '@/components/settings/preference-designer/fields/ConditionalGroupField'
import GroupField from '@/components/settings/preference-designer/fields/GroupField'
import SegmentedField from '@/components/settings/preference-designer/fields/SegmentedField'
import ToggleField from '@/components/settings/preference-designer/fields/ToggleField'
import type { PreferenceFieldConfig } from '@/components/settings/preference-designer/preference-field.types'

type PreferenceFieldRendererProps = {
  field: PreferenceFieldConfig
  value: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
  disabled?: boolean
}

export default function PreferenceFieldRenderer({
  field,
  value,
  onChange,
  disabled = false,
}: PreferenceFieldRendererProps) {
  switch (field.kind) {
    case 'segmented':
      return (
        <SegmentedField
          label={field.label}
          hint={field.hint}
          ariaLabel={field.ariaLabel}
          value={String(value[field.key] ?? field.options[0]?.value)}
          options={field.options}
          columns={field.columns}
          disabled={disabled}
          onChange={(next) => onChange({ [field.key]: next })}
        />
      )

    case 'toggle':
      return (
        <ToggleField
          label={field.label}
          hint={field.hint}
          value={Boolean(value[field.key])}
          onChange={(next) => onChange({ [field.key]: next })}
        />
      )

    case 'conditional':
      return <ConditionalGroupField field={field} value={value} onChange={onChange} />

    case 'group':
      return <GroupField field={field} value={value} onChange={onChange} />

    case 'accentColor':
      return (
        <AccentColorField
          label={field.label}
          hint={field.hint}
          value={String(value[field.key] ?? '#0078D4')}
          onChange={(next) => onChange({ [field.key]: next })}
        />
      )

    case 'custom':
      return <>{field.render()}</>

    default:
      return null
  }
}
