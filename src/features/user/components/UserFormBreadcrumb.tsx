import { Link } from '@tanstack/react-router'

type UserFormBreadcrumbProps = {
  parent: {
    label: string
    to: '/usuarios'
  }
  current: string
}

export default function UserFormBreadcrumb({ parent, current }: UserFormBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0 text-sm text-vscode-text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link to={parent.to} className="transition-colors hover:text-vscode-text">
            {parent.label}
          </Link>
        </li>
        <li aria-hidden="true" className="text-vscode-text-muted">
          /
        </li>
        <li className="truncate font-medium text-vscode-text" aria-current="page">
          {current}
        </li>
      </ol>
    </nav>
  )
}
