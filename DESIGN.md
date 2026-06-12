# Atlas Desk Design

## Problem

Teams need a shared workspace for writing documents, discussing them, uploading related files, and discovering useful knowledge. The backend must support durable document storage, concurrent edits, activity tracking, notifications, presence, object storage, search, recommendations, and operational measurements.

## Design Goal

Build one system that combines many system design concepts in a realistic way without becoming a full commercial product.

The system should be implemented as a modular monolith first. Components should have clear boundaries, but they should run in one deployable service until there is a real reason to split them.

## Requirements

### Functional Requirements

- Users can join workspaces.
- Users can create, read, update, delete, and list documents.
- Users can edit documents with optimistic concurrency checks.
- Users can view document revision history.
- Users can comment on documents.
- Users can mention other workspace members.
- Users can upload attachments.
- Users can follow documents.
- Users can receive in-app notification records.
- Users can see workspace activity.
- Users can see realtime presence for workspace members.
- Users can search documents.
- Users can see active or recommended documents.

### Non-Functional Requirements

- Durable source-of-truth storage.
- Predictable API errors.
- Cursor pagination for growing lists.
- Idempotent background processing.
- Observable queue lag and request latency.
- Local development through Docker Compose.
- Testable with `bun test`.
- Load-testable with k6.

## Non-Goals

- Rich text operational transforms.
- True multiplayer document editing.
- External OAuth.
- Email provider integration.
- Payment or billing.
- Multi-region deployment.
- Production-grade ranking models.

## Architecture

```text
Clients
  |
  v
Hono HTTP API  <------>  WebSocket gateway
  |
  v
Application services
  |
  +------> PostgreSQL source-of-truth tables
  |
  +------> Redis cache, queues, TTL presence, counters
  |
  +------> MinIO object storage
  |
  v
Workers and scheduler
```

## Core Components

### HTTP API

Owns request validation, auth placeholder handling, route composition, response shape, and error mapping.

### Application Services

Own use cases such as creating documents, editing documents, adding comments, enqueueing notifications, recording activity, and uploading attachments.

### PostgreSQL

Stores durable source-of-truth state:

- Users.
- Workspaces.
- Memberships.
- Documents.
- Document revisions.
- Comments.
- Attachments.
- Activity events.
- Notification records.
- Search projection rows.
- Follow relationships.
- Job records when database-backed leasing is needed.

### Redis

Stores ephemeral and high-throughput state:

- Hot document cache.
- Membership/permission cache.
- Notification queue.
- Search indexing queue.
- Presence TTLs.
- Rate limit counters.
- View counters.
- Time-bucketed trend counters.
- Worker locks or leases where appropriate.

### MinIO

Stores blob content:

- Document exports.
- Attachments.
- Image uploads.
- Derived thumbnails or previews.

PostgreSQL stores object metadata and object keys. MinIO stores bytes.

### Workers

Workers process asynchronous jobs:

- Deliver notification records.
- Update search projections.
- Process attachments.
- Aggregate activity counters.
- Retry failed jobs.

### Scheduler

The scheduler handles delayed or periodic work:

- Retry failed jobs.
- Expire old soft-deleted records.
- Rebuild stale projections.
- Compact old activity summaries.

## Source Of Truth And Projections

```text
Source of truth:
  users
  workspaces
  memberships
  documents
  document_revisions
  comments
  attachments
  activity_events
  notification_records

Projections:
  document_search
  active_document_scores
  cached membership checks
  cached hot documents
  unread notification counts
  trend counters
```

Projections can be stale. Source-of-truth writes must be correct.

## Initial Data Model

### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### workspaces

```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### workspace_memberships

```sql
CREATE TABLE workspace_memberships (
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);
```

### documents

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  author_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX documents_workspace_updated_idx
  ON documents (workspace_id, updated_at DESC, id DESC)
  WHERE deleted_at IS NULL;
```

### document_revisions

```sql
CREATE TABLE document_revisions (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id),
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, version)
);
```

### comments

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  author_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX comments_document_created_idx
  ON comments (document_id, created_at ASC, id ASC)
  WHERE deleted_at IS NULL;
