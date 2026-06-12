export type ParticipantRole = "host" | "guest" | "observer";
export type ParticipantState =
  | "joining"
  | "connected"
  | "reconnecting"
  | "left";

export type Participant = {
  id: string;
  displayName: string;
  role: ParticipantRole;
  state: ParticipantState;
};
