# 0003: Separate Control Plane From Media Plane

## Status

Accepted

## Context

Realtime video systems fail when signaling, room state, and media packet routing are blurred together. They have different latency, durability, and failure characteristics.

## Decision

Keep control-plane responsibilities separate from media-plane responsibilities.

Control plane:

- HTTP API.
- WebSocket signaling.
- room state.
- permissions.
- recording orchestration.
- diagnostics.

Media plane:

- RTP media packets.
- SFU routing.
- TURN relay traffic.
- codec and bitrate behavior.

## Consequences

- The design can reason clearly about correctness versus media quality.
- Debugging can separate signaling failures from media failures.
- The WebSocket gateway must not carry media packets.
