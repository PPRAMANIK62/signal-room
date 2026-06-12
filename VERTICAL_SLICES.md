# Vertical Slices

Build Atlas Desk as vertical slices. Each slice should deliver a visible workflow across frontend, backend, persistence, tests, and measurement.

Do not build by technical layer. Build by user-visible capability.

## Slice 0: Monorepo And Local Infrastructure

### Outcome

The project can run locally with a web app, API app, and infrastructure services.

### Backend

- Create `apps/api` with Bun, Hono, TypeScript, and `/health`.
- Create environment loading.
- Add API error response shape.

### Frontend

- Create `apps/web` from `PPRAMANIK62/vite-starter-template`.
- Configure Vite, Tailwind CSS, shadcn/ui, and environment variables.
- Add a minimal shell that calls `/health`.

### Infrastructure

- Add root `docker-compose.yml`.
- Run PostgreSQL, Redis, MinIO, and MinIO bucket initialization.

### Tests And Verification

- `bun test` smoke test for shared config or API health handler.
- Manual browser check: web app shows API health status.

### Concepts

- Monorepo boundaries.
- Local infrastructure.
- Frontend-to-backend connectivity.

## Slice 1: Dev Identity, Workspaces, And Memberships

### Outcome

A user can create or select a workspace and see workspace members.

### Backend

- Add `users`, `workspaces`, and `workspace_memberships`.
- Add routes for creating users, creating workspaces, adding members, and listing members.
- Use `X-User-Id` as temporary dev identity.
- Add membership authorization helper.

### Frontend

- Add dev user switcher.
- Add workspace creation screen.
- Add workspace switcher.
- Add members panel.

### Data

- PostgreSQL source-of-truth tables.
- Seed a few dev users.

### Tests And Verification

- Integration test: non-member cannot access workspace data.
- UI check: switching dev users changes visible workspaces.

### Metric

- Count authorization failures by route.

### Concepts

- Source of truth.
- Access control.
- Basic relational modeling.

## Slice 2: Documents CRUD And Workspace Listing

### Outcome

A member can create, read, update, delete, and list documents inside a workspace.

### Backend

- Add `documents`.
- Add document CRUD routes.
- Add cursor pagination for workspace document list.
- Add `workspace_id, updated_at, id` index.

### Frontend

- Add document list view.
- Add document detail view.
- Add create document dialog or page.
- Add edit and delete actions.
- Show empty, loading, and error states.

### Data

- PostgreSQL `documents`.
- Soft delete with `deleted_at`.

### Tests And Verification

- Integration test: list does not leak documents across workspaces.
- Integration test: cursor pagination returns stable pages.
- UI check: create a document and see it appear at the top.

### Metric

- P95 list latency with 1,000 documents in one workspace.

### Concepts

- CRUD design.
- Pagination.
- Indexing.
- Tenant/workspace isolation.

## Slice 3: Optimistic Edits And Document Revisions

### Outcome

Concurrent edits are detected and successful edits create immutable revisions.

### Backend

- Add `document_revisions`.
- Require `expected_version` for document updates.
- Return `409 Conflict` for stale updates.
- Insert revision in the same transaction as a successful update.

### Frontend

- Show document version in editor state.
- Show conflict screen when update returns `409`.
- Add revision history panel.
- Add reload and overwrite flow only after user confirmation.

### Data

- PostgreSQL transaction for update plus revision insert.
- Unique `(document_id, version)` constraint.

### Tests And Verification

- Integration test: stale update fails.
- Integration test: successful update increments version and inserts revision.
- UI check: open two tabs, edit in both, second stale save shows conflict.

### Metric

- Count edit conflicts.

### Concepts

- Optimistic concurrency.
- Transactional invariants.
- Immutable history.

## Slice 4: Activity Event Log

### Outcome

Workspace actions appear in a paginated activity feed.

### Backend

- Add `activity_events`.
- Append events for document create, update, delete, and revision.
- Add activity feed route with cursor pagination.

### Frontend

- Add activity feed panel.
- Show event type, actor, entity, and timestamp.
- Link document events back to document detail.

### Data

- Append-only activity table.
- Index by `workspace_id, created_at, id`.

### Tests And Verification

- Integration test: document create appends event.
- Integration test: feed pagination is stable.
- UI check: document actions appear in activity feed.

### Metric

- Activity feed query latency.

### Concepts

- Event log.
- Projection-ready event design.
- Cursor pagination.

