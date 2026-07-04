import DashboardCreateHeader from '@/features/dashboards/components/DashboardCreateHeader'
import DashboardEditForm from '@/features/dashboards/components/DashboardEditForm'
import { useDashboardCreateState } from '@/features/dashboards/hooks/use-dashboard-create-state'

export default function CriarDashboardPage() {
  const { draft, updateDraft, fieldErrors, saveToList, saveAndEdit, isSaving } =
    useDashboardCreateState()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
        <DashboardCreateHeader />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-4">
        <DashboardEditForm
          mode="create"
          draft={draft}
          defaultIcon="insert_chart"
          updateDraft={updateDraft}
          fieldErrors={fieldErrors}
          isSaving={isSaving}
          onSaveToList={saveToList}
          onSaveAndEdit={saveAndEdit}
        />
      </div>
    </div>
  )
}
