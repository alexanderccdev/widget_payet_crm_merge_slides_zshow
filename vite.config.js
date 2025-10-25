import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const renameIndexPlugin = newFilename => {
  if (!newFilename) return

  return {
    name: 'renameIndex',
    enforce: 'post',
    generateBundle(options, bundle) {
      const indexHtml = bundle['index.html']
      indexHtml.fileName = newFilename
      console.log('renaming index.html to', indexHtml.fileName)
    },
  }
}

export default defineConfig({
  plugins: [vue(),
    renameIndexPlugin('widget.html'),
  ],
  base: '',
  publicPath: '',
  build: {
    outDir: "build/app",
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok.io',
      '.ngrok-free.app',
      '.ngrok.app',
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
})
