import clsx from 'clsx'
import { useState, type InputHTMLAttributes } from 'react'
import Input from '@/components/ui/Input'
import { EyeIcon, EyeOffIcon } from '@/features/dashboards/icons/DashboardIcons'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  hasError?: boolean
}

export default function PasswordInput({
  className,
  hasError = false,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  function toggleVisibility() {
    setVisible((current) => !current)
  }

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        hasError={hasError}
        className={clsx('pr-10', className)}
      />

      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute right-1 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-vscode-text-muted transition-colors hover:bg-vscode-sidebar hover:text-vscode-text focus:outline-none focus:ring-2 focus:ring-vscode-accent/40"
        aria-label={visible ? 'Ocultar senha' : 'Exibir senha'}
        title={visible ? 'Ocultar senha' : 'Exibir senha'}
      >
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
  )
}
