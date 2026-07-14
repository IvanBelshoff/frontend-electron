import { execSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = path.join(rootDir, 'release-build')
const winUnpackedDir = path.join(outputDir, 'win-unpacked')
const legacyWinUnpackedDir = path.join(rootDir, 'release', 'win-unpacked')

function sleep(ms) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    // Busy wait for Windows process handles to release files.
  }
}

function stopWindowsPackagedApp() {
  if (process.platform !== 'win32') {
    return
  }

  const processNames = ['DataDash Admin.exe', 'electron.exe']

  for (const processName of processNames) {
    try {
      execSync(`taskkill /F /IM "${processName}" /T`, { stdio: 'ignore' })
    } catch {
      // Process may not be running.
    }
  }

  sleep(1000)
}

function removeDir(targetDir) {
  if (!existsSync(targetDir)) {
    return true
  }

  try {
    rmSync(targetDir, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 300,
    })
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn(`Nao foi possivel limpar ${targetDir}: ${message}`)
    return false
  }
}

stopWindowsPackagedApp()

const cleanedOutput = removeDir(winUnpackedDir)
const cleanedLegacy = removeDir(legacyWinUnpackedDir)

if (!cleanedOutput) {
  console.warn(
    'A pasta de build anterior continua bloqueada. Feche o DataDash Admin, pare `npm run dev` e feche o Explorer em release/.',
  )
  console.warn('O electron-builder usara release-build/ para este build.')
}

if (!cleanedLegacy && existsSync(legacyWinUnpackedDir)) {
  console.warn(
    'A pasta legada release/win-unpacked continua bloqueada e pode ser removida manualmente depois.',
  )
}

console.log('Preparacao do pacote concluida.')
