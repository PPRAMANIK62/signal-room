# Atlas Call Context

Atlas Call is a realtime video calling domain. This glossary defines the project language used across product docs, ADRs, issues, tests, and implementation.

## Language

### Identity And Rooms

**User**:
A person who can create or join rooms.
_Avoid_: Account, actor

**Room**:
A meeting space that contains participants, media sessions, room events, recordings, and meeting memory.
_Avoid_: Call, conference

**Participant**:
A user inside a room, including role, join/leave state, device state, and live session state.
_Avoid_: Member, attendee

**Join token**:
A short-lived credential that allows a user to join a room through the signaling gateway.
_Avoid_: Room password, invite key

### Realtime Control Plane

**Signaling gateway**:
The WebSocket service that coordinates WebRTC setup, room events, participant state, and reconnect recovery.
_Avoid_: Socket server

**Signaling message**:
A control-plane message such as join, offer, answer, ICE candidate, publish track, subscribe track, or participant state change.
_Avoid_: WebRTC message

**Room event**:
A durable, sequenced event for important room changes.
_Avoid_: Log line

**Room sequence**:
A monotonically increasing per-room number used for replay and reconnect recovery.
_Avoid_: Global sequence

**State snapshot**:
The current room state sent to a reconnecting client when event replay is insufficient or unnecessary.
_Avoid_: Dump, sync blob

### Media Plane

**Media plane**:
The path that carries audio, video, and screen-share packets.
_Avoid_: Realtime layer

**Control plane**:
The path that carries room state, permissions, signaling, jobs, and diagnostics.
_Avoid_: Backend

**SFU**:
Selective Forwarding Unit. The media server that receives participant streams and forwards selected streams to other participants.
_Avoid_: Video server

**Producer**:
A participant media track published to the SFU.
_Avoid_: Stream source

**Consumer**:
A participant subscription to a producer track.
_Avoid_: Stream listener

**STUN**:
Service used by clients to discover network address information for NAT traversal.

**TURN**:
Relay service used when direct media connectivity is not possible.

### Quality And Reliability

**Quality sample**:
A point-in-time measurement of media or connection health, such as RTT, jitter, packet loss, bitrate, codec, or ICE state.
_Avoid_: Metric event

**Reconnect window**:
The short period during which a participant can reconnect and recover room state without being treated as a fresh join.
_Avoid_: Grace period

**Slow client**:
A connected client that cannot consume signaling events quickly enough.
_Avoid_: Bad client

**Backpressure**:
The gateway behavior that prevents one slow client from consuming unbounded memory.
_Avoid_: Throttling

### Recording And Meeting Memory

**Recording**:
A durable media artifact produced from a room.
_Avoid_: Video file

**Transcript**:
Text generated from room audio, usually tied to a recording and time ranges.
_Avoid_: Captions

**Meeting memory**:
Derived, searchable artifacts from a room: transcript snippets, decisions, action items, and timeline entries.
_Avoid_: AI summary

**Debug incident**:
A persisted diagnostic record for call setup, reconnect, media quality, SFU, TURN, recording, or worker failures.
_Avoid_: Error log

### Operations

**Vertical slice**:
A user-visible capability delivered across frontend, backend, persistence, tests, and measurement.
_Avoid_: Layer, milestone

**Durable state**:
State that must survive process restarts and can rebuild other views.
_Avoid_: Permanent state

**Ephemeral state**:
State that can expire or be rebuilt through reconnect, heartbeat, or republish flows.
_Avoid_: Temporary cache
