import { execSync, spawn } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {}
  }

  const values = {}

  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    let value = trimmed.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    values[key] = value
  }

  return values
}

const env = {
  ...loadEnvFile(path.join(rootDir, '.env')),
  ...process.env,
}

const hostIp = env.VITE_HOST_IP || '127.0.0.1'
const devPort = env.VITE_DEV_PORT || '5173'
const devServerUrl = `http://${hostIp}:${devPort}`

execSync('npm run dev:electron:build', { cwd: rootDir, stdio: 'inherit' })
execSync(`npx wait-on ${devServerUrl}`, { cwd: rootDir, stdio: 'inherit' })

const electronProcess = spawn('npx', ['electron', '.'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    VITE_DEV_SERVER_URL: devServerUrl,
  },
})

electronProcess.on('exit', (code) => {
  process.exit(code ?? 0)
})
