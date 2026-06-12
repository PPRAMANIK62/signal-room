# 0006: Use The Frontend As A Verification Surface

Date: 2026-06-12

Status: Accepted

## Context

Atlas Desk needs a frontend so backend behavior can be verified through real workflows instead of only through curl commands or tests. The UI is not intended to be a marketing site or a high-polish commercial product before backend concepts work.

## Decision

Build the frontend as an operator/developer-facing verification surface.

Use Vite, React, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, and Zod. The frontend should make backend correctness and failure behavior visible:

- stale edits show conflict states;
- notifications show pending, delivered, read, and unread states;
- search projection lag is visible in dev-oriented surfaces;
- presence TTL behavior can be observed;
- failed attachment processing shows retryable status;
- rate limits show clear blocked states;
- activity feed ordering and pagination can be verified through the UI.

## Consequences

- UI work is part of backend verification, not decoration.
- Product screens should stay practical and workflow-focused.
- End-to-end flows become easier to test manually and later with Playwright.
- The frontend should not outrun the backend model; it should expose the current slice honestly.
