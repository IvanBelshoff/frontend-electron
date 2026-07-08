import { useQuery } from '@tanstack/react-query'
import SettingsField from '@/components/settings/SettingsField'
import SettingsSelect from '@/components/settings/SettingsSelect'
import { listConnections } from '@/features/connections/connection-api'
import { queryKeys } from '@/lib/query-keys'

type ConnectionSelectProps = {
  value: number | null
  onChange: (idConexao: number | null) => void
  disabled?: boolean
  hasError?: boolean
  htmlFor?: string
  label?: string
  hint?: string
}

export default function ConnectionSelect({
  value,
  onChange,
  disabled = false,
  hasError = false,
  htmlFor = 'reportConnectionSelect',
  label = 'Conexão',
  hint,
}: ConnectionSelectProps) {
  const connectionsQuery = useQuery({
    queryKey: queryKeys.connection.list({ limit: 200 }),
    queryFn: () => listConnections({ limit: 200 }),
  })

  const isLoading = connectionsQuery.isLoading
  const connections = connectionsQuery.data?.items ?? []

  return (
    <SettingsField label={label} htmlFor={htmlFor} hint={hint}>
      <SettingsSelect
        id={htmlFor}
        value={value ?? ''}
        disabled={disabled || isLoading}
        className={hasError ? 'border-vscode-error focus:ring-vscode-error/30' : undefined}
        onChange={(event) => {
          const nextValue = event.target.value
          onChange(nextValue ? Number(nextValue) : null)
        }}
      >
        <option value="">
          {isLoading ? 'Carregando conexões...' : 'Selecione uma conexão'}
        </option>
        {connections.map((connection) => (
          <option key={connection.id} value={connection.id}>
            {connection.nome} ({connection.tipo})
          </option>
        ))}
      </SettingsSelect>
    </SettingsField>
  )
}
