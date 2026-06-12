# Signal Room Design

## Problem

Signal Room is a realtime video calling system for teams that need reliable calls, meeting memory, and deep operational visibility.

The project is not a Google Meet clone. It is a full-stack system design project with a systems-heavy focus and a serious frontend craft bar: signaling, room state, media routing, reconnects, NAT traversal, recording, transcription, observability, failure recovery, and the product UI needed to operate and understand those flows.

## Product Angle

The system should be better than ordinary meeting apps in three focused ways:

1. Network-aware calls that show and react to call quality.
2. Meeting memory through recording, transcript, search, decisions, and action items.
3. Developer/admin debug mode for signaling, ICE, media, reconnect, SFU, and room-state issues.

## Design Goal

Build a realistic full-stack realtime communication system without trying to build a full commercial conferencing company.

Use proven media infrastructure for the media plane. Own the application control plane, signaling, persistence, jobs, observability, frontend workflows, and failure behavior.

The frontend should be treated as a first-class design engineering problem. It should not feel like a backend demo with forms attached. The interaction model, visual hierarchy, motion, and empty/loading/error states should make complex realtime behavior feel calm, legible, and responsive.

## Requirements

### Functional Requirements

- Users can create and join meeting rooms.
- Users can move through a coherent lobby, call room, and post-call meeting-memory experience.
- Participants can publish audio and video.
- Participants can mute, unmute, enable camera, disable camera, and share screen.
- Participants can see room membership and participant state.
- Clients use WebSocket signaling for room joins, SDP exchange, ICE candidates, and participant events.
- Group calls route media through an SFU.
- Rooms support reconnect after transient network loss.
- Clients can recover current room state after reconnect.
- TURN fallback is supported for difficult networks.
- Calls can be recorded.
- Recordings are stored in object storage.
- Transcripts are generated asynchronously.
- Meeting memory stores transcript, decisions, action items, and searchable timeline entries.
- Admin/debug view can inspect room state, participant quality, signaling events, and failure reasons.
- Frontend states make call setup, reconnects, quality changes, recording, transcription, and meeting-memory progress visible.
- Frontend interactions provide polished feedback for frequent actions such as mute, camera, screen share, room join, reconnect, recording, and debug inspection.

### Non-Functional Requirements

- Audio should degrade last; video quality can be reduced before audio is harmed.
- Room state must remain coherent during reconnects and participant churn.
- Signaling must tolerate duplicate and out-of-order client retries.
- Durable meeting metadata must survive process restarts.
- Ephemeral participant state must expire automatically.
- Recording and transcription must run asynchronously.
- System behavior must be measurable under load.
- Local development must run through Docker Compose.
- User-facing interactions must feel responsive under normal local development conditions.
- Motion must clarify state changes without slowing frequent call controls.
- UI states must cover loading, empty, degraded, reconnecting, failed, and recovered paths.

## Non-Goals

- Writing an SFU from scratch.
- Building a production-grade global media network.
- End-to-end encrypted media.
- Calendar integration.
- External OAuth.
- Billing.
- Native mobile apps.
- Perfect AI summaries.
- Multi-region deployment in the first version.

## Architecture

```text
Browser client
  |
  +--> Hono HTTP API
  |
  +--> WebSocket Signaling Gateway
  |       |
  |       +--> Room Service
  |       +--> Redis presence/pubsub/state
  |       +--> PostgreSQL durable metadata
  |
  +--> SFU / Media Server
          |
          +--> TURN / STUN

Workers
  |
  +--> recording jobs
  +--> transcription jobs
  +--> meeting-memory extraction
  +--> cleanup and repair jobs

Object Storage
  |
  +--> recordings
  +--> transcript artifacts
  +--> debug bundles
```

## Frontend Experience Model

The frontend has four primary surfaces:

1. Lobby: preflight camera/mic checks, device selection, participant identity, room metadata, and join readiness.
2. Call room: media grid, local controls, participant state, screen sharing, connection quality, and reconnect feedback.
3. Debug view: signaling timeline, ICE state, SFU/media session state, quality samples, room events, and failure reasons.
4. Meeting memory: recording status, transcript progress, decisions, action items, timeline entries, and searchable artifacts.

The UI should expose systems behavior through product-grade interactions. Reconnect should feel like a recoverable state, not a crash. Quality degradation should be visible without being noisy. Debug details should be inspectable without dominating the normal call experience.

Frontend design principles:

- Product first: build screens that people can actually use, not only developer fixtures.
- Systems visible: surface realtime state, failures, and recovery in understandable language.
- Calm density: keep operational detail scannable without turning every screen into a table.
- Fast feedback: frequent controls should respond immediately and avoid ornamental delay.
- Intentional motion: use short, purposeful transitions for state changes, popovers, drawers, toasts, and call-status changes.
- Accessibility by default: keyboard flow, focus states, contrast, reduced motion, and readable status updates are part of the design.
- Visual taste matters: typography, spacing, color, iconography, and component rhythm should feel designed, not assembled.

## Core Components

### Web App

Owns the user-facing product experience:

- lobby and device preflight
- call room and media controls
- participant grid and active-speaker state
- reconnect and degraded-network feedback
- call quality indicators
- debug inspector and event timeline
- recording, transcript, and meeting-memory surfaces
- empty/loading/error/recovered UI states
- interaction polish and accessibility

### HTTP API

Owns normal request/response workflows:

- create room
- list rooms
- create join token
- get room metadata
- get meeting memory
- get recording metadata
- get debug session summary

### Signaling Gateway

Owns long-lived WebSocket sessions:

