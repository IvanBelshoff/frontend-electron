import { contextBridge, ipcRenderer } from 'electron'

export type SecureStorageAPI = {
  isAvailable: () => Promise<boolean>
  getToken: () => Promise<string | null>
  setToken: (token: string) => Promise<boolean>
  clearToken: () => Promise<boolean>
}

contextBridge.exposeInMainWorld('secureStorage', {
  isAvailable: () => ipcRenderer.invoke('secure-storage:is-available') as Promise<boolean>,
  getToken: () => ipcRenderer.invoke('secure-storage:get-token') as Promise<string | null>,
  setToken: (token: string) =>
    ipcRenderer.invoke('secure-storage:set-token', token) as Promise<boolean>,
  clearToken: () => ipcRenderer.invoke('secure-storage:clear-token') as Promise<boolean>,
} satisfies SecureStorageAPI)
