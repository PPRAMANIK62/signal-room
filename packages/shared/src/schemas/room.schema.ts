export type RoomStatus = "empty" | "active" | "ended";

export type Room = {
  id: string;
  title: string;
  status: RoomStatus;
  createdAt: string;
};

export type CreateRoomRequest = {
  title: string;
};

export type RoomMetadataResponse = {
  room: Room;
};

export type ValidationIssue = {
  field: string;
  message: string;
};

export type ValidationResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      issues: ValidationIssue[];
    };

const roomTitleMaxLength = 80;

export function validateCreateRoomRequest(
  input: unknown,
): ValidationResult<CreateRoomRequest> {
  if (!input || typeof input !== "object") {
    return invalidRoomTitle("Room title is required.");
  }

  const title = (input as { title?: unknown }).title;

  if (typeof title !== "string") {
    return invalidRoomTitle("Room title is required.");
  }

  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return invalidRoomTitle("Room title is required.");
  }

  if (trimmedTitle.length > roomTitleMaxLength) {
    return invalidRoomTitle(
      `Room title must be ${roomTitleMaxLength} characters or fewer.`,
    );
  }

  return {
    ok: true,
    value: {
      title: trimmedTitle,
    },
  };
}

function invalidRoomTitle(
  message: string,
): ValidationResult<CreateRoomRequest> {
  return {
    ok: false,
    issues: [
      {
        field: "title",
        message,
      },
    ],
  };
}
