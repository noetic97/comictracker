import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env.local so proxy target matches API server port (VITE_API_PORT=3002 if server used 3002)
  const env = loadEnv(mode, process.cwd(), "");
  const apiPort = env.VITE_API_PORT || "3001";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      open: true,
      cors: true,
      proxy: {
        "/api": {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
      build: {
      outDir: "dist",
      sourcemap: true,
      minify: "esbuild",
      chunkSizeWarningLimit: 1600,
    },
    css: {
      modules: {
        localsConvention: "camelCaseOnly",
      },
    },
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
  };
});
