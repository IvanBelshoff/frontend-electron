import type { ReactNode } from 'react'
import Alert from '@/components/ui/Alert'
import { useAiAccess } from '@/features/ai/hooks/use-ai-access'

type AiAccessGateProps = {
  children: ReactNode
}

export default function AiAccessGate({ children }: AiAccessGateProps) {
  const { access, isLoading, isEligible } = useAiAccess()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-vscode-text-muted">
        Verificando elegibilidade para IA...
      </div>
    )
  }

  if (!isEligible) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Alert variant="info" className="max-w-xl">
          {access?.reason ??
            'Você não possui acesso ao assistente de IA. Solicite a permissão e a habilitação de conhecimento em ao menos um relatório.'}
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
