type AuthListener = () => void

let accessToken: string | null = null
let user: import('./auth-types').UserProfile | null = null
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
  setUser: (nextUser: import('./auth-types').UserProfile | null) => {
    user = nextUser
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
    notify()
  },
}
