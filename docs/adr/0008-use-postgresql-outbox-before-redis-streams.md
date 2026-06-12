# Use A PostgreSQL Outbox Before Redis Streams

Atlas Desk records durable side effects, such as mention notifications, search indexing requests, attachment processing requests, and activity aggregation requests, in a PostgreSQL outbox inside the same transaction as the source-of-truth write. A relay publishes outbox events to Redis Streams for worker processing. This keeps Redis as the worker transport while making side effects recoverable if the API crashes after committing the domain write but before publishing to Redis.
