import { serve } from "@hono/node-server";
import { apiApp } from "./app";
import { apiEnv } from "./config/env";

serve(
  {
    fetch: apiApp.fetch,
    port: apiEnv.port,
  },
  (info) => {
    console.log(`Signal Room API listening on http://localhost:${info.port}`);
  },
);
