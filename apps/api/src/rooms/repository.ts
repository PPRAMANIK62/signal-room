import postgres from "postgres";
import type { Room, RoomStatus } from "@signal-room/shared";

export type CreateRoomRecord = {
  title: string;
  userId?: string;
};

export interface RoomRepository {
  createRoom(record: CreateRoomRecord): Promise<Room>;
}

type RoomRow = {
  id: string;
  title: string;
  status: RoomStatus;
  created_at: Date;
};

const localUserId = "local-user";
const localUserName = "Local developer";

export class PostgresRoomRepository implements RoomRepository {
  private readonly sql: postgres.Sql;

  constructor(databaseUrl: string) {
    this.sql = postgres(databaseUrl, {
      max: 5,
    });
  }

  async createRoom(record: CreateRoomRecord): Promise<Room> {
    const userId = record.userId ?? localUserId;
    const roomId = crypto.randomUUID();

    const [room] = await this.sql.begin(async (sql) => {
      await sql`
        insert into users (id, display_name)
        values (${userId}, ${localUserName})
        on conflict (id) do nothing
      `;

      const rooms = await sql<RoomRow[]>`
        insert into rooms (id, title, created_by_user_id)
        values (${roomId}, ${record.title}, ${userId})
        returning id, title, status, created_at
      `;

      await sql`
        insert into room_events (room_id, sequence, type, payload)
        values (
          ${roomId},
          1,
          'room.created',
          ${sql.json({
            roomId,
            title: record.title,
            userId,
          })}
        )
      `;

      return rooms;
    });

    if (!room) {
      throw new Error("Room insert did not return metadata.");
    }

    return mapRoomRow(room);
  }
}

export class MemoryRoomRepository implements RoomRepository {
  private readonly rooms: Room[] = [];

  async createRoom(record: CreateRoomRecord): Promise<Room> {
    const room: Room = {
      id: crypto.randomUUID(),
      title: record.title,
      status: "empty",
      createdAt: new Date().toISOString(),
    };

    this.rooms.push(room);

    return room;
  }
}

function mapRoomRow(row: RoomRow): Room {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    createdAt: row.created_at.toISOString(),
  };
}
