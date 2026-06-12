# Signal Room

Signal Room is a full-stack realtime video calling system design project.

It is intentionally not another CRUD/productivity app. The purpose is to learn the systems and product parts of video calls end to end: WebRTC signaling, room state, SFU routing, TURN fallback, reconnects, recording, transcription, meeting memory, operational debugging, and the frontend surfaces that make those behaviors usable, observable, and beautiful.

## Product Angle

Signal Room should be better than ordinary meeting apps in one focused way: it makes call quality and meeting memory first-class.

The project has three differentiators:

- Network-aware calls with visible quality diagnostics.
- Meeting memory from recordings, transcripts, decisions, action items, and searchable timeline entries.
- Developer/admin debug mode for signaling, ICE, media, reconnects, SFU state, and failure reasons.

## Frontend Standard

The frontend is not a thin verification shell. It should feel like it was built by a frontend engineer who cares about product taste, interaction details, and visual clarity.

Signal Room should be clean, interactive, and systems-aware: a polished call experience where quality state, reconnect behavior, room membership, media controls, and meeting memory are visible without feeling like an internal admin tool. The UI should have the craft bar of an Emil Kowalski-style design engineering project: crisp defaults, thoughtful motion, precise spacing, responsive controls, and invisible edge-case handling.

Frontend work is part of the core product scope. A feature is not really done until the user-facing or operational UI state makes the underlying system behavior understandable.

## Default Stack

```text
Language:        TypeScript
Runtime:         Bun
Package manager: Bun
API framework:   Hono
Frontend:        React + Vite
Styling:         Tailwind CSS + shadcn/ui
Database:        PostgreSQL
Cache/queue:     Redis
Object storage:  MinIO
Realtime:        WebSocket signaling
Media:           mediasoup or LiveKit SFU
NAT traversal:   STUN/TURN
Testing:         bun test
Load testing:    k6 plus call simulators
Containers:      Docker / Docker Compose
Design docs:     docs/DESIGN.md
```

Prefer mediasoup when the goal is deeper systems learning and lower-level media control. Prefer LiveKit if the goal is to ship a more production-shaped app faster.

## Project Docs

- [docs/DESIGN.md](docs/DESIGN.md): full-stack system design for the realtime video product.
- [docs/LEARNING.md](docs/LEARNING.md): beginner map for calls, WebRTC, signaling, SFU, NAT traversal, quality, and what to learn first.
- [docs/MONOREPO.md](docs/MONOREPO.md): repository layout, apps, packages, frontend, local infrastructure, and testing strategy.
- [docs/FRONTEND.md](docs/FRONTEND.md): frontend product, interaction, motion, and craft standards.
- [CONTEXT.md](CONTEXT.md): project glossary and canonical domain language.
- [docs/adr/](docs/adr/): accepted architectural decisions and trade-offs.

## Local Development

Use the Makefile as the local control surface:

```bash
make help
make up
make logs
```

Run the test suite:

```bash
make test
```

Stop the stack:

```bash
make restart
make down
```

Remove containers and local Docker volumes:

```bash
make clean
```

Default service ports:

- API: `http://localhost:3000`
- Signaling gateway: `http://localhost:3001`
- Web app: `http://127.0.0.1:5173`

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
