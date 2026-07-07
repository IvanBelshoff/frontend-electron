import clsx from 'clsx'
import { useEffect, useState } from 'react'
import type { UserPhoto } from '@/features/user/user-types'
import { getUserPhotoUrl } from '@/features/user/use-current-user'

type UserAvatarShape = 'round' | 'rounded-square'

type UserAvatarProps = {
  userId: number
  nome: string
  sobrenome: string
  foto?: UserPhoto | null
  photoVersion?: number
  shape?: UserAvatarShape
  className?: string
}

const shapeClasses: Record<UserAvatarShape, string> = {
  round: 'rounded-full',
  'rounded-square': 'rounded-2xl',
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
  foto,
  photoVersion,
  shape = 'round',
  className = 'h-8 w-8 text-xs',
}: UserAvatarProps) {
  const [photoError, setPhotoError] = useState(false)
  const cacheKey = photoVersion ?? foto?.id ?? 0
  const photoUrl =
    !photoError && userId > 0
      ? `${getUserPhotoUrl(userId)}?v=${encodeURIComponent(String(cacheKey))}`
      : null

  useEffect(() => {
    setPhotoError(false)
  }, [cacheKey, userId])

  return (
    <span
      className={clsx(
        'relative flex shrink-0 items-center justify-center overflow-hidden bg-sky-400/15 font-semibold text-sky-300',
        shapeClasses[shape],
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
