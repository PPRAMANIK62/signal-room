# 0004: Use MinIO For Blob Storage With PostgreSQL Metadata

Date: 2026-06-12

Status: Accepted

## Context

Atlas Desk supports attachments, document exports, image uploads, and derived previews. Blob bytes are not a good fit for regular relational rows, but the application still needs durable metadata, ownership, workspace isolation, processing status, and related document links.

## Decision

Use MinIO for object bytes and PostgreSQL for object metadata.

Store object keys using workspace-scoped, versionable paths such as:

```text
workspaces/{workspaceId}/attachments/{attachmentId}/original
workspaces/{workspaceId}/attachments/{attachmentId}/preview
```

PostgreSQL remains authoritative for object metadata, content type, byte size, owner, status, workspace, and related document.

## Consequences

- MinIO can be run locally through Docker Compose.
- Attachment upload/download can fail independently of document CRUD.
- The API must never rely on object listing as source-of-truth application state.
- Workers can process attachment previews asynchronously and mark status in PostgreSQL.
