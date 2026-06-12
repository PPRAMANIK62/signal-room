# Signal Room Monorepo

This project should be built as a monorepo with one backend API, one signaling gateway, background workers, a first-class frontend app, shared packages, local infrastructure, tests, and load scripts.

The project is full stack. Its center of gravity is systems work, but the frontend is an integral part of the product: it drives real call workflows, exposes room and media state, makes correctness visible beyond curl or tests, and sets a high craft bar for interaction design.

## Stack

### Backend

```text
Language:        TypeScript
Runtime:         Bun
API framework:   Hono
Database:        PostgreSQL
Cache/queue:     Redis
Object storage:  MinIO
Realtime:        WebSocket signaling
Media:           mediasoup SFU
NAT traversal:   STUN/TURN
Testing:         bun test
Load testing:    k6 plus call simulators
Containers:      Docker / Docker Compose
```

### Frontend

```text
Build tool:      Vite
Runtime:         Bun
Framework:       React
Styling:         Tailwind CSS
UI components:   shadcn/ui
Icons:           lucide-react
Data fetching:   TanStack Query
Forms:           React Hook Form + Zod
Realtime:        WebSocket client
Media:           WebRTC browser APIs
Animation:       CSS transitions first; Motion only where it adds real value
Starter repo:    https://github.com/PPRAMANIK62/vite-starter-template
```

## Root Layout

```text
signal-room/
  README.md
  CONTEXT.md

  docs/
    DESIGN.md
    FRONTEND.md
    LEARNING.md
    MONOREPO.md
    adr/
    agents/

  package.json
  bun.lock
  tsconfig.json
  docker-compose.yml
  .env.example

  apps/
    api/
    web/
    signaling/
    worker/

  packages/
    shared/
    api-client/
    config/

  infra/
    docker/
    db/
      migrations/
      seeds/
    minio/
    turn/
    sfu/

  tests/
    e2e/

  load/
  simulators/
```

## App Responsibilities

### apps/api

The Hono HTTP API.

```text
apps/api/
  src/
    index.ts
    app.ts
    config/
      env.ts
    http/
      routes/
      middleware/
    domain/
    application/
    infrastructure/
      db/
        client.ts
        repositories/
      redis/
        client.ts
      storage/
        minio.ts
  tests/
```

Owns:

- room creation and metadata routes.
- join token creation.
- recording and transcript metadata routes.
- meeting memory routes.
- debug summary routes.
- request validation.
- repository adapters.
- API integration tests.

### apps/signaling

The WebSocket signaling gateway.

```text
apps/signaling/
  src/
    index.ts
    server.ts
    sessions.ts
    rooms.ts
    signaling/
      messages.ts
      handlers.ts
      replay.ts
    sfu/
      client.ts
      media-sessions.ts
    infrastructure/
      db/
      redis/
  tests/
```

Owns:

- WebSocket upgrades.
- connection authentication.
- room join and leave.
- SDP and ICE signaling.
- participant state updates.
- reconnect recovery.
- state snapshots.
- slow-client backpressure.
- cross-gateway fanout when more than one gateway exists.

### apps/web

The Vite frontend product surface and verification app.

Start from:

```bash
git clone https://github.com/PPRAMANIK62/vite-starter-template.git apps/web
```

Then adapt it to the monorepo.

```text
apps/web/
  src/
    app/
      routes/
      providers/
      layout/
    components/
      ui/
      primitives/
      layout/
      call/
      debug/
      quality/
      meeting-memory/
      motion/
    features/
      auth-dev/
      rooms/
      signaling/
      media/
      participants/
      recordings/
      transcripts/
      debug/
    lib/
      api.ts
      query.ts
      signaling.ts
      webrtc.ts
      env.ts
    styles/
      globals.css
      tokens.css
  public/
```

Owns:

- room lobby.
- device preflight and permission states.
- call room.
- local camera/mic controls.
- participant grid.
- screen share UI.
- reconnect state.
- quality indicators.
- debug inspector.
- recording/transcript/meeting-memory surfaces.
- empty, loading, error, degraded, recovered, and offline UI states.
- interaction polish, motion rules, focus states, and responsive layout.
- end-to-end verification flows.

The frontend should feel deliberately designed. Avoid generic dashboard energy, default starter-page composition, and UI that exists only to exercise APIs. Every major system feature should have a clear user-facing state and a polished operational/debug state.

### apps/worker

Background workers.

```text
apps/worker/
  src/
    index.ts
    workers/
      recording.worker.ts
      transcription.worker.ts
      meeting-memory.worker.ts
      cleanup.worker.ts
```

