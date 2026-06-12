# 0003: Use Redis For Ephemeral State And Async Work

Date: 2026-06-12

Status: Accepted

## Context

Atlas Desk needs fast, short-lived, and high-throughput state for hot reads, queues, presence, counters, rate limits, and worker coordination. This state should be recomputable or explicitly bounded by failure policies.

## Decision

Use Redis for ephemeral and asynchronous infrastructure:

- hot document cache;
- membership and permission cache;
- Redis Streams as transport for notification, search indexing, attachment, and activity aggregation jobs;
- presence TTLs;
- rate limit counters;
- view and trend counters;
- worker locks or leases where appropriate.

Redis data must not become the only copy of durable business state.

## Consequences

- Cache and queue behavior can be developed locally with Docker Compose.
- Redis failures must have feature-specific degradation rules.
- Reads that can bypass cache should fall back to PostgreSQL.
- Presence can become unavailable without corrupting durable state.
- Duplicate stream jobs are normal; workers must use idempotency keys or durable constraints at the effect boundary.