## Slice 5: Comments And Mentions

### Outcome

Users can comment on documents and mention workspace members.

### Backend

- Add `comments`.
- Add comment create and list routes.
- Parse `@username` mentions.
- Validate mentioned users are workspace members.
- Emit activity events for comments and mentions.

### Frontend

- Add comment thread to document detail.
- Add mention-friendly textarea.
- Highlight mentions.
- Show comment pagination.

### Data

- PostgreSQL comments.
- Mention events in activity log.

### Tests And Verification

- Integration test: comment belongs to same workspace as document.
- Integration test: non-member mention is rejected or ignored by chosen policy.
- UI check: mention appears in activity feed.

### Metric

- Comment creation latency.

### Concepts

- Cross-entity invariants.
- Text parsing.
- Event generation.

## Slice 6: Notification Queue And Inbox

### Outcome

Mentions create notification jobs, workers process them idempotently, and users see notifications in an inbox.

### Backend

- Add `notification_records`.
- Add Redis Stream for notification jobs.
- Enqueue mention notifications.
- Add notification list and mark-read routes.

### Worker

- Consume notification stream.
- Insert notification records with unique idempotency keys.
- Treat duplicate jobs as safe.

### Frontend

- Add notification badge.
- Add notification inbox.
- Show unread/read states.
- Link notification back to document.

### Data

- Redis Stream for jobs.
- PostgreSQL notification records.

### Tests And Verification

- Integration test: duplicate job creates one notification.
- Worker test: retry does not duplicate visible effect.
- UI check: mention one user and see notification in that user's inbox.

### Metric

- Notification queue lag.

### Concepts

- Async processing.
- Idempotency.
- Durable visible effects.
- Queue lag.

## Slice 7: Redis Caching For Hot Reads

### Outcome

Hot document reads and membership checks use Redis cache without changing correctness.

### Backend

- Add document cache.
- Add membership cache.
- Invalidate or refresh document cache after edits and deletes.
- Bypass cache on Redis failure.

### Frontend

- Add subtle cache/debug metadata in dev mode if useful.
- No user-facing product change required.

### Data

- Redis keys:
  - `document:{documentId}`
  - `membership:{workspaceId}:{userId}`

### Tests And Verification

- Test: edit invalidates cached document.
- Test: Redis outage falls back to Postgres for reads.

### Metric

- Cache hit ratio.

### Concepts

- Cache-aside.
- Cache invalidation.
- Stale data boundaries.

## Slice 8: MinIO Attachments

### Outcome

Users can upload attachments to documents and see processing status.

### Backend

- Add `attachments`.
- Add upload route.
- Store bytes in MinIO.
- Store metadata in PostgreSQL.
- Enqueue attachment processing job.

### Worker

- Process attachment job.
- Mark attachment `ready` or `failed`.
- Make processing idempotent.

### Frontend

- Add attachment upload UI.
- Show upload progress where practical.
- Show pending, ready, and failed states.
- Show retry action for failed processing.

### Data

- MinIO object keys:
  - `workspaces/{workspaceId}/attachments/{attachmentId}/original`
  - `workspaces/{workspaceId}/attachments/{attachmentId}/preview`

### Tests And Verification

- Integration test: metadata is source of truth.
- Worker test: duplicate processing does not create inconsistent state.
- UI check: upload file and see it become ready.

### Metric

- Upload latency and processing delay.

### Concepts

- Object storage.
- Metadata vs blob content.
- Async processing.

## Slice 9: Realtime Presence

### Outcome

Users can see who is online, recently active, or offline inside a workspace.

### Backend

- Add WebSocket endpoint.
- Track sessions by user, workspace, and device.
- Store presence heartbeats in Redis with TTL.
- Publish state transitions only.

### Frontend

- Add WebSocket client.
- Add presence indicators in member list and document header.
- Show reconnecting state.

### Data

- Redis keys:
  - `presence:{workspaceId}:{userId}:{deviceId}`

### Tests And Verification

- Test: heartbeat creates online state.
- Test: expired heartbeat transitions to recently active, then offline.
- UI check: two browser sessions show presence changes.

### Metric

- Heartbeats per second.

### Concepts

- TTL state.
- Realtime connection management.
- State transitions.

## Slice 10: Search Projection

### Outcome

Users can search workspace documents through an async projection.

### Backend

- Add `document_search`.
- Enqueue search indexing jobs after document changes.
- Add search endpoint.

