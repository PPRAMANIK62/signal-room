export type SignalingMessage =
  | { type: "health.ping"; sentAt: string }
  | { type: "health.pong"; sentAt: string; checkedAt: string }
  | { type: "room.join"; roomId: string; joinToken: string };
