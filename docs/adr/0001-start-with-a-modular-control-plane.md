# 0001: Start With A Modular Control Plane

## Status

Accepted

## Context

Signal Room needs HTTP APIs, WebSocket signaling, room state, workers, storage, and diagnostics. Splitting these into many services immediately would add deployment and coordination work before the domain is understood.

## Decision

Start with a modular control plane in one repo and local deployment. Keep boundaries explicit in code, but do not split services until the pressure is real.

## Consequences

- Local development stays simple.
- Room and signaling behavior can evolve quickly.
- Module boundaries must be maintained intentionally.
- Later service extraction remains possible.
