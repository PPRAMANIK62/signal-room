# Learning Realtime Video Calls

This project exists partly to learn how realtime video products work. If you are new to calls, WebRTC, SFUs, signaling, NAT traversal, and media quality, start here before diving into implementation details.

Signal Room is full stack, but the learning focus is systems-heavy: how browsers capture media, how peers discover each other, how media travels, how group calls scale, how failures happen, and how the frontend explains all of that to users.

## Mental Model

A video call has two different jobs:

1. Control plane: the app state and coordination layer. This includes rooms, participants, permissions, join tokens, signaling messages, reconnects, recording jobs, debug events, and meeting memory.
2. Media plane: the path that carries audio, video, and screen-share packets. This includes WebRTC media tracks, RTP packets, SFU routing, TURN relay traffic, codecs, bitrate, packet loss, and jitter.

The control plane answers: "Who is in the room, what are they trying to do, and what should the system do next?"

The media plane answers: "How do audio and video packets move from one participant to another with low delay?"

Keeping these separate is one of the most important ideas in this project.

## A Simple 1:1 Call

At a high level, a browser-to-browser call looks like this:

```text
Alice browser
  |
  | 1. capture camera/mic
  |
  | 2. create offer with media/network details
  v
Signal Room signaling gateway
  |
  | 3. pass offer/answer/ICE candidates
  v
Bob browser

Alice browser <==== media packets over WebRTC ====> Bob browser
```

The signaling gateway helps Alice and Bob exchange setup information, but the media packets should not flow through the signaling gateway.

## A Group Call With An SFU

Peer-to-peer works for simple 1:1 calls. Group calls need a different shape because each participant cannot reliably upload separate high-quality video streams to everyone else.

Signal Room should use an SFU for group calls:

```text
Alice media ----\
Bob media -------+--> SFU --> selected streams --> Alice
Charlie media ---+          selected streams --> Bob
Dana media ------/          selected streams --> Charlie
                            selected streams --> Dana
```

An SFU, or Selective Forwarding Unit, receives media from participants and forwards selected streams to other participants. It usually does not mix everyone into one video. It routes packets and can choose different quality layers for different receivers.

## Learning Path

### 1. Browser Media Basics

Learn:

- `getUserMedia`
- audio tracks
- video tracks
- screen-share tracks
- device permissions
- local preview
- mute versus stop track

Why it matters:

Before networking exists, the frontend must correctly capture, preview, mute, stop, and switch local media. A beautiful call UI starts here.

Build first:

- a lobby with camera preview;
- mic/camera permission states;
- device selection;
- local mute/camera toggles.

### 2. WebRTC Connection Basics

Learn:

- `RTCPeerConnection`
- offer and answer
- SDP
- ICE candidates
- connection states
- data channels only after media basics feel clear

Why it matters:

WebRTC gives browsers the machinery for realtime media, but your app still has to coordinate setup. The offer/answer and ICE exchange are where most early confusion lives.

Build first:

- one browser tab calling another local tab;
- visible connection states;
- a small event log for offer, answer, ICE candidates, connected, failed, disconnected.

### 3. Signaling

Learn:

- why signaling is separate from WebRTC media;
- WebSocket room sessions;
- join and leave messages;
- offer/answer relay;
- ICE candidate relay;
- idempotent retries;
- reconnect with last seen sequence.

Why it matters:

Signaling is application-specific. WebRTC does not define your room model, auth model, participant lifecycle, or reconnect behavior. Signal Room owns those decisions.

Build first:

- WebSocket join room;
- participant joined/left events;
- relay offer/answer/ICE;
- reconnect state snapshot.

### 4. NAT Traversal

Learn:

- NAT
- STUN
- TURN
- ICE
- direct path versus relayed path
- why calls work on one network and fail on another

Why it matters:

Most users are behind routers, firewalls, mobile networks, office networks, or campus Wi-Fi. WebRTC needs help discovering usable network paths. STUN helps discover public-facing address information. TURN relays media when direct connectivity fails.

Build first:

- show ICE connection state in the UI;
- show whether TURN was used;
- add a debug panel for candidate types;
- test on different networks when possible.

### 5. SFU Media Routing

Learn:

- SFU
- producer
- consumer
- transport
- RTP
- simulcast
- spatial and temporal layers
- forwarding decisions

Why it matters:

An SFU is the difference between "a demo call" and a scalable group-call architecture. With an SFU, each participant publishes media once, and the SFU forwards selected streams to others.

Build first:

- 1:1 call first;
- then one room with multiple participants through an SFU;
- show producer/consumer state in debug mode;
- show quality samples per participant.

### 6. Quality And Failure

Learn:

