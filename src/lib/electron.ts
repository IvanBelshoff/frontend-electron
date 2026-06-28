export type SecureStorageAPI = {
  isAvailable: () => Promise<boolean>
  getToken: () => Promise<string | null>
  setToken: (token: string) => Promise<boolean>
  clearToken: () => Promise<boolean>
}

declare global {
  interface Window {
    secureStorage?: SecureStorageAPI
  }
}

export const secureStorage = typeof window !== 'undefined' ? window.secureStorage : undefined