```

### activity_events

```sql
CREATE TABLE activity_events (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  actor_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX activity_workspace_created_idx
  ON activity_events (workspace_id, created_at DESC, id DESC);
```

### notification_records

```sql
CREATE TABLE notification_records (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  idempotency_key TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ
);
```

### attachments

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  document_id UUID REFERENCES documents(id),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  byte_size BIGINT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### document_search

```sql
CREATE TABLE document_search (
  document_id UUID PRIMARY KEY REFERENCES documents(id),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  title TEXT NOT NULL,
  body_preview TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX document_search_workspace_idx
  ON document_search (workspace_id);
```

## API Surface

### Health

```text
GET /health
```

### Users And Workspaces

```text
POST /users
POST /workspaces
POST /workspaces/:workspaceId/members
GET  /workspaces/:workspaceId/members
```

### Documents

```text
POST   /workspaces/:workspaceId/documents
GET    /workspaces/:workspaceId/documents?limit=20&cursor=...
GET    /workspaces/:workspaceId/documents/:documentId
PATCH  /workspaces/:workspaceId/documents/:documentId
DELETE /workspaces/:workspaceId/documents/:documentId
GET    /workspaces/:workspaceId/documents/:documentId/revisions
```

### Comments

```text
POST /workspaces/:workspaceId/documents/:documentId/comments
GET  /workspaces/:workspaceId/documents/:documentId/comments?limit=50&cursor=...
```

### Activity

```text
GET /workspaces/:workspaceId/activity?limit=50&cursor=...
```

### Notifications

```text
GET   /notifications?limit=50&cursor=...
PATCH /notifications/:notificationId/read
```

### Attachments

```text
POST /workspaces/:workspaceId/attachments
GET  /workspaces/:workspaceId/attachments/:attachmentId
```

### Search And Discovery

```text
GET /workspaces/:workspaceId/search?q=...
GET /workspaces/:workspaceId/trending-documents
GET /workspaces/:workspaceId/recommended-documents
```

## Concurrency Design

Document edits use optimistic concurrency.

Clients read a document with `version`. Updates must include `expected_version`.

```sql
UPDATE documents
SET title = $1,
    body = $2,
    version = version + 1,
    updated_at = now()
WHERE id = $3
  AND workspace_id = $4
  AND version = $5
  AND deleted_at IS NULL
RETURNING *;
```

If no row is returned, the service checks whether the document exists. Existing documents with mismatched versions return `409 Conflict`.

The successful update also inserts a `document_revisions` row and an `activity_events` row in the same database transaction.

## Queue Design

Use Redis Streams for asynchronous jobs.

Suggested streams:

```text
notifications.stream
search-index.stream
attachments.stream
activity-aggregate.stream
```

Each job includes:

```json
{
  "job_id": "uuid",
  "idempotency_key": "stable-key",
  "type": "mention_notification",
  "payload": {},
  "created_at": "2026-06-12T00:00:00.000Z"
}
```

Workers must treat duplicate jobs as normal. Idempotency is required at the effect boundary.

## Cache Design

Cache only data that can be safely recomputed:

```text
membership:{workspaceId}:{userId}
document:{documentId}
presence:{workspaceId}:{userId}:{deviceId}
rate:{userId}:{route}:{window}
```

Rules:

- Membership cache may be stale for a short time.
- Document cache must be invalidated or refreshed after edits.
- Presence state is naturally ephemeral.
- Rate limit counters expire by window.

## Object Storage Design

Attachments are stored in MinIO with versioned keys:

```text
workspaces/{workspaceId}/attachments/{attachmentId}/original
workspaces/{workspaceId}/attachments/{attachmentId}/preview
```

The database records the object key, content type, size, owner, status, and related document.

The API never relies on object listing as the source of truth.

## Realtime Presence Design

Presence is tracked per device with Redis TTLs.

```text
presence:{workspaceId}:{userId}:{deviceId} -> last_heartbeat
```

States:

```text
online           heartbeat seen recently
recently_active  heartbeat expired recently, grace window still active
offline          no active or grace state remains
```

Only state transitions should produce pub/sub events.

## Invariants

- A user can only access a workspace they belong to.
- A document belongs to exactly one workspace.
- A comment belongs to the same workspace as its document.
- A document version only increases.
- A document revision is immutable.
- Notification sends are idempotent.
- Object metadata in PostgreSQL is the source of truth for attachments.
- Search results may be stale.
- Activity events are append-only.

## Failure Modes

### Database Unavailable

Source-of-truth reads and writes fail. Return `503 Service Unavailable` for affected API requests.

### Redis Unavailable

Cache, queues, rate limits, counters, and presence degrade. Decide per feature:

```text
document cache    bypass and read Postgres
membership cache  bypass and read Postgres
notifications     fail write or store fallback outbox in Postgres
presence          unavailable
rate limits       fail open for reads, fail closed for abusive writes
```

### MinIO Unavailable

Attachment upload and download fail. Document CRUD should continue.

### Duplicate Jobs

Workers may process the same job more than once. Use idempotency keys and unique constraints around externally visible effects.

### Stale Search

Document updates may not appear in search immediately. The document read API remains correct because PostgreSQL is the source of truth.

### Hot Document

A popular document may create heavy read load. Cache document reads and measure cache hit ratio.

### Notification Fanout Burst

Mentioning many users can create many notification jobs. Track queue lag and worker throughput.

## Metrics

Track:

- Request count by route and status.
- P50/P95/P99 API latency.
- Database query latency.
- Redis operation latency.
- Queue depth and consumer lag.
- Notification delivery attempts and failures.
- Search projection delay.
- Cache hit ratio.
- Presence heartbeat rate.
- Edit conflict count.
- MinIO upload/download latency.

## Test Plan

### Unit Tests

- Cursor encoding and decoding.
- Mention parsing.
- Permission checks.
- Optimistic version conflict logic.
- Idempotency key generation.

### Integration Tests

- Create workspace and add members.
- Create, list, read, update, and delete documents.
- Reject document access for non-members.
- Reject stale document update with `409 Conflict`.
- Insert document revision after successful update.
- Append activity event after document change.
- Create notification record once for duplicate jobs.
- Store attachment metadata after upload.

### Load Tests

Use k6 for:

- Hot document reads.
- Workspace document listing.
- Comment bursts.
- Notification fanout.
- Presence heartbeats.
- Search queries.

## Milestones

### Milestone 1: Workspace Core

- Users.
- Workspaces.
- Memberships.
- Health check.
- Basic permission checks.

### Milestone 2: Documents

- Create, read, update, delete, list.
- Cursor pagination.
- `workspace_id, updated_at, id` index.

### Milestone 3: Versioning

- Optimistic concurrency.
- Immutable document revisions.
- Conflict tests.

### Milestone 4: Activity

- Append activity events.
- Paginated workspace feed.

### Milestone 5: Comments And Mentions

- Comments.
- Mention parsing.
- Notification job enqueue.

### Milestone 6: Notifications

- Redis Stream queue.
- Idempotent worker.
- Notification records.

### Milestone 7: Attachments

- MinIO upload.
- Attachment metadata.
- Async processing status.

### Milestone 8: Realtime Presence

- WebSocket sessions.
- Heartbeats.
- Redis TTL state.
- Presence transitions.

### Milestone 9: Search

- Search projection table.
- Async indexing worker.
- Basic search endpoint.

### Milestone 10: Discovery

- View counters.
- Trending documents.
- Simple recommendations.

### Milestone 11: Protection

- Rate limiting.
- Backpressure decisions.
- Failure simulations.

### Milestone 12: Operations

- k6 scripts.
- Metrics logging.
- Postmortem notes for the first bottlenecks.

## Open Design Questions

- Should notification enqueue happen through Redis Streams directly or through a PostgreSQL outbox first?
- Should document body stay in PostgreSQL forever, or should large bodies move to MinIO later?
- What is the acceptable staleness window for search?
- Should rate limiting fail open or fail closed during Redis outages?
- Which activity events should be user-visible versus internal-only?
