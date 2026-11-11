import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwind from "@tailwindcss/vite"
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: "es2022",
    minify: "esbuild",
    esbuildMinifyOptions: {
      drop_labels: true,
      drop_console: true,
      drop_debugger: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          i18n: ["react-i18next"],
        },
      },
      // Explicitly specify the entry point
      input: "src/index.tsx",
    },
    outDir: "dist",
    assetsInlineLimit: 4000,
    // Use empty mode to prevent Rollup from resolving index.html as entry module
    // This is needed for Vite 5 + Cloudflare Pages static deployment
    empty: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})