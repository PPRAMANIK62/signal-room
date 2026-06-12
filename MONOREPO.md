# Atlas Desk Monorepo

This project should be built as a monorepo with one backend API, one frontend app, background workers, shared packages, local infrastructure, tests, and load scripts.

The frontend exists so backend behavior can be verified through real user workflows instead of only through curl or tests.

## Stack

### Backend

```text
Language:        TypeScript
Runtime:         Bun
API framework:   Hono
Database:        PostgreSQL
Cache/queue:     Redis
Object storage:  MinIO
Realtime:        Bun/Hono WebSocket support
Testing:         bun test
Load testing:    k6
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
Starter repo:    https://github.com/PPRAMANIK62/vite-starter-template
```

## Root Layout

```text
knowledge-workspace/
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
    worker/
    scheduler/

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

  tests/
    e2e/

  load/
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
    websocket/
      server.ts
      sessions.ts
      presence.ts
    domain/
    application/
    infrastructure/
      db/
        client.ts
        repositories/
      redis/
        client.ts
        cache.ts
        streams.ts
      storage/
        minio.ts
  tests/
```

Owns:

- HTTP routes.
- WebSocket upgrade and session handling.
- Request validation.
- Application services.
- Repository adapters.
- API integration tests.

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
      workspace/
      documents/
      comments/
      activity/
      notifications/
      presence/
    features/
      auth-dev/
      workspaces/
      documents/
      comments/
      activity/
      notifications/
      attachments/
      search/
      discovery/
    lib/
      api.ts
      query.ts
      websocket.ts
      env.ts
    styles/
      globals.css
  public/
```

Owns:

- Workspace navigation.
- Document list and editor screens.
- Comments and mentions UI.
- Activity feed.
- Notification inbox.
- Attachment upload UI.
- Presence indicators.
- Search and discovery screens.
- End-to-end verification flows.

### apps/worker

Background workers.

```text
apps/worker/
  src/
    index.ts
    workers/
      notifications.worker.ts
      search-index.worker.ts
      attachments.worker.ts
      activity-aggregate.worker.ts
```

Owns:

- Redis Stream consumers.
- Idempotent side effects.
- Retry behavior.
- Queue lag logging.

### apps/scheduler

Periodic jobs.

```text
apps/scheduler/
  src/
    index.ts
    jobs/
      retry-failed-jobs.ts
      cleanup-soft-deletes.ts
      rebuild-stale-search.ts
      compact-activity.ts
```

Owns:

- Delayed work.
- Cleanup.
- Projection repair.
- Scheduled simulations.

## Package Responsibilities

### packages/shared

Shared types and validation schemas.

```text
packages/shared/
  src/
    schemas/
      user.schema.ts
      workspace.schema.ts
      document.schema.ts
      comment.schema.ts
      notification.schema.ts
    types/
    errors.ts
    pagination.ts
```

Use this package for types that truly cross app boundaries. Do not put backend repositories or frontend UI code here.

### packages/api-client

Typed frontend API client.

```text
packages/api-client/
  src/
    client.ts
    documents.ts
    workspaces.ts
    comments.ts
    notifications.ts
    attachments.ts
    search.ts
```

Owns:

- Fetch wrapper.
- Error mapping.
- Request/response types.
- WebSocket client helpers if useful.

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
```

Suggested ports:

```text
API:       3000
Web:       5173
Postgres: 5432
Redis:    6379
MinIO:    9000
Console:  9001
```

## Root Scripts

Suggested root scripts:

```json
{
  "scripts": {
    "dev": "bun run --filter '*' dev",
    "dev:api": "bun --cwd apps/api run dev",
    "dev:web": "bun --cwd apps/web run dev",
    "dev:worker": "bun --cwd apps/worker run dev",
    "test": "bun test",
    "infra:up": "docker compose up -d",
    "infra:down": "docker compose down",
    "load": "k6 run load/smoke.js"
  }
}
```

Adjust the exact workspace commands to match the package manager setup after scaffolding.

## Development Rule

Each vertical slice should include:

```text
Backend route or worker behavior
Database or Redis/MinIO change
Frontend screen or UI state
Shared schema/type updates when needed
Tests
One observable metric or manual verification step
```

Do not build backend-only slices unless the feature has no user-facing surface.

## Frontend Verification Philosophy

The frontend should make backend correctness visible:

- stale edits should show a conflict state;
- delayed notifications should show pending/delivered state;
- search projection lag should be visible;
- presence TTL behavior should be visible;
- failed attachment processing should show retryable status;
- rate limits should show a clear blocked state;
- activity feed should prove event ordering and pagination.

The UI is a test harness with dignity: useful enough to operate the system, but not overloaded with product polish before the backend concepts are working.
