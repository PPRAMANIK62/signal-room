# 0007: Use Optimistic Concurrency For Document Edits

Date: 2026-06-12

Status: Accepted

## Context

Atlas Desk supports document editing but explicitly does not aim to implement rich text operational transforms or true multiplayer editing. The system still needs to detect stale writes and preserve immutable revision history.

## Decision

Use optimistic concurrency for document edits.

Clients read a document with its `version`. Updates must include `expected_version`. The update succeeds only when the stored version matches the expected version. On success, the service increments `documents.version` and inserts a `document_revisions` row in the same transaction. If the document exists but the version does not match, return `409 Conflict`.

## Consequences

- Concurrent stale edits are detected without implementing realtime collaboration algorithms.
- Revision creation is tied to successful writes.
- The frontend must show a conflict state and require explicit user action before reload or overwrite.
- Tests must cover stale updates, version increments, and immutable revision rows.
