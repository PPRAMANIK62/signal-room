# Atlas Call Monorepo

This project should be built as a monorepo with one backend API, one signaling gateway, background workers, a frontend verification app, shared packages, local infrastructure, tests, and load scripts.

The frontend exists so realtime backend behavior can be verified through real call workflows instead of only through curl or tests.

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
Media:           mediasoup or LiveKit SFU
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
Data fetching:   TanStack Query
Forms:           React Hook Form + Zod
Realtime:        WebSocket client
Media:           WebRTC browser APIs
Starter repo:    https://github.com/PPRAMANIK62/vite-starter-template
```

## Root Layout

```text
atlas-call/
  README.md
  DESIGN.md
  MONOREPO.md

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

The Vite frontend.

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
      call/
      debug/
      quality/
      meeting-memory/
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
  public/
```

Owns:

- room lobby.
- call room.
- local camera/mic controls.
- participant grid.
- screen share UI.
- reconnect state.
- quality indicators.
- debug inspector.
- recording/transcript/meeting-memory surfaces.
- end-to-end verification flows.

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
Shared schema/type updates when needed
Tests
One observable metric or manual verification step
```

Do not build backend-only slices unless the feature has no user-facing or operational surface.

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

The UI is a test harness with dignity: useful enough to operate the system, but not overloaded with product polish before the realtime concepts are working.
