export function startRecordingWorker() {
  return { worker: "recording", status: "idle" as const };
}
