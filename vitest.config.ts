import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/pages/**/*.tsx', 'src/components/**/*.tsx', 'src/stores/**/*.ts', 'src/utils/**/*.ts', 'src/router/**/*.tsx', 'src/domain/**/*.ts'],
      thresholds: { functions: 90, lines: 90, branches: 85 },
    },
  },
});
