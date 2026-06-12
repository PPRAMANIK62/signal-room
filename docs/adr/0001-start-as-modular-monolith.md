# 0001: Start As A Modular Monolith

Date: 2026-06-12

Status: Accepted

## Context

Atlas Desk is intended to exercise many backend and product-system concepts together: documents, comments, notifications, activity, search, attachments, presence, recommendations, rate limiting, workers, scheduled jobs, and load tests.

Splitting those responsibilities into separate services too early would add deployment, networking, observability, and data-consistency overhead before the product boundaries have proven themselves.

## Decision

Implement Atlas Desk as a modular monolith first.

The system should have clear internal boundaries for HTTP routes, application services, repositories, workers, scheduler jobs, storage, cache, queue, and realtime concerns, but those pieces should run as one deployable backend until there is a concrete reason to split.

## Consequences

- Early development stays simpler and faster.
- Transactional invariants are easier to protect while the data model is still evolving.
- Internal module boundaries still matter; avoid coupling everything through shared global helpers.
- Future service extraction remains possible if a boundary becomes independently scalable or operationally distinct.
