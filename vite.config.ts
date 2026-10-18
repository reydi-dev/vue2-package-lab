import { resolve } from 'node:path'
import type { Connect, Plugin } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { handleUsersApi } from './src/mock-api/users-handler'

function mockApiPlugin(): Plugin {
  const middleware: Connect.NextHandleFunction = (request, response, next) => {
    void handleUsersApi(request, response).then((handled) => {
      if (!handled) next()
    }).catch(next)
  }
  return {
    name: 'vue2-package-lab-mock-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  plugins: [vue(), mockApiPlugin()],
  resolve: {
    alias: [{ find: /^vue$/, replacement: resolve(__dirname, 'node_modules/vue/dist/vue.runtime.esm.js') }],
    dedupe: ['vue'],
  },
  server: { host: '127.0.0.1', port: 4173 },
  preview: { host: '127.0.0.1', port: 4174 },
})
