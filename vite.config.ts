import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2022',
    minify: 'esbuild',
    outDir: 'dist',
    assetsInlineLimit: 4000,
    empty: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: /^react$/, replacement: path.resolve(__dirname, 'node_modules/react/index.js') },
      { find: /^react-dom$/, replacement: path.resolve(__dirname, 'node_modules/react-dom/index.js') },
      { find: /^\.\/cjs\/react\.production\.min\.js$/, replacement: path.resolve(__dirname, 'node_modules/react/cjs/react.development.js') },
      { find: /^\.\/cjs\/react-dom\.production\.min\.js$/, replacement: path.resolve(__dirname, 'node_modules/react-dom/cjs/react-dom.development.js') },
      { find: /^\.\/cjs\/react-jsx-runtime\.production\.min\.js$/, replacement: path.resolve(__dirname, 'node_modules/react/cjs/react-jsx-runtime.development.js') },
    ],
  },
});
