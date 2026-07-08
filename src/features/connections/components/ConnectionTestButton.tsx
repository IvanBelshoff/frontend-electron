import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import { testConnection } from '@/features/connections/connection-api'

type ConnectionTestButtonProps = {
  connectionId: number
}

export default function ConnectionTestButton({ connectionId }: ConnectionTestButtonProps) {
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null)

  const testMutation = useMutation({
    mutationFn: () => testConnection(connectionId),
    onSuccess: (result) => {
      setResultSuccess(result.sucesso)
      setResultMessage(result.mensagem)
    },
    onError: (error) => {
      setResultSuccess(false)
      setResultMessage(
        error instanceof Error ? error.message : 'Não foi possível testar a conexão.',
      )
    },
  })

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="secondary"
        loading={testMutation.isPending}
        onClick={() => {
          setResultMessage(null)
          setResultSuccess(null)
          void testMutation.mutateAsync()
        }}
      >
        Testar conexão
      </Button>

      {resultSuccess === true && resultMessage && (
        <Alert variant="success">{resultMessage}</Alert>
      )}

      {resultSuccess === false && resultMessage && (
        <Alert variant="error">{resultMessage}</Alert>
      )}
    </div>
  )
}