### Worker

- Consume indexing jobs.
- Upsert search projection.
- Track projection delay.

### Frontend

- Add search input.
- Add search results page or command palette.
- Show last indexed timestamp in dev mode if useful.

### Data

- PostgreSQL projection table.
- Redis Stream for indexing jobs.

### Tests And Verification

- Integration test: source document update eventually appears in search projection.
- Worker test: duplicate indexing job is safe.
- UI check: edit document title, wait, search new title.

### Metric

- Search projection delay.

### Concepts

- Source of truth vs projection.
- Eventual consistency.
- Async indexing.

## Slice 11: Views, Trends, And Recommendations

### Outcome

The workspace shows active documents and simple recommendations.

### Backend

- Record document view events.
- Aggregate counters by minute or hour bucket.
- Add trending documents endpoint.
- Add simple recommended documents endpoint.

### Frontend

- Add workspace dashboard.
- Show active documents.
- Show recommended documents.
- Show recently viewed documents.

### Data

- Redis counters for live buckets.
- PostgreSQL table for finalized aggregates if needed.

### Tests And Verification

- Test: repeated views increment counters.
- Test: trending endpoint ranks by recent activity.
- UI check: view a document several times and see it rise.

### Metric

- Aggregation cost and query latency.

### Concepts

- Counters.
- Time buckets.
- Ranking.
- Approximate freshness.

## Slice 12: Rate Limiting And Backpressure

### Outcome

The API protects write-heavy endpoints and gives visible feedback when limits are hit.

### Backend

- Add Redis-backed fixed window rate limiter first.
- Apply to comment, upload, and document update routes.
- Decide fail-open/fail-closed policy per route.

### Frontend

- Show rate-limit error message.
- Disable repeated submit briefly after `429`.

### Data

- Redis keys:
  - `rate:{userId}:{route}:{window}`

### Tests And Verification

- Integration test: repeated writes hit `429`.
- Failure test: Redis unavailable follows documented policy.
- UI check: rapid comment submission shows blocked state.

### Metric

- Rate-limited request count.

### Concepts

- Distributed counters.
- Abuse protection.
- Backpressure.

## Slice 13: Scheduler, Retries, And Cleanup

### Outcome

Failed jobs retry, stale projections repair, and old data is cleaned up safely.

### Backend

- Add job status fields where needed.
- Add retry route only for dev/debug if useful.

### Scheduler

- Retry failed notification and attachment jobs.
- Rebuild stale search projection rows.
- Clean up old soft-deleted records after retention.

### Frontend

- Add admin/debug screen for queues and failed jobs.
- Show retry actions in dev mode.

### Data

- PostgreSQL job records if Redis-only state is not enough.
- Retention fields on soft-deleted data.

### Tests And Verification

- Test: failed job becomes retryable.
- Test: cleanup does not remove active data.
- UI check: force failed attachment, retry it.

### Metric

- Retry attempts and final failure count.

### Concepts

- Leases.
- Delayed jobs.
- Operational repair.

## Slice 14: Load Tests And Failure Simulations

### Outcome

The project has repeatable tests for scale pressure and documented bottlenecks.

### Backend

- Add structured logs for route latency and worker lag.
- Add basic metrics endpoint or log-based measurements.

### Frontend

- Add a dev-only diagnostics page if useful.

### Load

Create k6 scripts:

```text
load/smoke.js
load/hot-document.js
load/document-list.js
load/comment-burst.js
load/notification-fanout.js
load/presence-heartbeats.js
load/search.js
```

### Failure Simulations

- Postgres unavailable.
- Redis unavailable.
- MinIO unavailable.
- Duplicate Redis Stream jobs.
- Slow notification worker.
- Hot document reads.
- Reconnect storm for WebSockets.

### Documentation

Add a short postmortem note for each major load test:

```text
What was tested?
What broke first?
What metric showed it?
What design change would help?
What new failure mode would that change introduce?
```

### Concepts

- Load testing.
- Bottleneck discovery.
- Failure-mode reasoning.
- Operational tradeoffs.

## Completion Definition

The project is complete enough when:

- The frontend can exercise every major backend feature.
- Every source-of-truth table has at least one integration test.
- Every async worker has an idempotency test.
- Every major list uses cursor pagination.
- Redis and MinIO failures have documented behavior.
- k6 scripts identify at least three bottlenecks.
- `DESIGN.md` matches the actual implementation decisions.
