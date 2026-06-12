# Rate Limits Fail Open Except For Abuse-Prone Writes

Atlas Desk bypasses Redis-backed rate limiting during Redis outages for reads and ordinary low-cost writes, while failing closed for abuse-prone writes such as comments, mentions, and attachment uploads. This keeps core workspace and document workflows usable when Redis is down, but protects fan-out and expensive paths from spam or accidental overload when the limiter cannot enforce quotas.
