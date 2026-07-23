import PreferenceFieldRenderer from '@/components/settings/preference-designer/PreferenceFieldRenderer'
import type { PreferenceFieldConfig } from '@/components/settings/preference-designer/preference-field.types'
import ToggleField from '@/components/settings/preference-designer/fields/ToggleField'

type ConditionalGroupFieldProps = {
  field: Extract<PreferenceFieldConfig, { kind: 'conditional' }>
  value: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
}

function getDisplayValue(
  value: Record<string, unknown>,
  enabled: boolean,
  children: PreferenceFieldConfig[],
): Record<string, unknown> {
  if (enabled) {
    return value
  }

  const patched = { ...value }

  for (const child of children) {
    if (child.kind === 'segmented' && patched[child.key] === 'none') {
      patched[child.key] = child.options[0]?.value ?? 'header'
    }
  }

  return patched
}

export default function ConditionalGroupField({
  field,
  value,
  onChange,
}: ConditionalGroupFieldProps) {
  const enabled = field.isEnabled(value)
  const layout = field.layout ?? 'stacked'
  const showChildrenWhenDisabled = field.showChildrenWhenDisabled ?? false
  const displayValue = getDisplayValue(value, enabled, field.children)

  const children = field.children.map((child) => (
    <PreferenceFieldRenderer
      key={'key' in child ? child.key : child.id}
      field={child}
      value={displayValue}
      onChange={enabled ? onChange : () => {}}
      disabled={!enabled}
    />
  ))

  if (layout === 'inline') {
    return (
      <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-2">
        <ToggleField
          label={field.label}
          hint={field.hint}
          value={enabled}
          onChange={(next) => onChange(next ? field.onEnable() : field.onDisable())}
        />

        {showChildrenWhenDisabled || enabled ? <div>{children}</div> : null}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ToggleField
        label={field.label}
        hint={field.hint}
        value={enabled}
        onChange={(next) => onChange(next ? field.onEnable() : field.onDisable())}
      />

      {enabled ? (
        <div className="space-y-4 border-l-2 border-vscode-accent/30 pl-4">{children}</div>
      ) : null}
    </div>
  )
}
