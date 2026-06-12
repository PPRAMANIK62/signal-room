# Allow Search To Be Stale For Ten Seconds

Atlas Desk treats search as an asynchronous projection that may lag committed document changes by up to 10 seconds in normal operation. Document detail reads from PostgreSQL remain the immediate source of truth. This makes search indexing resilient and worker-driven while giving tests and UI states a concrete freshness target instead of an undefined eventual-consistency promise.
