export function startCleanupWorker() {
  return { worker: "cleanup", status: "idle" as const };
}
