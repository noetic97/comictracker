import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const repoRoot = path.resolve(__dirname, "..");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load repo-root .env* so VITE_* (and proxy port) match server `.env` without duplicating under client/
  const env = loadEnv(mode, repoRoot, "");
  const apiPort = env.VITE_API_PORT || "3001";

  return {
    envDir: repoRoot,
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
