import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import Alert from '@/components/ui/Alert'
import QueryEditorWorkspace from '@/features/query-editor/QueryEditorWorkspace'
import {
  clearQueryEditorSession,
  loadQueryEditorSession,
  saveQueryEditorResult,
} from '@/features/query-editor/query-editor-session'

type EditorAvancadoRelatorioPageProps = {
  relatorioId?: number
}

export default function EditorAvancadoRelatorioPage({
  relatorioId,
}: EditorAvancadoRelatorioPageProps) {
  const navigate = useNavigate()
  const [session] = useState(() => loadQueryEditorSession())

  const isValidSession = useMemo(() => {
    if (!session) {
      return false
    }

    if (relatorioId && session.relatorioId !== relatorioId) {
      return false
    }

    if (!relatorioId && session.relatorioId) {
      return false
    }

    return true
  }, [relatorioId, session])

  useEffect(() => {
    if (!isValidSession) {
      void navigate({ to: session?.returnPath ?? '/relatorios/gerenciar' })
    }
  }, [isValidSession, navigate, session?.returnPath])

  if (!session || !isValidSession) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Alert variant="error">Sessão do editor avançado inválida ou expirada.</Alert>
      </div>
    )
  }

  const handleApply = (query: string) => {
    saveQueryEditorResult({ query, parametros: session.parametros })
    clearQueryEditorSession()
    void navigate({ to: session.returnPath })
  }

  const handleCancel = () => {
    clearQueryEditorSession()
    void navigate({ to: session.returnPath })
  }

  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <QueryEditorWorkspace session={session} onApply={handleApply} onCancel={handleCancel} />
    </div>
  )
}
