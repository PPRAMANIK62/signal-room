# Atlas Call

Atlas Call is a realtime video calling system design project.

It is intentionally not another CRUD/productivity app. The purpose is to learn the backend and distributed-systems parts of video calls: WebRTC signaling, room state, SFU routing, TURN fallback, reconnects, recording, transcription, meeting memory, and operational debugging.

## Product Angle

Atlas Call should be better than ordinary meeting apps in one focused way: it makes call quality and meeting memory first-class.

The project has three differentiators:

- Network-aware calls with visible quality diagnostics.
- Meeting memory from recordings, transcripts, decisions, action items, and searchable timeline entries.
- Developer/admin debug mode for signaling, ICE, media, reconnects, SFU state, and failure reasons.

## Default Stack

```text
Language:        TypeScript
Runtime:         Bun
Package manager: Bun
API framework:   Hono
Database:        PostgreSQL
Cache/queue:     Redis
Object storage:  MinIO
Realtime:        WebSocket signaling
Media:           mediasoup or LiveKit SFU
NAT traversal:   STUN/TURN
Testing:         bun test
Load testing:    k6 plus call simulators
Containers:      Docker / Docker Compose
Design docs:     DESIGN.md
```

Prefer mediasoup when the goal is deeper backend learning and lower-level control. Prefer LiveKit if the goal is to ship a more production-shaped app faster.

## Project Docs

- [DESIGN.md](DESIGN.md): backend-heavy system design for the realtime video system.
- [MONOREPO.md](MONOREPO.md): repository layout, apps, packages, local infrastructure, and frontend starter usage.
- [CONTEXT.md](CONTEXT.md): project glossary and canonical domain language.
- [docs/adr/](docs/adr/): accepted architectural decisions and trade-offs.

## Core Product

Users create and join rooms. Participants publish audio/video, share screen, mute/unmute, reconnect after network loss, and see room membership state. Calls can be recorded. Recordings feed asynchronous transcription and meeting-memory extraction.

The system includes an admin/debug surface that explains what happened during a call: signaling flow, ICE state, reconnects, SFU node, media quality, recording jobs, and failure reasons.

## Major Capabilities

### Rooms And Participants

- Create rooms.
- Join rooms with a short-lived join token.
- Track participant state.
- Emit durable room events for important state changes.
- Recover state after reconnect.

### WebRTC Signaling

- WebSocket signaling gateway.
- SDP exchange.
- ICE candidate exchange.
- duplicate-safe client retries.
- reconnect with last seen room sequence.

### Media Routing

- 1:1 call first.
- Group calls through an SFU.
- Audio, video, and screen share.
- Quality samples from clients and SFU.

### Network Fallback

- STUN for address discovery.
- TURN relay for difficult networks.
- Metrics for TURN usage and connection failures.

### Recording And Meeting Memory

- Asynchronous recording jobs.
- Recording artifacts in object storage.
- Transcript generation.
- Decisions, action items, and searchable timeline entries.

### Debug And Operations

- Room debug log.
- Participant quality dashboard.
- Signaling event inspection.
- ICE and reconnect visibility.
- SFU node and media session state.

## First Build Target

Start with the realtime spine only:

```text
rooms
participants
WebSocket signaling
1:1 WebRTC call
room events
participant state
reconnect with state snapshot
basic debug log
```

Do not start with recording, transcription, or meeting memory. Those become valuable only after the call lifecycle is solid.
