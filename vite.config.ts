import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const hostIp = env.VITE_HOST_IP || '0.0.0.0'
  const devPort = Number(env.VITE_DEV_PORT) || 5173

  return {
    // Caminhos relativos para o Electron carregar assets via loadFile (file://).
    base: './',
    plugins: [react()],
    server: {
      host: hostIp,
      port: devPort,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  }
})
