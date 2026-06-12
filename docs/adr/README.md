# Architecture Decision Records

ADRs record accepted decisions that are hard to reverse, surprising without context, or the result of a meaningful trade-off.

## Index

- [0001: Start As A Modular Monolith](0001-start-as-modular-monolith.md)
- [0002: Use PostgreSQL For Source Of Truth](0002-use-postgresql-for-source-of-truth.md)
- [0003: Use Redis For Ephemeral State And Async Work](0003-use-redis-for-ephemeral-state-and-async-work.md)
- [0004: Use MinIO For Blob Storage With PostgreSQL Metadata](0004-use-minio-for-blob-storage-with-postgres-metadata.md)
- [0005: Build By Vertical Slices](0005-build-by-vertical-slices.md)
- [0006: Use The Frontend As A Verification Surface](0006-use-frontend-as-verification-surface.md)
- [0007: Use Optimistic Concurrency For Document Edits](0007-use-optimistic-concurrency-for-document-edits.md)
- [0008: Use A PostgreSQL Outbox Before Redis Streams](0008-use-postgresql-outbox-before-redis-streams.md)
- [0009: Keep Document Bodies In PostgreSQL](0009-keep-document-bodies-in-postgresql.md)
- [0010: Allow Search To Be Stale For Ten Seconds](0010-allow-search-to-be-stale-for-ten-seconds.md)
- [0011: Rate Limits Fail Open Except For Abuse-Prone Writes](0011-rate-limits-fail-open-except-abuse-prone-writes.md)
- [0012: Keep Operational Events Out Of The Activity Feed](0012-keep-operational-events-out-of-activity-feed.md)
- [0013: Use Soft Delete With Retention Cleanup](0013-use-soft-delete-with-retention-cleanup.md)

Open questions live in `DESIGN.md` until accepted. Once accepted, move the decision into an ADR and update the design docs.
