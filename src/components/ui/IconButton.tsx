import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode
  label: string
}

export default function IconButton({
  icon,
  label,
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex h-8 w-8 items-center justify-center rounded text-vscode-text-muted transition-colors hover:bg-vscode-sidebar hover:text-vscode-text focus:outline-none focus:ring-2 focus:ring-vscode-accent/40',
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  )
}
