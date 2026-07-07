import { Link } from '@tanstack/react-router'

export default function UserCreateHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Breadcrumb" className="min-w-0 text-sm text-vscode-text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/usuarios" className="transition-colors hover:text-vscode-text">
              Gerenciamento de Usuários
            </Link>
          </li>
          <li aria-hidden="true" className="text-vscode-text-muted">
            /
          </li>
          <li className="truncate font-medium text-vscode-text" aria-current="page">
            Criar usuário
          </li>
        </ol>
      </nav>
    </header>
  )
}
