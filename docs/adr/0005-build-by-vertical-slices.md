# 0005: Build By Vertical Slices

Date: 2026-06-12

Status: Accepted

## Context

Atlas Desk is meant to teach how features behave across frontend, backend, persistence, background work, and operations. Building by technical layer would create long stretches where code exists but no user-visible behavior proves the design.

## Decision

Build Atlas Desk in vertical slices.

Each slice should deliver a visible workflow across frontend, backend, persistence, tests, and measurement. The first implementation target is intentionally small: users, workspaces, memberships, documents, basic web shell, document listing, document reads, and document creation.

Do not start with realtime, search, recommendations, or workers.

## Consequences

- Every slice should leave the project runnable.
- Each slice should include at least one test and one metric or manual verification step.
- Features should not be implemented backend-only unless they have no user-facing surface.
- Later slices can reuse and challenge earlier source-of-truth, projection, idempotency, and failure-mode decisions.