Owns:

- recording orchestration.
- artifact upload processing.
- transcription jobs.
- meeting-memory extraction.
- idempotent side effects.
- retry behavior.
- queue lag logging.

## Package Responsibilities

### packages/shared

Shared types and validation schemas.

```text
packages/shared/
  src/
    schemas/
      user.schema.ts
      room.schema.ts
      participant.schema.ts
      signaling.schema.ts
      recording.schema.ts
      debug.schema.ts
    types/
    errors.ts
```

Use this package for types that truly cross app boundaries. Do not put backend repositories or frontend UI code here.

### packages/api-client

Typed frontend API and signaling client helpers.

```text
packages/api-client/
  src/
    client.ts
    rooms.ts
    recordings.ts
    meeting-memory.ts
    debug.ts
    signaling.ts
```

Owns:

- fetch wrapper.
- error mapping.
- request/response types.
- WebSocket signaling client helpers.

### packages/config

Shared TypeScript, lint, and tooling config.

```text
packages/config/
  tsconfig/
  eslint/
```

Only add this once duplicate config becomes annoying.

## Local Infrastructure

The root `docker-compose.yml` should run:

```text
postgres
redis
minio
minio-init
turn
sfu
```

Suggested ports:

```text
API:       3000
Signaling: 3001
Web:       5173
Postgres: 5432
Redis:    6379
MinIO:    9000
Console:  9001
TURN:      3478
```

## Root Scripts

Suggested root scripts:

```json
{
  "scripts": {
    "dev": "bun run --filter '*' dev",
    "dev:api": "bun --cwd apps/api run dev",
    "dev:signaling": "bun --cwd apps/signaling run dev",
    "dev:web": "bun --cwd apps/web run dev",
    "dev:worker": "bun --cwd apps/worker run dev",
    "test": "bun test",
    "infra:up": "docker compose up -d",
    "infra:down": "docker compose down",
    "load": "k6 run load/smoke.js",
    "simulate:calls": "bun run simulators/calls.ts"
  }
}
```

Adjust the exact package commands to match the package manager setup after scaffolding.

## Development Rule

Each vertical slice should include:

```text
Backend route, signaling behavior, or worker behavior
Database, Redis, SFU, TURN, or MinIO change
Frontend screen or UI state
Interaction, loading, empty, error, and recovered states
Shared schema/type updates when needed
Tests
One observable metric or manual verification step
```

Prefer vertical slices that connect the system behavior to a user-facing or operational frontend surface whenever the feature can be observed meaningfully.

## Frontend Product Philosophy

The frontend should be clean, interactive, and product-grade. Signal Room can be systems-heavy without looking like a systems-only project.

Design expectations:

- The lobby should make joining feel intentional: devices, permissions, identity, room context, and readiness are obvious.
- The call room should prioritize media, people, and immediate controls before diagnostics.
- Quality and reconnect state should be visible, but calm.
- Debug mode should be powerful and scannable, with timelines, filters, and structured event detail.
- Meeting memory should feel like a useful artifact, not a raw transcript dump.
- Frequent controls should feel instant; rare flows can carry more expressive transitions.
- Empty/loading/error states should be designed states, not leftover text.
- Responsive layouts should work on laptop and mobile web sizes.
- Accessibility is part of polish: focus rings, keyboard flow, labels, contrast, and reduced-motion behavior matter.

Motion expectations:

- Use transitions for transform, opacity, color, and filter. Avoid `transition: all`.
- Keep frequent UI feedback under 160ms where possible.
- Keep popovers, menus, and small overlays around 150-250ms.
- Use purposeful easing, usually ease-out or a custom ease-out curve for entering UI.
- Never animate keyboard-initiated actions in ways that make the app feel delayed.
- Gate hover-only effects behind pointer/hover media queries.
- Respect `prefers-reduced-motion`.
- Add subtle press feedback to real controls.
- Make popovers and menus feel anchored to their trigger.

## Frontend Verification Philosophy

The frontend should make realtime correctness visible:

- room joins should show participant state clearly;
- reconnects should show recovery or failure reason;
- signaling events should be inspectable in debug mode;
- ICE state should be visible during call setup;
- media quality should show RTT, jitter, packet loss, bitrate, and codec;
- recording jobs should show pending/running/completed/failed state;
- transcript and meeting-memory jobs should show retryable failure state;
- slow-client and gateway backpressure behavior should be testable.

The UI is a real product surface and a verification tool: polished enough to use the system seriously, but not overloaded with decorative product work before the realtime concepts are working.
