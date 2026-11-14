import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5185,
    strictPort: true,
    host: "0.0.0.0",
    proxy: {
      "/proxy/osdr": {
        target: "https://osdr.nasa.gov",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/osdr/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
            proxyReq.removeHeader("referer");
          });
        },
      },
      "/proxy/donki": {
        target: "https://ccmc.gsfc.nasa.gov",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/donki/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
            proxyReq.removeHeader("referer");
          });
        },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "flow-vendor": ["@xyflow/react", "dagre"],
          "icons-vendor": ["lucide-react"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
