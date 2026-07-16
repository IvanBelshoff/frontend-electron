import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useMemo, useState, type FormEvent } from 'react'
import Button from '@/components/ui/Button'
import SettingsPageHeader from '@/components/settings/SettingsPageHeader'
import { getApiUrl } from '@/lib/config'

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

export default function AiChatTestPage() {
  const [input, setInput] = useState('')

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${getApiUrl()}/ai/chat`,
        credentials: 'include',
      }),
    [],
  )

  const { messages, sendMessage, status, error, stop } = useChat({ transport })

  const isBusy = status === 'submitted' || status === 'streaming'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = input.trim()
    if (!text || isBusy) {
      return
    }

    setInput('')
    await sendMessage({ text })
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <SettingsPageHeader
        title="Chat IA (teste)"
        subtitle="Validação de stream com Ollama via Vercel AI SDK. Sem regras de negócio."
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-vscode-border bg-vscode-sidebar">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="text-sm text-vscode-text-muted">
              Digite uma pergunta abaixo para ver a resposta chegar em stream.
            </p>
          )}

          {messages.map((message) => {
            const isUser = message.role === 'user'
            const text = getMessageText(message)

            return (
              <div
                key={message.id}
                className={
                  isUser
                    ? 'ml-auto max-w-[85%] rounded-lg bg-vscode-accent/20 px-3 py-2 text-sm text-vscode-text'
                    : 'mr-auto max-w-[85%] rounded-lg border border-vscode-border bg-vscode-input-bg/40 px-3 py-2 text-sm text-vscode-text'
                }
              >
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-vscode-text-muted">
                  {isUser ? 'Você' : 'Assistente'}
                </p>
                <p className="whitespace-pre-wrap break-words">{text || (isBusy && !isUser ? '…' : '')}</p>
              </div>
            )
          })}
        </div>

        <div className="border-t border-vscode-border p-3">
          {error && (
            <p className="mb-2 text-sm text-red-400">{error.message}</p>
          )}

          <form className="flex items-end gap-2" onSubmit={(event) => void handleSubmit(event)}>
            <label className="sr-only" htmlFor="ai-chat-input">
              Mensagem
            </label>
            <textarea
              id="ai-chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={2}
              placeholder="Pergunte algo…"
              disabled={isBusy}
              className="min-h-[2.5rem] flex-1 resize-none rounded border border-vscode-border bg-vscode-input-bg px-3 py-2 text-sm text-vscode-text outline-none focus:border-vscode-accent disabled:opacity-50"
            />
            {isBusy ? (
              <Button type="button" variant="secondary" onClick={() => stop()}>
                Parar
              </Button>
            ) : (
              <Button type="submit" disabled={!input.trim()}>
                Enviar
              </Button>
            )}
          </form>

          <p className="mt-2 text-xs text-vscode-text-muted">
            Status: {status}
          </p>
        </div>
      </div>
    </div>
  )
}
