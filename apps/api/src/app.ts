import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  createHealthCheck,
  validateCreateRoomRequest,
} from "@signal-room/shared";
import { apiEnv } from "./config/env";
import {
  MemoryRoomRepository,
  PostgresRoomRepository,
  type RoomRepository,
} from "./rooms/repository";

export type ApiAppOptions = {
  roomRepository?: RoomRepository;
};

export function createApiApp(options: ApiAppOptions = {}) {
  const apiApp = new Hono();
  const roomRepository =
    options.roomRepository ??
    (apiEnv.databaseUrl
      ? new PostgresRoomRepository(apiEnv.databaseUrl)
      : new MemoryRoomRepository());

  apiApp.use("*", cors());

  apiApp.get("/health", (context) => context.json(createHealthCheck("api")));

  apiApp.get("/", (context) =>
    context.json({
      service: "api",
      message: "Signal Room control plane is ready.",
    }),
  );

  apiApp.post("/rooms", async (context) => {
    let requestBody: unknown;

    try {
      requestBody = await context.req.json();
    } catch {
      return context.json(
        {
          error: "invalid_json",
          issues: [
            {
              field: "body",
              message: "Request body must be valid JSON.",
            },
          ],
        },
        400,
      );
    }

    const validation = validateCreateRoomRequest(requestBody);

    if (!validation.ok) {
      return context.json(
        {
          error: "validation_error",
          issues: validation.issues,
        },
        422,
      );
    }

    try {
      const room = await roomRepository.createRoom(validation.value);

      return context.json({ room }, 201);
    } catch (error) {
      console.error("Failed to create room", error);

      return context.json(
        {
          error: "room_create_failed",
          message: "Room could not be created. Try again shortly.",
        },
        500,
      );
    }
  });

  return apiApp;
}

export const apiApp = createApiApp();
