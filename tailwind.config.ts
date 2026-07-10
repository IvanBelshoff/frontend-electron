import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vscode: {
          bg: 'var(--vscode-bg)',
          sidebar: 'var(--vscode-sidebar)',
          'activity-bar': 'var(--vscode-activity-bar)',
          border: 'var(--vscode-border)',
          accent: 'var(--vscode-accent)',
          'accent-hover': 'var(--vscode-accent-hover)',
          text: 'var(--vscode-text)',
          'text-muted': 'var(--vscode-text-muted)',
          'input-bg': 'var(--vscode-input-bg)',
          error: 'var(--vscode-error)',
          success: 'var(--vscode-success)',
          warning: 'var(--vscode-warning)',
        },
      },
      fontFamily: {
        sans: [
          'Segoe UI',
          '-apple-system',
          'BlinkMacSystemFont',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

export default config
