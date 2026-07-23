import { useMemo } from 'react'
import DataGridStylePreview from '@/components/settings/preference-designer/DataGridStylePreview'
import PreferenceFieldList from '@/components/settings/preference-designer/PreferenceFieldList'
import { writeDataGridStylePreference } from '@/features/settings/data-grid-style-preferences'
import { createTableStyleSettingFields } from '@/features/settings/table-style-fields'
import { useUserPreferences } from '@/features/settings/use-user-preferences'

export default function PersonalizacaoTabelasTab() {
  const preferences = useUserPreferences()

  const fields = useMemo(() => createTableStyleSettingFields(), [])

  const handleChange = (patch: Record<string, unknown>) => {
    writeDataGridStylePreference(patch as Partial<typeof preferences.dataGridStyle>)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0">
        <PreferenceFieldList
          fields={fields}
          value={preferences.dataGridStyle as Record<string, unknown>}
          onChange={handleChange}
        />
      </div>
      <DataGridStylePreview style={preferences.dataGridStyle} />
    </div>
  )
}
