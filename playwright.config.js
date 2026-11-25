const { defineConfig } = require('@playwright/test');
const base = process.env.BASE_URL || 'http://localhost:4173';
module.exports = defineConfig({
  testDir: 'tests',
  reporter: 'list',
  use: { baseURL: base },
  webServer: process.env.BASE_URL ? undefined : { command: 'npm run preview', url: 'http://localhost:4173', reuseExistingServer: true },
});
