import PreferenceFieldRenderer from '@/components/settings/preference-designer/PreferenceFieldRenderer'
import type { PreferenceSectionConfig } from '@/components/settings/preference-designer/preference-field.types'
import SettingsSubsection from '@/components/settings/SettingsSubsection'

type PreferenceDesignerProps = {
  sections: PreferenceSectionConfig[]
  value: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
}

export default function PreferenceDesigner({
  sections,
  value,
  onChange,
}: PreferenceDesignerProps) {
  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <SettingsSubsection key={section.id} title={section.title}>
          {section.fields.map((field) => (
            <PreferenceFieldRenderer
              key={'key' in field ? field.key : field.id}
              field={field}
              value={value}
              onChange={onChange}
            />
          ))}
        </SettingsSubsection>
      ))}
    </div>
  )
}
