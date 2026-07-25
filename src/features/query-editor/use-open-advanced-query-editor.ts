import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { ApiError } from '@/features/auth/auth-types'
import { testConnection } from '@/features/connections/connection-api'
import type { TipoConexao } from '@/features/connections/connection-types'
import { saveQueryEditorSession } from '@/features/query-editor/query-editor-session'
import type { ParametroRelatorio } from '@/features/reports/report-types'

type OpenAdvancedEditorParams = {
  query: string
  idConexao: number | null
  connectionTipo?: TipoConexao | null
  parametros?: ParametroRelatorio[]
  returnPath: string
  relatorioId?: number
}

export function useOpenAdvancedQueryEditor() {
  const navigate = useNavigate()
  const [isOpening, setIsOpening] = useState(false)
  const [openError, setOpenError] = useState<string | null>(null)

  const openAdvancedEditor = useCallback(
    async (params: OpenAdvancedEditorParams) => {
      setOpenError(null)

      if (params.idConexao == null) {
        setOpenError('Selecione uma conexão antes de abrir o editor avançado.')
        return false
      }

      setIsOpening(true)

      try {
        const testResult = await testConnection(params.idConexao)

        if (!testResult.sucesso) {
          setOpenError(testResult.mensagem)
          return false
        }

        saveQueryEditorSession({
          query: params.query,
          idConexao: params.idConexao,
          connectionTipo: params.connectionTipo ?? null,
          parametros: params.parametros ?? [],
          returnPath: params.returnPath,
          relatorioId: params.relatorioId,
        })

        if (params.relatorioId) {
          void navigate({
            to: '/relatorios/$relatorioId/editor-avancado',
            params: { relatorioId: String(params.relatorioId) },
          })
        } else {
          void navigate({ to: '/relatorios/editor-avancado' })
        }

        return true
      } catch (error) {
        setOpenError(
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Não foi possível verificar se a conexão está online.',
        )
        return false
      } finally {
        setIsOpening(false)
      }
    },
    [navigate],
  )

  return {
    openAdvancedEditor,
    isOpeningAdvancedEditor: isOpening,
    advancedEditorOpenError: openError,
    clearAdvancedEditorOpenError: () => setOpenError(null),
  }
}
