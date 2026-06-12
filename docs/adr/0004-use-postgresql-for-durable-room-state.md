# 0004: Use PostgreSQL For Durable Room State

## Status

Accepted

## Context

Room metadata, participant history, room events, recordings, transcripts, and meeting memory must survive process restarts. Redis and live SFU state are not enough to rebuild the system.

## Decision

Use PostgreSQL as the durable source of truth for room state and meeting artifacts.

## Consequences

- Durable room events can support reconnect recovery and audit/debug flows.
- Workers can safely retry based on persisted job and artifact state.
- PostgreSQL is not used for high-frequency media packets or live quality samples unless they are intentionally downsampled.
