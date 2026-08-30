import { defineConfig, devices } from "@playwright/test";

const defaultPort = 4173;
const requestedPort = process.env.WORKFLOW_E2E_PORT;
const parsedPort = requestedPort && /^\d+$/.test(requestedPort) ? Number(requestedPort) : defaultPort;
const port = Number.isInteger(parsedPort) && parsedPort >= 1024 && parsedPort <= 65535 ? parsedPort : defaultPort;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
  },
});
