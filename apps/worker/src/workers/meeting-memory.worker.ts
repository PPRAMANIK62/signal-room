export function startMeetingMemoryWorker() {
  return { worker: "meeting-memory", status: "idle" as const };
}
