import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// Single source of truth for the app version: package.json. Exposed to the app
// as the compile-time constant __APP_VERSION__ (see src/vite-env.d.ts).
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  version: string;
};

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/onnxruntime-web/dist/ort-wasm*',
          dest: 'assets'
        }
      ]
    })
  ],
  server: {
    port: 3000,
    headers: {
      // Required for WASM/SharedArrayBuffer in ONNX Runtime Web if using multi-threading
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  // Mirror the prod isolation headers so `vite preview` reproduces production
  // (crossOriginIsolated / SharedArrayBuffer) — the dev server alone hides the
  // production-only ONNX bundling behaviour.
  preview: {
    port: 4173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
});
