import { defineConfig } from "vite";

export default defineConfig({
    base: "./",
    server: {
        strictPort: true,
        port: 5173
    },
    preview: {
        strictPort: true,
        port: 4173
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
        sourcemap: false,
        target: "es2020",
        assetsInlineLimit: 4096
    },
    esbuild: {
        legalComments: "none"
    }
});