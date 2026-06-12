import { createSignalingServer } from "./server";

const server = createSignalingServer();

console.log(
  `Signal Room signaling gateway listening on http://localhost:${server.port}`,
);
