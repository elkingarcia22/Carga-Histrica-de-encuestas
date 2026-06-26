import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    coverage: {
      provider: 'v8'
    },
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'coverage']
  }
});
