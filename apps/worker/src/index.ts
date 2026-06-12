import { createHealthCheck } from "@signal-room/shared";

const health = createHealthCheck("worker");

console.log(`Signal Room worker ready: ${health.status}`);

setInterval(() => {
  const heartbeat = createHealthCheck("worker");
  console.log(`Signal Room worker heartbeat: ${heartbeat.checkedAt}`);
}, 60_000);
