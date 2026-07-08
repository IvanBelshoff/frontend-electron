import ReportCreateHeader from '@/features/reports/components/ReportCreateHeader'
import ReportEditForm from '@/features/reports/components/ReportEditForm'
import { useReportCreateState } from '@/features/reports/hooks/use-report-create-state'

export default function CriarRelatorioPage() {
  const { draft, updateDraft, fieldErrors, saveToList, saveAndEdit, isSaving } =
    useReportCreateState()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
        <ReportCreateHeader />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-4">
        <ReportEditForm
          mode="create"
          draft={draft}
          defaultIcon="table_chart"
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
