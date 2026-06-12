import { createHealthCheck, type SignalingMessage } from "@signal-room/shared";

export function createSignalingServer(
  port = Number(process.env.SIGNALING_PORT ?? 3001),
) {
  return Bun.serve<undefined>({
    port,
    fetch(request, server) {
      const url = new URL(request.url);

      if (url.pathname === "/health") {
        return json(createHealthCheck("signaling"));
      }

      if (url.pathname === "/ws" && server.upgrade(request)) {
        return;
      }

      return json({ message: "Signal Room signaling gateway is ready." }, 200);
    },
    websocket: {
      message(socket, rawMessage) {
        const message = parseSignalingMessage(rawMessage);

        if (message?.type === "health.ping") {
          socket.send(
            JSON.stringify({
              type: "health.pong",
              sentAt: message.sentAt,
              checkedAt: new Date().toISOString(),
            } satisfies SignalingMessage),
          );
        }
      },
    },
  });
}

export function signalingHealthResponse() {
  return createHealthCheck("signaling");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
  });
}

function parseSignalingMessage(
  rawMessage: string | Buffer,
): SignalingMessage | undefined {
  try {
    return JSON.parse(rawMessage.toString()) as SignalingMessage;
  } catch {
    return undefined;
  }
}
