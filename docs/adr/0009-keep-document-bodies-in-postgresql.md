# Keep Document Bodies In PostgreSQL

Atlas Desk stores document bodies in PostgreSQL with a 1 MiB UTF-8 body limit rather than moving large bodies to MinIO. This keeps document edits, optimistic version checks, immutable revisions, search projection, and tests simple; MinIO remains reserved for attachments, exports, uploads, and derived previews. If Atlas Desk later needs very large document bodies, that should be treated as a new storage-design decision.
