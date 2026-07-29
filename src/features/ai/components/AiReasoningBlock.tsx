import clsx from 'clsx'
import { useState } from 'react'

type AiReasoningBlockProps = {
  text: string
  isStreaming: boolean
}

function ChevronIcon({ className }: { className?: string }) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export default function AiReasoningBlock({ text, isStreaming }: AiReasoningBlockProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mb-2 rounded-md border border-vscode-border/60 bg-vscode-bg/30">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px] font-medium text-vscode-text-muted transition-colors hover:text-vscode-text"
        aria-expanded={expanded}
      >
        <ChevronIcon
          className={clsx('h-3 w-3 shrink-0 transition-transform', expanded && 'rotate-90')}
        />
        {isStreaming ? (
          <span className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
              aria-hidden
            />
            Pensando...
          </span>
        ) : (
          <span>Raciocínio do modelo</span>
        )}
      </button>

      {expanded && (
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words border-t border-vscode-border/50 px-2.5 py-2 text-[11px] leading-relaxed text-vscode-text-muted">
          {text.trim() || 'Sem detalhes de raciocínio.'}
        </pre>
      )}
    </div>
  )
}
