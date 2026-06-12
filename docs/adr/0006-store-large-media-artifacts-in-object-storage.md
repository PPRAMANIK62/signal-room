# 0006: Store Large Media Artifacts In Object Storage

## Status

Accepted

## Context

Recordings, transcript artifacts, caption files, and debug bundles can become large. Storing them directly in PostgreSQL would make database backups, reads, and writes unnecessarily heavy.

## Decision

Store large artifacts in object storage. Keep metadata, ownership, status, checksum, and object keys in PostgreSQL.

## Consequences

- PostgreSQL remains focused on metadata and source-of-truth records.
- Object storage handles large bytes.
- Workers must handle orphaned objects, failed uploads, and idempotent artifact creation.
