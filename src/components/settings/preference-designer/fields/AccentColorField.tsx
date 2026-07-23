import AccentColorPicker from '@/components/settings/AccentColorPicker'
import SettingsField from '@/components/settings/SettingsField'

type AccentColorFieldProps = {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
}

export default function AccentColorField({ label, hint, value, onChange }: AccentColorFieldProps) {
  return (
    <SettingsField label={label} hint={hint}>
      <AccentColorPicker value={value} onChange={onChange} />
    </SettingsField>
  )
}
