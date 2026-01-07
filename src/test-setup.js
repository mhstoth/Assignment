import { startServer } from "./server.js";
import dotenv from "dotenv";

dotenv.config();

let server;

export const mochaHooks = {
  async beforeAll() {
    server = await startServer({ host: "localhost", port: 3000 });
  },
  async afterAll() {
    if (server) {
      await server.stop({ timeout: 5000 });
      server = undefined;
    }
  },
};

