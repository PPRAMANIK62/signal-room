# Use Soft Delete With Retention Cleanup

Atlas Desk soft-deletes documents and comments with `deleted_at`, hiding them from normal lists, search, and threads while retaining source-of-truth records, revisions, activity history, notification links, and attachment metadata. Scheduled cleanup may hard-delete eligible soft-deleted data after a retention window. This preserves collaboration history and avoids immediate cascading deletion complexity while still giving the system a path to remove old data.
