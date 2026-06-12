import { describe, expect, it } from "bun:test";
import { apiApp } from "@signal-room/api/app";
import { fetchHealth } from "@signal-room/api-client";
import { signalingHealthResponse } from "@signal-room/signaling/server";

describe("workspace health smoke test", () => {
  it("checks API and signaling health through the shared client contract", async () => {
    const fetcher: typeof fetch = async (input) => {
      const url = new URL(input.toString());

      if (url.port === "3000") {
        return apiApp.request(url.pathname);
      }

      if (url.port === "3001") {
        return Response.json(signalingHealthResponse());
      }

      return new Response(null, { status: 404 });
    };

    const health = await fetchHealth({
      apiUrl: "http://localhost:3000",
      signalingUrl: "http://localhost:3001",
      fetcher,
    });

    expect(health.api.status).toBe("healthy");
    expect(health.signaling.service).toBe("signaling");
  });
});
