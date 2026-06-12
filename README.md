# Atlas Desk

A large end-to-end system design project that combines the concepts from the beginner and masterclass project lists into one coherent product.

Atlas Desk is a simplified collaborative knowledge workspace: users create workspaces, write documents, comment, mention teammates, upload attachments, receive notifications, see activity feeds, track presence, search content, and discover active or recommended documents.

Think of it as a small Notion-style workspace with a few Slack/GitHub-style backend mechanics.

## Purpose

This project replaces many small isolated exercises with one larger system that exercises the same concepts together.

It is designed to teach:

- CRUD API design.
- Relational data modeling.
- Pagination and indexing.
- Optimistic concurrency control.
- Caching and cache invalidation.
- Queue-based background work.
- Idempotency.
- Object storage.
- Realtime presence.
- Activity feeds.
- Search projections.
- Counters and trends.
- Recommendations.
- Rate limiting.
- Delayed jobs and cleanup.
- Load testing and failure analysis.

## Default Stack

```text
Language:        TypeScript
Runtime:         Bun
Package manager: Bun
API framework:   Hono
Database:        PostgreSQL
Cache/queue:     Redis
Object storage:  MinIO
Realtime:        Bun/Hono WebSocket support
Testing:         bun test
Load testing:    k6
Containers:      Docker / Docker Compose
Design docs:     DESIGN.md
```

## Frontend Stack

```text
Build tool:      Vite
Runtime:         Bun
Framework:       React
Styling:         Tailwind CSS
UI components:   shadcn/ui
API client:      typed fetch wrapper or generated client
State/data:      TanStack Query
Forms:           React Hook Form + Zod
Realtime:        WebSocket client
Testing:         bun test for shared logic, Playwright later for browser flows
Starter:         https://github.com/PPRAMANIK62/vite-starter-template
```

The frontend is not a marketing site. It is an operator/developer-facing product UI used to verify backend behavior end to end.

## Project Docs

- [DESIGN.md](DESIGN.md): backend-heavy system design.
- [MONOREPO.md](MONOREPO.md): repository layout, apps, packages, local infrastructure, and frontend starter usage.
- [CONTEXT.md](CONTEXT.md): project glossary and canonical domain language.
- [docs/adr/](docs/adr/): accepted architectural decisions and trade-offs.
- [GitHub Issues](https://github.com/PPRAMANIK62/atlas-desk/issues): implementation slices from first runnable tracer bullet to load tests and failure simulations.

## Core Product

Users belong to workspaces. Inside a workspace, they can create documents, edit content, upload attachments, leave comments, mention other users, and follow documents.

The system records activity events, sends notifications through a queue, maintains realtime presence, indexes documents for search, computes trends, and recommends documents based on activity.

## Major Capabilities

### Identity And Workspaces

- Create users.
- Create workspaces.
- Add users to workspaces.
- Assign basic roles: owner, member, viewer.
- Use `X-User-Id` as temporary dev identity before real auth exists.
- Check membership before document actions.

### Documents

- Create, read, update, delete, and list documents.
- Store document title and body in PostgreSQL.
- Limit document bodies to 1 MiB of UTF-8 text.
- Use cursor pagination for workspace document lists.
- Use optimistic `version` checks to prevent stale edits.
- Store immutable document revisions.
- Soft-delete documents before scheduled retention cleanup.

### Comments And Mentions

- Add comments to documents.
- Mention workspace members with `@username`.
- Treat unknown `@username` text as plain comment text.
- Generate mention notification events.
- Paginate comments by creation time.

### Activity Feed

- Append events for document creation, edits, comments, mentions, uploads, and follows.
- List workspace activity with cursor pagination.
- Keep raw activity events separate from derived views.

### Notifications

- Record durable outbox events for mentions, follows, comments, and workspace activity.
- Relay outbox events to Redis Streams for worker processing.
- Process notifications asynchronously.
- Use idempotency keys to prevent duplicate sends.
- Simulate delivery as in-app or email notifications.

### Attachments

- Store attachment metadata in PostgreSQL.
- Store object content in MinIO.
- Use versioned object keys.
- Process uploaded files asynchronously when needed.

### Realtime Presence

- Track user/device presence with Redis TTLs.
- Support online, recently active, and offline states.
- Emit presence transition events.

### Search Projection

- Build a denormalized document search table.
- Update the projection asynchronously after document changes.
- Allow search to lag source-of-truth document changes by up to 10 seconds in normal operation.
- Support basic title/body search and workspace filters.

### Trends And Recommendations

- Track document views and activity counters.
- Aggregate counts by time bucket.
- Compute active documents for a workspace.
- Recommend documents from recent activity, popularity, and membership.

### Rate Limiting

- Add per-user API limits.
- Add stricter limits for write-heavy endpoints.
- During Redis outages, fail open for reads and ordinary low-cost writes but fail closed for abuse-prone writes.

### Scheduled Jobs

- Clean up expired presence state.
- Retry failed notification jobs.
- Rebuild stale search projections.
- Delete old soft-deleted records after a retention window.

## Milestone Plan

Build the system in vertical slices. Each milestone should leave the project runnable and documented.

```text
1. Workspaces, users, memberships, and health checks.
2. Documents CRUD with cursor pagination.
3. Optimistic document edits and immutable revisions.
4. Activity event log.
5. Comments and mentions.
6. PostgreSQL outbox plus Redis-backed notification queue with idempotent worker.
7. MinIO attachments.
8. Realtime presence with TTLs.
9. Search projection.
10. Trends and recommendations.
11. Rate limiting.
12. Scheduled cleanup and retry jobs.
13. k6 load tests and failure simulations.
```

## Measurements

Measure at least one thing per milestone.

Examples:

- P95 latency for document reads.
- P95 latency for workspace document listing.
- Edit conflict correctness.
- Queue lag for notification jobs.
- Search projection delay.
- Cache hit ratio for hot documents or memberships.
- Presence heartbeat throughput.
- Error rate during notification worker retries.
- Top-document aggregation cost.

## Expected Learning

After finishing this project, you should be able to explain:

- What the source of truth is for each feature.
- Which data is a projection.
- What can safely be stale.
- Which operations require idempotency.
- Where retries can duplicate work.
- How background jobs fail and recover.
- Why cursor pagination beats offset pagination at scale.
- How Redis TTLs model ephemeral presence.
- How object storage changes the database design.
- How load tests reveal the first bottleneck.

## Suggested Monorepo Shape

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

  packages/
    shared/
    api-client/
    config/

  infra/
    docker/
    db/
    minio/

  tests/
    e2e/

  load/
```

## First Build Target

Start with the first vertical slice only:

```text
users
workspaces
memberships
documents
basic web shell
document listing
document reads
document creates
```

Do not start with realtime, search, recommendations, or workers. Add those only after the core source-of-truth model is working.
