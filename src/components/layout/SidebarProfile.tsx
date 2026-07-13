import clsx from 'clsx'
import { useMemo } from 'react'
import UserAvatar from '@/features/user/UserAvatar'
import { useAuth } from '@/features/auth/use-auth'
import { useUnreadNotifications } from '@/features/user-inbox/hooks/use-unread-notifications'
import { useProfileModal } from '@/features/user-profile/profile-modal-context'
import { useCurrentUser, useUserPhotoVersion } from '@/features/user/use-current-user'

type SidebarProfileProps = {
  expanded?: boolean
}

export default function SidebarProfile({ expanded = true }: SidebarProfileProps) {
  const { user } = useAuth()
  const { data: userDetail, isLoading } = useCurrentUser()
  const { data: photoVersion = 0 } = useUserPhotoVersion(user?.sub)
  const { openProfile } = useProfileModal()
  const { unreadCount } = useUnreadNotifications()

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

  return (
    <button
      type="button"
      onClick={() => openProfile({ notifications: unreadCount > 0 })}
      className={clsx(
        'w-full border-b border-vscode-border py-4 text-left transition-colors hover:bg-vscode-border/20',
        expanded ? 'flex items-center gap-3 px-4' : 'flex justify-center px-2',
      )}
      title={displayName}
    >
      <div className="relative z-0 shrink-0">
        {user?.sub && userDetail ? (
          <UserAvatar
            userId={user.sub}
            nome={userDetail.nome}
            sobrenome={userDetail.sobrenome}
            foto={userDetail.foto}
            photoVersion={photoVersion}
            shape="round"
            className={expanded ? 'h-10 w-10 text-sm' : 'h-9 w-9 text-xs'}
          />
        ) : (
          <div
            className={clsx(
              'flex items-center justify-center overflow-hidden rounded-full bg-vscode-accent/20 font-semibold text-vscode-accent',
              expanded ? 'h-10 w-10 text-sm' : 'h-9 w-9 text-xs',
            )}
          >
            <span>{initials}</span>
          </div>
        )}

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 z-20 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-vscode-sidebar">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
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
    </button>
  )
}
