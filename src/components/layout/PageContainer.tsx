import clsx from 'clsx'
import type { ReactNode } from 'react'

type PageContainerProps = {
  children: ReactNode
  className?: string
}

export default function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={clsx('mx-auto flex h-full min-h-0 w-[90%] max-w-none flex-col', className)}>
      {children}
    </div>
  )
}
