create table if not exists users (
  id text primary key,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists rooms (
  id uuid primary key,
  title text not null,
  status text not null default 'empty',
  created_by_user_id text not null references users(id),
  created_at timestamptz not null default now()
);

create table if not exists room_events (
  id bigserial primary key,
  room_id uuid not null references rooms(id),
  sequence integer not null,
  type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (room_id, sequence)
);

create index if not exists room_events_room_sequence_idx
  on room_events (room_id, sequence);
