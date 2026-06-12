# Atlas Desk Context

Atlas Desk is a collaborative knowledge workspace domain. This glossary defines the project language used across product docs, ADRs, issues, tests, and implementation.

## Language

### Workspace And Identity

**Workspace**:
A collaboration boundary that contains members, documents, activity, and discovery surfaces.
_Avoid_: Tenant, organization

**User**:
A person who can be identified by the system and participate in one or more workspaces.
_Avoid_: Account, actor

**Membership**:
The relationship between a user and a workspace, including the user's role in that workspace.
_Avoid_: Access row, permission entry

**Owner**:
A workspace member who can manage workspace membership and roles and can perform all member actions.
_Avoid_: Admin

**Member**:
A workspace participant who can create, edit, delete, comment on, mention from, upload to, follow, search, and view documents and workspace activity.
_Avoid_: Editor

**Viewer**:
A read-only workspace participant who can read documents, search, view activity, see presence, and follow documents, but cannot write collaboration content or manage members.
_Avoid_: Reader, guest

**Dev identity**:
A temporary authenticated user identity supplied by the `X-User-Id` request header before real authentication exists.
_Avoid_: Mock auth, fake auth

### Documents And Collaboration

**Document**:
An editable workspace knowledge item with title, body, version, author, soft-delete state, and revisions.
_Avoid_: Page, note

**Document body**:
The textual content of a document, stored in PostgreSQL with a product-defined size limit.
_Avoid_: Blob, object body

**Document revision**:
An immutable history entry created by a successful document edit.
_Avoid_: Snapshot, version row

**Expected version**:
The document version supplied by a client when attempting an optimistic edit.
_Avoid_: ETag, revision token

**Comment**:
A document-scoped discussion item created by a workspace member.
_Avoid_: Reply, message

**Mention**:
An `@username` reference to a workspace member from collaboration content.
_Avoid_: Tag

**Follow**:
A user's explicit subscription to future activity for a document.
_Avoid_: Watch, subscribe

**Attachment**:
Workspace-scoped file metadata in PostgreSQL plus object bytes in MinIO.
_Avoid_: Upload record, blob

**Soft delete**:
A deletion state that hides content from normal product surfaces while retaining source-of-truth records for retention, history, and cleanup.
_Avoid_: Archive, trash

**Retention window**:
The period after soft deletion during which data is retained before scheduled hard cleanup may remove it.
_Avoid_: Grace period

### Activity And Notifications

**Activity event**:
An append-only workspace event that represents human-meaningful collaboration history.
_Avoid_: Log line, audit row

**Internal event**:
An operational event used for logs, metrics, retries, projections, diagnostics, or worker coordination rather than the normal workspace activity feed.
_Avoid_: Activity event

**Notification record**:
A durable, user-visible notification created idempotently from queued work.
_Avoid_: Alert, message

**Outbox event**:
A durable PostgreSQL row that records a side effect to be published after the source-of-truth transaction commits.
_Avoid_: Queue job, stream message

**Idempotency key**:
A stable key that makes retries and duplicate jobs safe at the visible effect boundary.
_Avoid_: Dedup key

### Presence, Search, And Discovery

**Presence**:
Per-user, per-device workspace availability state with online, recently active, and offline transitions.
_Avoid_: Status

**Search projection**:
A denormalized document search view updated asynchronously from source-of-truth document changes.
_Avoid_: Search index, read model

**Search staleness window**:
The normal maximum delay before a committed document change appears in search results.
_Avoid_: Eventual delay

**Trending document**:
A document ranked from recent view or activity counters.
_Avoid_: Hot document

**Recommended document**:
A document suggested from recent activity, popularity, and membership context.
_Avoid_: Suggested page

### Operations

**Abuse-prone write**:
A write operation that can create high fan-out, high cost, or spam pressure when repeated.
_Avoid_: Dangerous write

**Vertical slice**:
A user-visible capability delivered across frontend, backend, persistence, tests, and measurement.
_Avoid_: Layer, milestone
