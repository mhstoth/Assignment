import dotenv from "dotenv";
import { startServer } from "./server.js";

dotenv.config();

const listenHost = process.env.TEST_LISTEN_HOST || "127.0.0.1";
const testPortEnv = Number(process.env.TEST_PORT);
const testPort = Number.isFinite(testPortEnv) ? testPortEnv : 3000;
const maxAttempts = Number(process.env.TEST_SERVER_RETRIES || 15);
const retryDelayMs = Number(process.env.TEST_SERVER_RETRY_DELAY_MS || 1000);
const useInject = process.env.USE_INJECT !== "false";
let server;
async function startServerWithRetry() {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      console.log(`Starting test server on ${listenHost}:${testPort} (attempt ${attempt}/${maxAttempts})`);
      const srv = await startServer({ host: listenHost, port: testPort });
      console.log(`Test server started on ${srv.info.uri}`);
      return srv;
    } catch (err) {
      lastError = err;
      console.warn(`Failed to start test server (attempt ${attempt}/${maxAttempts}): ${err.message}`);
      if (attempt < maxAttempts) {
        await new Promise((resolve) => {
          setTimeout(resolve, retryDelayMs);
        });
      }
    }
  }
  throw lastError;
}

const serverPromise = startServerWithRetry();
if (useInject) {
  global.injectServerPromise = serverPromise;
}

export const mochaHooks = {
  async beforeAll() {
    server = await serverPromise;
    if (useInject) {
      global.injectServer = server;
    }
  },
  async afterAll() {
    if (server) {
      await server.stop({ timeout: 5000 });
      server = undefined;
    }
  },
};
