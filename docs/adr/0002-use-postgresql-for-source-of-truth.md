# 0002: Use PostgreSQL For Source Of Truth

Date: 2026-06-12

Status: Accepted

## Context

Atlas Desk needs durable state for workspaces, memberships, documents, revisions, comments, attachments, activity events, and notification records. Several core behaviors depend on relational constraints and transactional correctness, especially workspace authorization, optimistic document edits, immutable revisions, and idempotent notification records.

## Decision

Use PostgreSQL as the source-of-truth database for durable application state.

Source-of-truth tables include:

- `users`
- `workspaces`
- `workspace_memberships`
- `documents`
- `document_revisions`
- `comments`
- `attachments`
- `activity_events`
- `notification_records`

Projection tables such as `document_search` may also live in PostgreSQL, but they are derived state and may be stale.

## Consequences

- Correctness-critical writes can use transactions and constraints.
- Workspace isolation and cross-entity invariants can be enforced close to the data.
- Projections must be treated differently from source-of-truth tables.
- If PostgreSQL is unavailable, source-of-truth reads and writes should fail with `503 Service Unavailable`.
