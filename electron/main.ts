import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs'
import { app, BrowserWindow, ipcMain, Menu, safeStorage } from 'electron'
import path from 'path'

const isDev = !app.isPackaged
const TOKEN_STORAGE_KEY = 'access_token'

let mainWindow: BrowserWindow | null = null

function getTokenFilePath() {
  return path.join(app.getPath('userData'), TOKEN_STORAGE_KEY)
}

function readStoredToken(): string | null {
  const filePath = getTokenFilePath()
  if (!existsSync(filePath)) return null

  try {
    const base64 = readFileSync(filePath, 'utf8')
    if (!base64.trim()) return null
    const buffer = Buffer.from(base64, 'base64')
    return safeStorage.decryptString(buffer)
  } catch {
    return null
  }
}

function writeStoredToken(base64: string) {
  writeFileSync(getTokenFilePath(), base64, 'utf8')
}

function clearStoredToken() {
  const filePath = getTokenFilePath()
  if (existsSync(filePath)) {
    unlinkSync(filePath)
  }
}

function isDevToolsShortcut(input: Electron.Input): boolean {
  const key = input.key.toLowerCase()

  if (key === 'f12') return true

  if (input.control && input.shift && key === 'i') return true
  if (input.control && input.shift && key === 'c') return true
  if (input.control && input.shift && key === 'j') return true
  if (input.meta && input.alt && key === 'i') return true

  return false
}

function lockDownDevTools(window: BrowserWindow) {
  if (isDev) return

  window.webContents.on('devtools-opened', () => {
    window.webContents.closeDevTools()
  })

  window.webContents.on('before-input-event', (event, input) => {
    if (isDevToolsShortcut(input)) {
      event.preventDefault()
    }
  })
}

function createApplicationMenu() {
  if (isDev) return

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(process.platform === 'darwin'
      ? [{ role: 'appMenu' as const }]
      : []),
    { role: 'fileMenu' },
    { role: 'editMenu' },
    {
      role: 'viewMenu',
      submenu: [{ role: 'reload' }, { role: 'forceReload' }],
    },
    { role: 'windowMenu' },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#1e1e1e',
    title: 'DataDash Admin',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: isDev,
    },
  })

  lockDownDevTools(mainWindow)

  mainWindow.webContents.on('enter-html-full-screen', () => {
    mainWindow?.setFullScreen(true)
  })

  mainWindow.webContents.on('leave-html-full-screen', () => {
    mainWindow?.setFullScreen(false)
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function registerSecureStorageHandlers() {
  ipcMain.handle('secure-storage:is-available', () =>
    safeStorage.isEncryptionAvailable(),
  )

  ipcMain.handle('secure-storage:get-token', () => {
    if (!safeStorage.isEncryptionAvailable()) {
      return null
    }

    try {
      return readStoredToken()
    } catch {
      return null
    }
  })

  ipcMain.handle('secure-storage:set-token', (_event, token: string) => {
    if (!safeStorage.isEncryptionAvailable()) {
      return false
    }

    try {
      const encrypted = safeStorage.encryptString(token)
      writeStoredToken(encrypted.toString('base64'))
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle('secure-storage:clear-token', () => {
    clearStoredToken()
    return true
  })
}

app.whenReady().then(() => {
  createApplicationMenu()
  registerSecureStorageHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
