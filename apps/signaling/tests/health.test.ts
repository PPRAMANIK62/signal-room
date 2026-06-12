import { describe, expect, it } from "bun:test";
import { signalingHealthResponse } from "@signal-room/signaling/server";

describe("signaling health", () => {
  it("returns a healthy gateway status", () => {
    const health = signalingHealthResponse();

    expect(health.service).toBe("signaling");
    expect(health.status).toBe("healthy");
  });
});
