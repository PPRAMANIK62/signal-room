# 0005: Use Redis For Ephemeral Realtime State

## Status

Accepted

## Context

Active sessions, presence, reconnect windows, short-lived room snapshots, and cross-gateway fanout are high-churn and often ephemeral.

## Decision

Use Redis for ephemeral realtime state, TTLs, pub/sub, reconnect windows, rate limits, and queue transport where appropriate.

## Consequences

- Presence and session state can expire naturally.
- Multiple signaling gateways can coordinate.
- Redis loss may disrupt active calls, but durable room metadata remains recoverable from PostgreSQL.
