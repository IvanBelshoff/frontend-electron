import type { UserProfile } from './auth-types'
import type { UserRbac } from './rbac-types'

type AuthListener = () => void

let accessToken: string | null = null
let user: UserProfile | null = null
let rbac: UserRbac | null = null
let isBootstrapping = true
const listeners = new Set<AuthListener>()

function notify() {
  listeners.forEach((listener) => listener())
}

export const authStore = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string | null) => {
    accessToken = token
    notify()
  },
  getUser: () => user,
  setUser: (nextUser: UserProfile | null) => {
    user = nextUser
    notify()
  },
  getRbac: () => rbac,
  setRbac: (nextRbac: UserRbac | null) => {
    rbac = nextRbac
    notify()
  },
  isAuthenticated: () => Boolean(accessToken),
  getIsBootstrapping: () => isBootstrapping,
  setIsBootstrapping: (value: boolean) => {
    isBootstrapping = value
    notify()
  },
  subscribe: (listener: AuthListener) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  reset: () => {
    accessToken = null
    user = null
    rbac = null
    notify()
  },
}
