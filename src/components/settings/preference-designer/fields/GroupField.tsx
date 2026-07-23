import clsx from 'clsx'
import PreferenceFieldRenderer from '@/components/settings/preference-designer/PreferenceFieldRenderer'
import type { PreferenceFieldConfig } from '@/components/settings/preference-designer/preference-field.types'

type GroupFieldProps = {
  field: Extract<PreferenceFieldConfig, { kind: 'group' }>
  value: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
}

const gridColumnsClass: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
}

export default function GroupField({ field, value, onChange }: GroupFieldProps) {
  const isGrid = field.layout === 'grid'
  const columns = field.columns ?? 2

  return (
    <div
      className={clsx(
        isGrid ? clsx('grid gap-4', gridColumnsClass[columns]) : 'space-y-5',
      )}
    >
      {field.children.map((child) => (
        <PreferenceFieldRenderer
          key={'key' in child ? child.key : child.id}
          field={child}
          value={value}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
