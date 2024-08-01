import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
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
});
