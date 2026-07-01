import clsx from 'clsx'
import { useEffect, useState } from 'react'
import type { UserPhoto } from '@/features/user/user-types'
import { getUserPhotoUrl } from '@/features/user/use-current-user'

type UserAvatarProps = {
  userId: number
  nome: string
  sobrenome: string
  foto?: UserPhoto | null
  className?: string
}

function getInitials(nome: string, sobrenome: string): string {
  const first = nome.trim().charAt(0)
  const last = sobrenome.trim().charAt(0)
  return `${first}${last}`.toUpperCase() || 'U'
}

export default function UserAvatar({
  userId,
  nome,
  sobrenome,
  className = 'h-8 w-8 text-xs',
}: UserAvatarProps) {
  const [photoError, setPhotoError] = useState(false)
  const photoUrl = !photoError && userId > 0 ? getUserPhotoUrl(userId) : null

  useEffect(() => {
    setPhotoError(false)
  }, [userId])

  return (
    <span
      className={clsx(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-400/15 font-semibold text-sky-300',
        className,
      )}
      aria-hidden="true"
    >
      <span className="absolute inset-0 flex items-center justify-center">
        {getInitials(nome, sobrenome)}
      </span>

      {photoUrl && (
        <img
          src={photoUrl}
          alt=""
          className="relative z-10 h-full w-full object-cover"
          onError={() => setPhotoError(true)}
        />
      )}
    </span>
  )
}
