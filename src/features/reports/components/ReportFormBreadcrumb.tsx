import { Link } from '@tanstack/react-router'

type ReportFormBreadcrumbProps = {
  parent: {
    label: string
    to: '/relatorios/gerenciar'
  }
  middle?: {
    label: string
    to: string
  }
  current: string
  middleSeparator?: string
  currentSeparator?: string
}

function BreadcrumbSeparator({ symbol }: { symbol: string }) {
  return (
    <li aria-hidden="true" className="text-vscode-text-muted">
      {symbol}
    </li>
  )
}

export default function ReportFormBreadcrumb({
  parent,
  middle,
  current,
  middleSeparator = '/',
  currentSeparator = '/',
}: ReportFormBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0 text-sm text-vscode-text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link to={parent.to} className="transition-colors hover:text-vscode-text">
            {parent.label}
          </Link>
        </li>
        {middle ? (
          <>
            <BreadcrumbSeparator symbol={middleSeparator} />
            <li className="min-w-0">
              <Link
                to={middle.to}
                className="block truncate transition-colors hover:text-vscode-text"
                title={middle.label}
              >
                {middle.label}
              </Link>
            </li>
          </>
        ) : null}
        <BreadcrumbSeparator symbol={currentSeparator} />
        <li className="truncate font-medium text-vscode-text" aria-current="page">
          {current}
        </li>
      </ol>
    </nav>
  )
}
