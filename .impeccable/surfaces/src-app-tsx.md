---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Surface brief — P2P File Transfer home

Scope: the single screen at `src/App.tsx` (route `/:shareId?`). Mode: Operate. Audience: Dylan and the person next to him, sending one file or message between two phones.

## Direction contract

THESIS: This screen is a signal, not a form. The QR code is the address and the hero; the connection is a live beam whose state is said in plain words. It refuses the category default of nested generic cards, a QR hidden in a popover, and two disconnected send boxes.

OWN-WORLD: Warm paper ground (#F6F4EF), near-black ink (#16181D), one signal teal (#0F766E, light signal green on ink) for live/connected, amber for listening/waiting. Thin 1.5px ink borders, 6px radius, flat panels, no gradients, no glass. Mono stack for IDs and status; system grotesque for everything else. A vertical beam line joins the three steps and fills in signal teal as each completes. Signal bars and small arc rings mark connection state, always paired with a word.

STORY: The visitor understands in one glance: scan this code to reach me, paste an ID to reach them, send. They believe the transfer is direct because the screen shows the beam, the peer, and the history of what crossed it. They do: Start, Connect, Send.

FIRST VIEWPORT: Header — title "P2P File Transfer" with a live status pill ("Not started" / "Listening…" / "Connected to …"). Below it, the hero: an ink panel holding a large white QR card with signal arcs, the session ID in mono, and a labelled Copy link button; a single large "Start session" button before start. Then the beam-line stepper: 1 Your signal, 2 Connect, 3 Send. Step 2: ID input + Connect button and a line explaining camera-scan of the other phone's QR. Step 3: one composer card (file zone + message zone, each with its own Send), then a session history list. Primary action is always the next step, full-width on phones, min-height 48px.

FORM: Chosen form: signal-beam stepper with QR hero. Ordered list: 1) signal-beam stepper (chosen), 2) single-column utility with inline QR, 3) radio-console panel. seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
