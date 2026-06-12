import { describe, expect, it } from "bun:test";
import { apiApp, createApiApp } from "@signal-room/api/app";
import { MemoryRoomRepository } from "../src/rooms/repository";

describe("api health", () => {
  it("returns a healthy control plane status", async () => {
    const response = await apiApp.request("/health");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.service).toBe("api");
    expect(body.status).toBe("healthy");
  });
});

describe("api rooms", () => {
  it("creates a room with trimmed title metadata", async () => {
    const app = createApiApp({
      roomRepository: new MemoryRoomRepository(),
    });

    const response = await app.request("/rooms", {
      method: "POST",
      body: JSON.stringify({
        title: "  Launch review  ",
      }),
      headers: {
        "content-type": "application/json",
      },
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.room.title).toBe("Launch review");
    expect(body.room.status).toBe("empty");
    expect(body.room.id).toBeString();
    expect(body.room.createdAt).toBeString();
  });

  it("returns validation issues for missing room title", async () => {
    const app = createApiApp({
      roomRepository: new MemoryRoomRepository(),
    });

    const response = await app.request("/rooms", {
      method: "POST",
      body: JSON.stringify({
        title: " ",
      }),
      headers: {
        "content-type": "application/json",
      },
    });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("validation_error");
    expect(body.issues[0].field).toBe("title");
  });
});
