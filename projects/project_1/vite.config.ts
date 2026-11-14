import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const osdrProxy = {
  '/proxy/osdr': {
    target: 'https://osdr.nasa.gov',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/proxy\/osdr/, ''),
    configure: (proxy: { on: (event: string, cb: (req: { removeHeader: (h: string) => void }) => void) => void }) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');
      });
    },
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: osdrProxy,
  },
  preview: {
    proxy: osdrProxy,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
