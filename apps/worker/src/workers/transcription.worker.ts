export function startTranscriptionWorker() {
  return { worker: "transcription", status: "idle" as const };
}
