# 0002: Use A Real SFU Instead Of Building Media Routing From Scratch

## Status

Accepted

## Context

Video calls require low-latency media routing, codec handling, packet forwarding, RTP behavior, bandwidth constraints, and operational media stats. Building an SFU from scratch would dominate the project and hide the application-level system design work.

## Decision

Use a real SFU such as mediasoup or LiveKit. Prefer mediasoup for deeper control-plane and media-session learning.

## Consequences

- The project can focus on signaling, room state, reconnects, recording orchestration, and observability.
- Media routing behavior is realistic.
- The system must model SFU nodes, media sessions, producers, consumers, and SFU failure.
