import path from 'path'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = env.VITE_SITE_URL?.trim().replace(/\/$/, '') ?? ''

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'memodee-canonical',
        transformIndexHtml(html: string) {
          if (!siteUrl) return html
          return html.replace(
            '</head>',
            `    <link rel="canonical" href="${siteUrl}/" />\n  </head>`,
          )
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./src/test/setup.ts'],
    },
  }
})
