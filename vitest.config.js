const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup/test-setup.js'],
    clearMocks: true,
    restoreMocks: true,
  },
});