- RTT
- jitter
- packet loss
- bitrate
- codec
- frame rate
- resolution
- ICE states
- reconnect storms
- slow clients
- backpressure

Why it matters:

The best differentiator for Signal Room is not just making calls connect. It is making call quality understandable. The frontend should explain when the system is connecting, degraded, reconnecting, recovered, or failed.

Build first:

- quality indicator in the call room;
- participant quality dashboard;
- debug event timeline;
- reconnect banner with recovery reason;
- failure reasons that are useful to a developer.

### 7. Recording And Meeting Memory

Learn:

- recording pipeline
- object storage
- async jobs
- idempotent workers
- transcript artifacts
- timeline entries
- decisions and action items

Why it matters:

Recording and meeting memory are valuable only after the call lifecycle is solid. They add durable artifacts, async failure modes, retries, and post-call product surfaces.

Build later:

- recording job states;
- transcript job states;
- meeting memory timeline;
- searchable transcript;
- retryable failure UI.

## Vocabulary Map

**WebRTC**:
Browser technology for realtime audio, video, and data.

**Peer**:
One endpoint in a WebRTC connection, usually a browser client.

**Offer/answer**:
The negotiation flow where peers exchange what media they want to send/receive and how they can connect.

**SDP**:
Session Description Protocol. Text that describes media capabilities, codecs, tracks, and connection information.

**ICE**:
Interactive Connectivity Establishment. The process WebRTC uses to find a working network path between peers.

**ICE candidate**:
A possible network path a peer can try, such as local network, public address, or TURN relay.

**STUN**:
A service used to discover public-facing network address information.

**TURN**:
A relay service used when direct peer connectivity fails.

**NAT**:
Network Address Translation. A common router/firewall behavior that hides private devices behind public addresses.

**Signaling**:
Your app's setup channel for exchanging offers, answers, ICE candidates, room events, participant state, and reconnect messages.

**Media track**:
An audio, video, or screen-share stream from a browser device or display.

**RTP**:
The packet format commonly used to carry realtime audio/video media.

**Codec**:
The algorithm used to encode/decode audio or video, such as Opus for audio or VP8/H.264/AV1 for video.

**Bitrate**:
How much media data is sent per second.

**Jitter**:
Variation in packet arrival timing. High jitter can make audio/video unstable.

**Packet loss**:
Media packets that never arrive. Packet loss hurts quality, especially audio.

**SFU**:
Selective Forwarding Unit. A media server that receives participant streams and forwards selected streams to others.

**Producer**:
A published media track sent from a participant to the SFU.

**Consumer**:
A participant's subscription to a producer track from the SFU.

**Simulcast**:
Sending multiple quality versions of the same video so the SFU can forward the right layer to each receiver.

## Architecture To Keep In Your Head

```text
Browser app
  |
  | HTTP: create rooms, get metadata, fetch meeting memory
  v
Hono API

Browser app
  |
  | WebSocket: join, signaling, room events, reconnect
  v
Signaling gateway
  |
  +--> Room service
  +--> Redis presence/pubsub
  +--> PostgreSQL durable room events
  +--> SFU control API

Browser app
  |
  | WebRTC media packets
  v
SFU / TURN / peer media path

Workers
  |
  +--> recording
  +--> transcription
  +--> meeting memory
  +--> cleanup
```

The frontend sits across all of this. It is where users see whether the system is ready, connected, degraded, reconnecting, failed, recording, transcribing, or recovered.

## What To Focus On First

Start with the smallest useful call spine:

1. Lobby with camera/mic preview.
2. Create room through HTTP.
3. Join room through WebSocket.
4. Exchange WebRTC offer/answer/ICE.
5. Connect a 1:1 call.
6. Show participant state.
7. Show connection state.
8. Recover room state after reconnect.
9. Add a debug timeline.

Do not start with recording, transcripts, AI summaries, or production-grade scaling. Those are easier to understand after the realtime spine works.

## Questions To Ask While Building

- What state does the browser know?
- What state does the server know?
- What state is durable?
- What state is temporary?
- What messages can be retried safely?
- What happens if the WebSocket disconnects?
- What happens if ICE fails?
- What should the user see while reconnecting?
- What should the debug inspector show to explain the failure?
- What quality signal should be visible in the call room?

## Trusted References

- [MDN: Introduction to WebRTC protocols](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols)
- [MDN: WebRTC connectivity](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity)
- [WebRTC.org: TURN server](https://webrtc.org/getting-started/turn-server)
- [LiveKit: SFU internals](https://docs.livekit.io/reference/internals/livekit-sfu/)
- [mediasoup documentation](https://mediasoup.org/documentation/v3/)
- [mediasoup scalability notes](https://mediasoup.org/documentation/v3/scalability/)
