import { type FormEvent, type KeyboardEvent } from 'react'
import Button from '@/components/ui/Button'

type AiChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onStop: () => void
  disabled?: boolean
  isBusy?: boolean
}

export default function AiChatComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  disabled = false,
  isBusy = false,
}: AiChatComposerProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!disabled && !isBusy && value.trim()) {
        onSubmit()
      }
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="border-t border-vscode-border p-3" onSubmit={handleSubmit}>
      <div className="flex items-end gap-2">
        <label className="sr-only" htmlFor="ai-chat-input">
          Mensagem
        </label>
        <textarea
          id="ai-chat-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="Pergunte sobre seus relatórios autorizados…"
          disabled={disabled || isBusy}
          className="min-h-[3rem] flex-1 resize-none rounded border border-vscode-border bg-vscode-input-bg px-3 py-2 text-sm text-vscode-text outline-none focus:border-vscode-accent disabled:opacity-50"
        />
        {isBusy ? (
          <Button type="button" variant="secondary" onClick={onStop}>
            Parar
          </Button>
        ) : (
          <Button type="submit" disabled={disabled || !value.trim()}>
            Enviar
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-vscode-text-muted">Enter para enviar · Shift+Enter para nova linha</p>
    </form>
  )
}
