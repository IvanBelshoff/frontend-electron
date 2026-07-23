import SettingsField from '@/components/settings/SettingsField'
import SettingsSegmentedControl from '@/components/settings/SettingsSegmentedControl'
import type { SegmentedOption } from '@/components/settings/SettingsSegmentedControl'

type SegmentedFieldProps<T extends string> = {
  label: string
  hint?: string
  ariaLabel: string
  value: T
  options: SegmentedOption<T>[]
  columns?: 2 | 3
  disabled?: boolean
  onChange: (value: T) => void
}

export default function SegmentedField<T extends string>({
  label,
  hint,
  ariaLabel,
  value,
  options,
  columns = 3,
  disabled = false,
  onChange,
}: SegmentedFieldProps<T>) {
  return (
    <SettingsField label={label} hint={hint}>
      <div className={columns === 2 ? '[&_[role=group]]:grid-cols-2' : undefined}>
        <SettingsSegmentedControl
          ariaLabel={ariaLabel}
          value={value}
          options={options}
          disabled={disabled}
          onChange={onChange}
        />
      </div>
    </SettingsField>
  )
}
