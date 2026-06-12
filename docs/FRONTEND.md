# Signal Room Frontend

Signal Room is systems-heavy, but the frontend should never feel like an afterthought. It should feel like a frontend engineer built it with taste: clean, interactive, composed, and precise.

The goal is not decorative complexity. The goal is a product-grade interface where realtime systems behavior is easy to understand because the design is calm, responsive, and carefully shaped.

## Product Feel

Signal Room should feel:

- polished without feeling precious;
- technical without looking like an internal tool;
- dense where diagnostics need density, spacious where people are on a call;
- responsive in every frequent control;
- calm during failure, reconnect, and degraded-network states;
- visually distinct from a generic dashboard template.

The frontend should carry the craft standard of a strong design engineering project: good defaults, crisp typography, careful spacing, intentional motion, robust empty states, and edge cases handled invisibly.

## Core Surfaces

### Lobby

The lobby is the user's preflight checklist.

It should include:

- room title and join context;
- camera and microphone preview;
- device selection;
- permission prompts and blocked-permission recovery;
- display name or dev identity;
- network readiness and TURN/SFU reachability when available;
- clear join action and disabled states.

The lobby should feel reassuring. Joining a realtime room is a high-trust interaction; the UI should make users feel ready before they enter.

### Call Room

The call room is the main product surface.

It should include:

- participant grid with active-speaker and local-user treatment;
- local media controls for mic, camera, screen share, and leave;
- connection quality indicators that are visible but not noisy;
- reconnect, degraded-network, and recovered states;
- recording state when enabled;
- compact access to debug mode;
- responsive layout for laptop and mobile web.

The call room should prioritize people and media. Diagnostics should be present, but they should not dominate the primary call experience.

### Debug Inspector

The debug inspector is the operational surface.

It should include:

- room event timeline;
- signaling messages and retry state;
- ICE candidate and connection-state history;
- SFU node, producer, and consumer state;
- quality samples with RTT, jitter, packet loss, bitrate, codec, and frame rate;
- reconnect attempts and recovery decisions;
- recording/transcription job state;
- structured failure reasons.

The debug view can be dense, but it should remain readable. Prefer timelines, filters, tabs, disclosure panels, and compact metric rows over raw JSON walls.

### Meeting Memory

Meeting memory is the post-call surface.

It should include:

- recording status and playback entry point;
- transcript generation state;
- searchable transcript and timeline;
- decisions;
- action items;
- failure or retry states for async jobs.

This surface should feel like a useful artifact created from the room, not a backend job viewer.

## Design Principles

### Make Systems Visible

The frontend should expose what the system knows:

- whether the user is connecting, connected, reconnecting, degraded, failed, or recovered;
- whether room state came from event replay or a snapshot;
- whether media is direct, relayed through TURN, or routed through an SFU;
- whether recording, transcription, and meeting-memory jobs are pending, running, failed, or complete.

Do not hide complex state. Translate it into understandable UI.

### Prioritize Frequent Interactions

Mute, camera toggle, screen share, leave, join, and debug open/close should feel instant. These actions are used repeatedly and should not be slowed by ornamental animation.

Use subtle press feedback, immediate state changes, and clear disabled/loading states.

### Design Every State

Every major surface should have designed states for:

- empty;
- loading;
- ready;
- connecting;
- degraded;
- reconnecting;
- failed;
- recovered;
- offline;
- permission blocked.

No important state should fall back to a raw string or unstyled placeholder.

### Keep Motion Purposeful

Motion should explain state, preserve spatial continuity, or provide feedback.

Use:

- short press feedback for controls;
- origin-aware popovers and menus;
- gentle drawer/modal transitions;
- subtle status transitions for reconnect and quality changes;
- reduced motion alternatives.

Avoid:

- `transition: all`;
- slow animations on frequent actions;
- animation from `scale(0)`;
- hover effects on touch devices;
- motion that makes keyboard interactions feel delayed.

### Use Calm Density

The product has a lot of state. The answer is not to make every surface sparse. Instead:

- keep the call room visually calm;
- let debug mode be dense but structured;
- use hierarchy, grouping, and progressive disclosure;
- show summaries first and details on demand;
- avoid table-only interfaces unless comparison is the main task.

## Component Standards

Buttons and pressable controls should:

- have clear hover, active, focus, disabled, loading, and selected states;
- use icons where they improve scanning;
- include accessible labels for icon-only controls;
- respond immediately on press.

Menus, popovers, and tooltips should:

- open from the trigger location;
- have sensible collision behavior;
- avoid slow entrance animations;
- support keyboard navigation.

Status indicators should:

- distinguish healthy, connecting, degraded, failed, and recovered states;
- avoid relying on color alone;
- use concise labels and tooltips for technical detail.

Panels and drawers should:

- preserve context;
- avoid trapping users in dead ends;
- make close and escape behavior predictable;
- remain usable at smaller viewport widths.

## Visual Direction

The visual direction should be refined, modern, and operationally clear. Avoid generic SaaS sameness, overused purple gradients, decorative blobs, and starter-template layouts.

Good directions to explore:

- a restrained dark interface for the call room with crisp media chrome;
- a light, editorial meeting-memory surface for reading and scanning;
- a dense but elegant debug inspector with timeline rhythm and strong type hierarchy;
- subtle signal-inspired visual details that serve state, not decoration.

Typography, spacing, color, and iconography should be chosen deliberately. The interface should look designed before any backend integration is impressive.

## Acceptance Bar

A frontend slice is complete only when:

- the happy path is implemented;
- loading, empty, error, disabled, and recovered states are handled;
- the layout works at laptop and mobile web sizes;
- keyboard and screen-reader basics are covered;
- motion is purposeful and respects reduced motion;
- frequent controls feel immediate;
- the UI exposes the relevant system state;
- the screen looks like part of a coherent product.

If a feature works technically but feels like a backend demo, it is not done.
