export type RoomStatus = "empty" | "active" | "ended";

export type Room = {
  id: string;
  title: string;
  status: RoomStatus;
  createdAt: string;
};
