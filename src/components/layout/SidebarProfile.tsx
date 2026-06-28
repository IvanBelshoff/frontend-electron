import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/use-auth'
import { getUserPhotoUrl, useCurrentUser } from '@/features/user/use-current-user'

type SidebarProfileProps = {
  expanded?: boolean
}

export default function SidebarProfile({ expanded = true }: SidebarProfileProps) {
  const { user } = useAuth()
  const { data: userDetail, isLoading } = useCurrentUser()
  const [photoError, setPhotoError] = useState(false)

  const displayName = useMemo(() => {
    if (userDetail) {
      return `${userDetail.nome} ${userDetail.sobrenome}`.trim()
    }

    return user?.email ?? 'Usuário'
  }, [user?.email, userDetail])

  const initials = useMemo(() => {
    if (userDetail) {
      const first = userDetail.nome.trim().charAt(0)
      const second = userDetail.sobrenome.trim().charAt(0)
      return `${first}${second}`.toUpperCase() || 'U'
    }

    return user?.email?.charAt(0).toUpperCase() ?? 'U'
  }, [user?.email, userDetail])

  const photoUrl = user?.sub && !photoError ? getUserPhotoUrl(user.sub) : null

  return (
    <div
      className={clsx(
        'border-b border-vscode-border py-4',
        expanded ? 'flex items-center gap-3 px-4' : 'flex justify-center px-2',
      )}
    >
      <div
        className={clsx(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-vscode-accent/20 font-semibold text-vscode-accent',
          expanded ? 'h-10 w-10 text-sm' : 'h-9 w-9 text-xs',
        )}
        title={displayName}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setPhotoError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {expanded && (
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-vscode-border" />
              <div className="h-2.5 w-36 animate-pulse rounded bg-vscode-border/70" />
            </div>
          ) : (
            <>
              <p className="truncate text-sm font-medium text-vscode-text">{displayName}</p>
              <p className="truncate text-xs text-vscode-text-muted">
                {userDetail?.email ?? user?.email}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
