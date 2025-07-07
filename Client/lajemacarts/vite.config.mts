/// <reference types="vitest" />

import angular from '@analogjs/vite-plugin-angular';
import { defineConfig, type PluginOption } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      angular() as PluginOption,
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['**/*.spec.ts'],
      provider: 'v8',
      reporters: ["default", "html"],
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
