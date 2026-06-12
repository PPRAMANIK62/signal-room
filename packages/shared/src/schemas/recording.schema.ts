export type Recording = {
  id: string;
  roomId: string;
  status: "pending" | "running" | "complete" | "failed";
  objectKey?: string;
};
