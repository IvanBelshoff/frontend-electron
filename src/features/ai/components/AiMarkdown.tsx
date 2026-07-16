import clsx from 'clsx'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type AiMarkdownProps = {
  content: string
  className?: string
}

function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const language = className?.replace('language-', '') ?? 'text'

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="group relative my-2 overflow-hidden rounded-md border border-vscode-border bg-vscode-bg/80">
      <div className="flex items-center justify-between border-b border-vscode-border px-3 py-1 text-[10px] uppercase tracking-wide text-vscode-text-muted">
        <span>{language}</span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="rounded px-2 py-0.5 text-[10px] text-vscode-text-muted transition-colors hover:bg-vscode-sidebar hover:text-vscode-text"
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  )
}

export default function AiMarkdown({ content, className }: AiMarkdownProps) {
  return (
    <div className={clsx('ai-markdown text-sm leading-relaxed text-vscode-text', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-2 list-disc pl-5 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-vscode-text">{children}</strong>,
          code: ({ className: codeClassName, children }) => {
            const text = String(children).replace(/\n$/, '')

            if (codeClassName) {
              return <CodeBlock className={codeClassName}>{text}</CodeBlock>
            }

            return (
              <code className="rounded bg-vscode-bg/70 px-1 py-0.5 text-[0.9em] text-vscode-accent">
                {text}
              </code>
            )
          },
          pre: ({ children }) => <>{children}</>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-vscode-accent underline underline-offset-2"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
