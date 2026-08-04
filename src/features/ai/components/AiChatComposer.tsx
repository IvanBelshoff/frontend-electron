import clsx from 'clsx'
import {
  type FormEvent,
  type KeyboardEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import AiChatModeBadges from '@/features/ai/components/AiChatModeBadges'
import AiMentionChips from '@/features/ai/components/AiMentionChips'
import AiMentionPopup from '@/features/ai/components/AiMentionPopup'
import type { AiChatMode } from '@/features/ai/ai-chat-types'
import type { AiMention } from '@/features/ai/ai-mention-types'
import { mentionKey } from '@/features/ai/ai-mention-types'
import { useAiMentions } from '@/features/ai/hooks/use-ai-mentions'

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M8.707 2.293a1 1 0 0 0-1.414 0L2.293 7.293a1 1 0 1 0 1.414 1.414L7 5.414V13a1 1 0 1 0 2 0V5.414l3.293 3.293a1 1 0 0 0 1.414-1.414L8.707 2.293z" />
    </svg>
  )
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="10" height="10" rx="1" />
    </svg>
  )
}

function AtIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
    </svg>
  )
}

type AiChatComposerProps = {
  value: string
  onChange: (value: string) => void
  mentions: AiMention[]
  onMentionsChange: (mentions: AiMention[]) => void
  onSubmit: () => void
  onStop: () => void
  disabled?: boolean
  isBusy?: boolean
  /** Bloqueia o envio enquanto uma análise em fila não termina. */
  isAnalysisPending?: boolean
  mode: AiChatMode
  thinking: boolean
  isThinkingLocked: boolean
  thinkingSupported?: boolean
  onModeChange: (mode: AiChatMode) => void
  onToggleThinking: () => void
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
  disabled: disabledProp = false,
  isBusy = false,
  isAnalysisPending = false,
  mode,
  thinking,
  isThinkingLocked,
  thinkingSupported = true,
  onModeChange,
  onToggleThinking,
}: AiChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [cursor, setCursor] = useState(0)
  const mentionsUi = useAiMentions(mentions)
  const disabled = disabledProp || isAnalysisPending
  const canSend = !disabled && !isBusy && value.trim().length > 0

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) {
      return
    }

    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [value])

  function insertAtSymbol() {
    const el = textareaRef.current
    if (!el || disabled || isBusy) {
      return
    }

    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const needsSpace = start > 0 && !/\s/.test(value[start - 1] ?? '')
    const insertion = `${needsSpace ? ' ' : ''}@`
    const next = `${value.slice(0, start)}${insertion}${value.slice(end)}`
    const nextCursor = start + insertion.length

    onChange(next)
    setCursor(nextCursor)
    mentionsUi.openPopup()
    mentionsUi.setFilter('')

    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(nextCursor, nextCursor)
    })
  }

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
    <form className="px-4 pb-4 pt-2" onSubmit={handleSubmit}>
      <div
        className={clsx(
          'group relative rounded-lg border bg-vscode-bg/60 transition-[border-color,box-shadow]',
          'border-vscode-border/80 focus-within:border-vscode-accent/50 focus-within:shadow-[0_0_0_1px_rgb(var(--vscode-accent-rgb)/0.25)]',
          (disabled || isBusy) && 'opacity-60',
        )}
      >
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

        {mentions.length > 0 && (
          <div className="border-b border-vscode-border/50 px-3 py-2">
            <AiMentionChips mentions={mentions} onRemove={removeMention} />
          </div>
        )}

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
          rows={1}
          placeholder={
            isAnalysisPending
              ? 'Aguardando o resultado da análise em segundo plano…'
              : mode === 'analitico'
                ? 'Descreva o desafio; a IA propõe um plano antes de analisar…'
                : 'Pergunte sobre seus relatórios autorizados…'
          }
          disabled={disabled || isBusy}
          className="block max-h-40 w-full resize-none border-0 bg-transparent px-3 py-2.5 text-sm leading-relaxed text-vscode-text outline-none placeholder:text-vscode-text-muted/60"
        />

        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <AiChatModeBadges
              mode={mode}
              thinking={thinking}
              isThinkingLocked={isThinkingLocked}
              thinkingSupported={thinkingSupported}
              disabled={disabled || isBusy}
              onModeChange={onModeChange}
              onToggleThinking={onToggleThinking}
            />
            <button
              type="button"
              title="Adicionar contexto (@)"
              aria-label="Adicionar contexto"
              disabled={disabled || isBusy}
              onClick={insertAtSymbol}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-vscode-text-muted transition-colors hover:bg-vscode-sidebar hover:text-vscode-text disabled:pointer-events-none"
            >
              <AtIcon className="h-4 w-4" />
            </button>
            <span className="truncate text-[11px] text-vscode-text-muted/70">
              {isAnalysisPending
                ? 'Análise em andamento — o envio volta quando o resultado chegar'
                : 'Enter envia · Shift+Enter quebra linha'}
            </span>
          </div>

          {isBusy ? (
            <button
              type="button"
              title="Parar geração"
              aria-label="Parar geração"
              onClick={onStop}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-vscode-border bg-vscode-sidebar text-vscode-text transition-colors hover:border-vscode-accent/40 hover:bg-vscode-activity-bar"
            >
              <StopIcon className="h-3 w-3" />
            </button>
          ) : (
            <button
              type="submit"
              title="Enviar mensagem"
              aria-label="Enviar mensagem"
              disabled={!canSend}
              className={clsx(
                'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors',
                canSend
                  ? 'bg-vscode-accent text-white hover:bg-vscode-accent-hover'
                  : 'bg-vscode-activity-bar text-vscode-text-muted/50',
              )}
            >
              <SendIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
