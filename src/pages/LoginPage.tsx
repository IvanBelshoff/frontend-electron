import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import IconButton from '@/components/ui/IconButton'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/ui/PasswordInput'
import Label from '@/components/ui/Label'
import SettingsIcon from '@/components/ui/SettingsIcon'
import { ApiError } from '@/features/auth/auth-types'
import { useAuth } from '@/features/auth/use-auth'
import AuthLayout from '@/layouts/AuthLayout'
import { getApiUrl, getDefaultApiUrl, normalizeBaseUrl, saveApiUrl, clearApiUrlOverride } from '@/lib/config'

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showBackendConfig, setShowBackendConfig] = useState(false)
  const [backendDraftUrl, setBackendDraftUrl] = useState(getApiUrl())
  const [backendConfigError, setBackendConfigError] = useState<string | null>(null)
  const [currentApiUrl, setCurrentApiUrl] = useState(getApiUrl())

  const mutation = useMutation({
    mutationFn: async () => {
      const trimmedEmail = email.trim()

      if (!validateEmail(trimmedEmail)) {
        throw new Error('Informe um e-mail válido.')
      }

      if (senha.length < 8) {
        throw new Error('A senha deve ter no mínimo 8 caracteres.')
      }

      await login(trimmedEmail, senha)
    },
    onSuccess: () => {
      void navigate({ to: '/' })
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationError(null)

    if (!validateEmail(email.trim())) {
      setValidationError('Informe um e-mail válido.')
      return
    }

    if (senha.length < 8) {
      setValidationError('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    mutation.mutate()
  }

  function handleOpenBackendConfig() {
    setBackendDraftUrl(currentApiUrl)
    setBackendConfigError(null)
    setShowBackendConfig(true)
  }

  function handleSaveBackendConfig() {
    try {
      const normalized = normalizeBaseUrl(backendDraftUrl)
      saveApiUrl(normalized)
      setCurrentApiUrl(normalized)
      setBackendConfigError(null)
      setShowBackendConfig(false)
    } catch {
      setBackendConfigError('URL inválida. Exemplo: http://localhost:3000')
    }
  }

  function handleResetBackendConfig() {
    const defaultUrl = getDefaultApiUrl()
    clearApiUrlOverride()
    setBackendDraftUrl(defaultUrl)
    setCurrentApiUrl(defaultUrl)
    setBackendConfigError(null)
    setShowBackendConfig(false)
  }

  const errorMessage =
    validationError ??
    (mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error instanceof Error
        ? mutation.error.message
        : null)

  return (
    <AuthLayout>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-vscode-text">Entrar</h2>
          <p className="mt-1 text-sm text-vscode-text-muted">
            Use suas credenciais de administrador.
          </p>
        </div>

        <IconButton
          icon={<SettingsIcon />}
          label="Configurar endpoint do backend"
          onClick={handleOpenBackendConfig}
        />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            hasError={Boolean(errorMessage)}
            required
          />
        </div>

        <div>
          <Label htmlFor="senha">Senha</Label>
          <PasswordInput
            id="senha"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            hasError={Boolean(errorMessage)}
            required
          />
        </div>

        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

        <Button type="submit" fullWidth loading={mutation.isPending}>
          {mutation.isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <div className="my-5 border-t border-vscode-border" />

      <button
        type="button"
        className="w-full text-center text-sm text-vscode-accent transition-colors hover:text-vscode-accent-hover"
        onClick={() => undefined}
      >
        Esqueceu a senha?
      </button>

      <Dialog
        isOpen={showBackendConfig}
        title="Endpoint do Backend"
        onClose={() => setShowBackendConfig(false)}
        closeAriaLabel="Fechar configuração do backend"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="backendBaseUrl">URL base da API</Label>
            <Input
              id="backendBaseUrl"
              value={backendDraftUrl}
              onChange={(event) => {
                setBackendDraftUrl(event.target.value)
                setBackendConfigError(null)
              }}
              placeholder="http://localhost:3000"
              hasError={Boolean(backendConfigError)}
            />
            {backendConfigError && (
              <p className="mt-2 text-xs text-vscode-error">{backendConfigError}</p>
            )}
            <p className="mt-2 text-xs text-vscode-text-muted">
              Padrão do .env: {getDefaultApiUrl()}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleResetBackendConfig}>
              Restaurar padrão
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowBackendConfig(false)}>
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={handleSaveBackendConfig}>
              Salvar
            </Button>
          </div>
        </div>
      </Dialog>
    </AuthLayout>
  )
}
