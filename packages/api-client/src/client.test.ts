import { describe, expect, it } from "bun:test";
import { ApiValidationError, createRoom } from "./client";

describe("createRoom", () => {
  it("posts room creation requests to the API", async () => {
    const response = await createRoom({
      apiUrl: "http://localhost:3000",
      request: {
        title: "Planning room",
      },
      fetcher: async (input, init) => {
        expect(input.toString()).toBe("http://localhost:3000/rooms");
        expect(init?.method).toBe("POST");
        expect(init?.body).toBe(JSON.stringify({ title: "Planning room" }));

        return Response.json(
          {
            room: {
              id: "room-1",
              title: "Planning room",
              status: "empty",
              createdAt: "2026-06-12T00:00:00.000Z",
            },
          },
          { status: 201 },
        );
      },
    });

    expect(response.room.title).toBe("Planning room");
  });

  it("throws typed validation errors from the API", async () => {
    expect(
      createRoom({
        apiUrl: "http://localhost:3000",
        request: {
          title: "",
        },
        fetcher: async () =>
          Response.json(
            {
              issues: [
                {
                  field: "title",
                  message: "Room title is required.",
                },
              ],
            },
            { status: 422 },
          ),
      }),
    ).rejects.toBeInstanceOf(ApiValidationError);
  });
});