- authenticate connection
- join room
- leave room
- exchange WebRTC signaling messages
- track session liveness
- publish participant events
- send state snapshots after reconnect
- enforce room permissions
- protect itself from slow clients

The signaling gateway is control plane only. Media packets should not flow through it.

### Room Service

Owns room state transitions:

- room lifecycle
- participant lifecycle
- active device state
- role and permission checks
- reconnect recovery
- event sequencing
- state snapshot generation

Room state has both durable and ephemeral parts. Durable records live in PostgreSQL. Ephemeral session and presence state live in Redis with TTLs.

### SFU / Media Server

Owns media routing:

- audio/video forwarding
- simulcast or layered video when supported
- screen share forwarding
- participant producer/consumer management
- media stats collection

Use a real SFU such as mediasoup or LiveKit. Prefer mediasoup if the goal is deeper systems learning and lower-level media control.

### TURN / STUN

Owns NAT traversal support:

- STUN for public address discovery
- TURN relay when peer/SFU connectivity fails
- metrics for TURN usage rate

High TURN usage is a cost and quality signal.

### PostgreSQL

Stores durable source-of-truth data:

- users
- rooms
- room participants
- room events
- media sessions
- recordings
- transcripts
- meeting memory artifacts
- debug incidents
- job records where durable leasing is needed

### Redis

Stores ephemeral and high-churn state:

- active WebSocket sessions
- participant presence TTLs
- room membership cache
- pub/sub fanout between gateways
- reconnect windows
- short-lived room state snapshots
- rate limits
- job queues where loss is acceptable or backed by durable records

### Object Storage

Stores large artifacts:

- recording files
- audio extraction files
- transcript JSON
- caption files
- debug bundles

PostgreSQL stores metadata, ownership, state, checksums, and object keys. Object storage stores bytes.

### Workers

Own asynchronous work:

- start and stop recording pipelines
- upload completed recordings
- transcode or extract audio
- generate transcripts
- extract decisions and action items
- build searchable meeting memory
- clean up abandoned rooms and stale media sessions

Workers must be idempotent because retries can happen after process crashes or queue redelivery.

## Source Of Truth And Ephemeral State

```text
Source of truth:
  users
  rooms
  room_participants
  room_events
  media_sessions
  recordings
  transcripts
  meeting_memory
  debug_incidents

Ephemeral state:
  websocket sessions
  live participant presence
  current ICE/signaling attempt
  temporary reconnect tokens
  active producer/consumer handles
  live quality samples

Large artifacts:
  recording files
  transcript files
  debug bundles
```

The system should be recoverable from PostgreSQL plus object storage. Redis and live SFU state can disappear, but active calls may need clients to reconnect and republish media.

## Control Plane vs Media Plane

```text
Control plane:
  HTTP API
  WebSocket signaling
  room state
  permissions
  recording orchestration
  debug events

Media plane:
  RTP media packets
  SFU routing
  TURN relay traffic
  codec, bitrate, simulcast layers
```

Keep this boundary explicit. Most application correctness belongs in the control plane. Most latency and quality problems show up in the media plane.

## Room Event Model

Every durable room change should append a room event with a monotonically increasing room sequence.

Examples:

```text
room.created
participant.joined
participant.left
participant.muted
participant.camera_disabled
participant.screen_share_started
recording.started
recording.completed
transcript.completed
```

Clients reconnect with their last seen room sequence:

```text
client -> signaling gateway: reconnect(room_id, last_seen_seq)
gateway -> client: missed events or state snapshot
```

Ephemeral events such as ICE candidates, typing-like UI hints, and live quality samples do not need durable room events.

## Initial Data Model Sketch

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE room_participants (
  room_id UUID NOT NULL REFERENCES rooms(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  PRIMARY KEY (room_id, user_id)
);

CREATE TABLE room_events (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id),
  seq BIGINT NOT NULL,
  type TEXT NOT NULL,
  actor_id UUID REFERENCES users(id),
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, seq)
);

CREATE TABLE media_sessions (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id),
  user_id UUID NOT NULL REFERENCES users(id),
  sfu_node_id TEXT,
  state TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE recordings (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id),
  status TEXT NOT NULL,
  object_key TEXT,
  checksum TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transcripts (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id),
  recording_id UUID REFERENCES recordings(id),
  status TEXT NOT NULL,
  object_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE meeting_memory (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id),
  kind TEXT NOT NULL,
  text TEXT NOT NULL,
  source_start_ms INTEGER,
  source_end_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Quality And Observability

Collect quality samples from clients and SFU:

- RTT
- jitter
- packet loss
- bitrate
- selected codec
- resolution
- frames per second
- ICE connection state
- TURN usage
- reconnect count
- audio/video mute state

Derived room health should answer:

- Who has bad uplink?
- Who has bad downlink?
- Is the SFU overloaded?
- Is TURN usage unusually high?
- Are reconnects spiking?
- Are slow clients causing gateway backpressure?

## Failure Modes

- Client loses network and reconnects with stale room state.
- WebSocket gateway process dies.
- SFU node crashes during an active room.
- Redis is unavailable.
- TURN is required but unavailable.
- Recording starts but upload fails.
- Transcription worker retries and creates duplicate output.
- Slow client cannot consume signaling events fast enough.
- Reconnect storm overloads the gateway.

## First Build Boundary

The first serious version should stop at:

- HTTP room creation.
- WebSocket join flow.
- 1:1 WebRTC call.
- room events.
- participant state.
- reconnect with state snapshot.
- basic debug event log.

Do not start with meeting memory, recording, or AI features. They belong after the realtime spine works.
