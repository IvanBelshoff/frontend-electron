import {
  type FormEvent,
  type KeyboardEvent,
  useRef,
  useState,
} from 'react'
import Button from '@/components/ui/Button'
import AiMentionChips from '@/features/ai/components/AiMentionChips'
import AiMentionPopup from '@/features/ai/components/AiMentionPopup'
import type { AiMention } from '@/features/ai/ai-mention-types'
import { mentionKey } from '@/features/ai/ai-mention-types'
import { useAiMentions } from '@/features/ai/hooks/use-ai-mentions'

type AiChatComposerProps = {
  value: string
  onChange: (value: string) => void
  mentions: AiMention[]
  onMentionsChange: (mentions: AiMention[]) => void
  onSubmit: () => void
  onStop: () => void
  disabled?: boolean
  isBusy?: boolean
}

function stripAtQuery(value: string, cursor: number): { next: string; nextCursor: number } {
  const before = value.slice(0, cursor)
  const after = value.slice(cursor)
  const match = before.match(/(^|[\s])@([\wÀ-ÿ-]*)$/u)

  if (!match) {
    return { next: value, nextCursor: cursor }
  }

  const removeFrom = before.length - (match[2]?.length ?? 0) - 1
  const prefix = before.slice(0, removeFrom)
  const next = `${prefix}${after}`
  return { next, nextCursor: prefix.length }
}

export default function AiChatComposer({
  value,
  onChange,
  mentions,
  onMentionsChange,
  onSubmit,
  onStop,
  disabled = false,
  isBusy = false,
}: AiChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [cursor, setCursor] = useState(0)
  const mentionsUi = useAiMentions(mentions)

  function addMention(mention: AiMention) {
    if (mentions.some((current) => mentionKey(current) === mentionKey(mention))) {
      mentionsUi.closePopup()
      return
    }

    const { next, nextCursor } = stripAtQuery(value, cursor)
    onChange(next)
    onMentionsChange([...mentions, mention])
    mentionsUi.closePopup()

    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) {
        return
      }
      el.focus()
      el.setSelectionRange(nextCursor, nextCursor)
      setCursor(nextCursor)
    })
  }

  function removeMention(mention: AiMention) {
    onMentionsChange(
      mentions.filter((current) => mentionKey(current) !== mentionKey(mention)),
    )
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionsUi.open) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        mentionsUi.moveActive(1)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        mentionsUi.moveActive(-1)
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        mentionsUi.closePopup()
        return
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        if (mentionsUi.mode === 'categories') {
          const category = mentionsUi.categories[mentionsUi.activeIndex]
          if (category) {
            mentionsUi.selectCategory(category)
          }
          return
        }

        const item = mentionsUi.items[mentionsUi.activeIndex]
        if (item) {
          addMention(item.mention)
        }
        return
      }

      if (event.key === 'Backspace' && mentionsUi.mode === 'items' && !mentionsUi.filter) {
        event.preventDefault()
        mentionsUi.goBack()
        return
      }
    }

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
      {mentions.length > 0 && (
        <div className="mb-2">
          <AiMentionChips mentions={mentions} onRemove={removeMention} />
        </div>
      )}

      <div className="relative flex items-end gap-2">
        <AiMentionPopup
          open={mentionsUi.open}
          mode={mentionsUi.mode}
          filter={mentionsUi.filter}
          categories={mentionsUi.categories}
          items={mentionsUi.items}
          activeIndex={mentionsUi.activeIndex}
          isLoading={mentionsUi.isLoading}
          onFilterChange={mentionsUi.setFilter}
          onSelectCategory={mentionsUi.selectCategory}
          onSelectDomain={(category) => addMention(category.domainMention)}
          onSelectItem={(item) => addMention(item.mention)}
          onBack={mentionsUi.goBack}
        />

        <label className="sr-only" htmlFor="ai-chat-input">
          Mensagem
        </label>
        <textarea
          ref={textareaRef}
          id="ai-chat-input"
          value={value}
          onChange={(event) => {
            const next = event.target.value
            const nextCursor = event.target.selectionStart ?? next.length
            onChange(next)
            setCursor(nextCursor)
            mentionsUi.handleInputChange(next, nextCursor)
          }}
          onSelect={(event) => {
            setCursor(event.currentTarget.selectionStart ?? 0)
          }}
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
      <p className="mt-2 text-xs text-vscode-text-muted">
        Enter para enviar · Shift+Enter para nova linha · Digite @ para adicionar contexto
      </p>
    </form>
  )
}
