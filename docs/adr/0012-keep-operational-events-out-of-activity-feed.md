# Keep Operational Events Out Of The Activity Feed

Atlas Desk activity feeds show human-meaningful collaboration history, such as document changes, comments, mentions, attachment readiness, follows, and membership changes. Operational events such as search indexing, notification retries, attachment processing retries, cache invalidation, rate-limit hits, and presence heartbeats stay in logs, metrics, or dev/admin diagnostics so the collaboration feed does not become an infrastructure event stream.
