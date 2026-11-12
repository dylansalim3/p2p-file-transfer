import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile, writeFile } from 'node:fs/promises';

const stampPwaServiceWorker: Plugin = {
  name: 'stamp-pwa-service-worker',
  apply: 'build',
  async closeBundle() {
    const serviceWorkerPath = new URL('./dist/service-worker.js', import.meta.url);
    const serviceWorker = await readFile(serviceWorkerPath, 'utf8');
    const buildId = Date.now().toString(36);
    await writeFile(serviceWorkerPath, serviceWorker.replace('__P2P_BUILD_ID__', buildId), 'utf8');
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), stampPwaServiceWorker]
});
