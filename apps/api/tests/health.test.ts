import { describe, expect, it } from "bun:test";
import { apiApp } from "@signal-room/api/app";

describe("api health", () => {
  it("returns a healthy control plane status", async () => {
    const response = await apiApp.request("/health");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.service).toBe("api");
    expect(body.status).toBe("healthy");
  });
});
