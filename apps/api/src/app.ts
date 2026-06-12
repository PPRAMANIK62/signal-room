import { Hono } from "hono";
import { cors } from "hono/cors";
import { createHealthCheck } from "@signal-room/shared";

export const apiApp = new Hono();

apiApp.use("*", cors());

apiApp.get("/health", (context) => context.json(createHealthCheck("api")));

apiApp.get("/", (context) =>
  context.json({
    service: "api",
    message: "Signal Room control plane is ready.",
  }),
);
