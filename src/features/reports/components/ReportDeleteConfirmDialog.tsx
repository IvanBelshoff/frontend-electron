import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'

type ReportDeleteConfirmDialogProps = {
  isOpen: boolean
  reportName: string
  isDeleting: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

export default function ReportDeleteConfirmDialog({
  isOpen,
  reportName,
  isDeleting,
  error,
  onConfirm,
  onCancel,
}: ReportDeleteConfirmDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      title="Confirmar exclusão"
      onClose={isDeleting ? () => {} : onCancel}
      closeAriaLabel="Cancelar exclusão"
    >
      <div className="space-y-4">
        <p className="text-sm text-vscode-text">
          Confirma a exclusão do relatório <strong>{reportName}</strong>?
        </p>
        <p className="text-sm text-vscode-text-muted">Esta ação não pode ser desfeita.</p>

        {error && <Alert variant="error">{error}</Alert>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-vscode-border pt-4">
          <Button type="button" variant="secondary" disabled={isDeleting} onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            loading={isDeleting}
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-500"
          >
            Excluir
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
