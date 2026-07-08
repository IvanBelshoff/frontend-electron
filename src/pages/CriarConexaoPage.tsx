import { Link } from '@tanstack/react-router'
import ConnectionForm from '@/features/connections/components/ConnectionForm'
import { useConnectionCreateState } from '@/features/connections/hooks/use-connection-create-state'

export default function CriarConexaoPage() {
  const { draft, updateDraft, fieldErrors, saveToList, saveAndEdit, isSaving } =
    useConnectionCreateState()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="min-w-0 text-sm text-vscode-text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/conexoes" className="transition-colors hover:text-vscode-text">
                  Gerenciamento de Conexões
                </Link>
              </li>
              <li aria-hidden="true" className="text-vscode-text-muted">
                /
              </li>
              <li className="truncate font-medium text-vscode-text" aria-current="page">
                Criar conexão
              </li>
            </ol>
          </nav>
        </header>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-4">
        <ConnectionForm
          mode="create"
          draft={draft}
          updateDraft={updateDraft}
          fieldErrors={fieldErrors}
          isSaving={isSaving}
          onSaveToList={() => void saveToList()}
          onSaveAndEdit={() => void saveAndEdit()}
        />
      </div>
    </div>
  )
}
