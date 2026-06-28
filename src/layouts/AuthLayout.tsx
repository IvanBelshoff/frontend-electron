import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-full items-center justify-center bg-vscode-bg px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded bg-vscode-accent text-lg font-bold text-white">
            D
          </div>
          <h1 className="text-xl font-semibold text-vscode-text">DataDash Admin</h1>
          <p className="mt-1 text-sm text-vscode-text-muted">
            Portal de administração de dashboards
          </p>
        </div>

        <div className="rounded border border-vscode-border bg-vscode-sidebar p-6 shadow-lg">
          {children}
        </div>
      </div>
    </main>
  )
}
