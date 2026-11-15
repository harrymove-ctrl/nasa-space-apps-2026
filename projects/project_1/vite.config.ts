import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function makeNasaProxy(prefix: string, target: string) {
  const prefixRegex = new RegExp(`^${prefix}`);
  return {
    [prefix]: {
      target,
      changeOrigin: true,
      rewrite: (p: string) => p.replace(prefixRegex, ''),
      configure: (proxy: {
        on: (
          event: string,
          cb: (
            arg0: { removeHeader?: (h: string) => void },
            arg1?: unknown,
            arg2?: {
              headersSent?: boolean;
              writeHead?: (status: number, headers: Record<string, string>) => void;
              end?: (body: string) => void;
            }
          ) => void
        ) => void;
      }) => {
        proxy.on('proxyReq', (proxyReq) => {
          proxyReq.removeHeader?.('origin');
          proxyReq.removeHeader?.('referer');
        });
        proxy.on('error', (_err, _req, res) => {
          if (res && !res.headersSent && typeof res.writeHead === 'function') {
            res.writeHead(200, {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'no-store',
              'X-Proxy-Fallback': '1',
            });
            res.end?.('{"fallback":true}');
          }
        });
      },
    },
  };
}

const nasaProxies = {
  ...makeNasaProxy('/proxy/osdr', 'https://osdr.nasa.gov'),
  ...makeNasaProxy('/proxy/firms', 'https://firms.modaps.eosdis.nasa.gov'),
  ...makeNasaProxy('/proxy/asf', 'https://api.daac.asf.alaska.edu'),
  ...makeNasaProxy('/proxy/cmr', 'https://cmr.earthdata.nasa.gov'),
  ...makeNasaProxy('/proxy/donki', 'https://ccmc.gsfc.nasa.gov'),
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: nasaProxies,
  },
  preview: {
    proxy: nasaProxies,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/ascii.rest')) {
            return 'vendor-ascii';
          }
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/@number-flow')) {
            return 'vendor-ui';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
