import Hapi from "@hapi/hapi";
import Vision from "@hapi/vision";
import Handlebars from "handlebars";
import Joi from "joi";
import dotenv from "dotenv";
import Cookie from "@hapi/cookie";
import Inert from "@hapi/inert";
import HapiSwagger from "hapi-swagger";
import jwt from "hapi-auth-jwt2";
import path from "path";
import { fileURLToPath } from "url";
import { validate } from "./api/jwt-utils.js";
import { accountsController } from "./controllers/accounts-controller.js";
import { webRoutes } from "./web-routes.js";
import { apiRoutes } from "./api-routes.js";

import { db } from "./models/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerOptions = {
  info: {
    title: "Discover Regensburg API",
    version: "0.1",
  },
  securityDefinitions: {
    jwt: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  },
  security: [{ jwt: [] }],
};

export async function createServer({ port, host } = {}) {
  dotenv.config();
  if (!process.env.COOKIE_NAME || !process.env.COOKIE_PASSWORD) {
    throw new Error("Missing required env vars: COOKIE_NAME and/or COOKIE_PASSWORD");
  }

  const envPort = process.env.PORT ? Number(process.env.PORT) : undefined;
  const resolvedPort = port ?? (Number.isFinite(envPort) ? envPort : 3000);
  const resolvedHost = host ?? process.env.HOST ?? "0.0.0.0";

  const server = Hapi.server({
    port: resolvedPort,
    host: resolvedHost,
    routes: {
      cors: {
        origin: ["http://localhost:5173", "http://localhost:4173", "http://localhost:3000"],
        credentials: true,
      },
    },
  });

  server.validator(Joi);

  await server.register([
    Inert,
    Vision,
    Cookie,
    jwt,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);

  server.auth.strategy("session", "cookie", {
    cookie: {
      name: process.env.COOKIE_NAME,
      password: process.env.COOKIE_PASSWORD,
      isSecure: false,
    },
    redirectTo: "/",
    validate: accountsController.validate,
  });
  server.auth.default("session");

  server.auth.strategy("jwt", "jwt", {
    key: process.env.COOKIE_PASSWORD,
    validate: validate,
    verifyOptions: { algorithms: ["HS256"] },
  });

  server.views({
    engines: {
      hbs: Handlebars,
    },
    relativeTo: __dirname,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  });

  await db.init("mongo");
  server.route(webRoutes);
  server.route(apiRoutes);
  return server;
}

export async function startServer(options) {
  const server = await createServer(options);
  await server.start();
  console.log("Server running on %s", server.info.uri);
  return server;
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

if (process.argv[1] === __filename) {
  startServer();
}
