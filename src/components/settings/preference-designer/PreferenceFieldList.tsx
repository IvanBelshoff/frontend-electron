import type { PreferenceFieldConfig } from '@/components/settings/preference-designer/preference-field.types'
import PreferenceFieldRenderer from '@/components/settings/preference-designer/PreferenceFieldRenderer'

type PreferenceFieldListProps = {
  fields: PreferenceFieldConfig[]
  value: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
}

export default function PreferenceFieldList({
  fields,
  value,
  onChange,
}: PreferenceFieldListProps) {
  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <PreferenceFieldRenderer
          key={'key' in field ? field.key : field.id}
          field={field}
          value={value}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
