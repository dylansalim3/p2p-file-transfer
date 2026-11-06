---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Surface brief — P2P File Transfer home

Scope: the single screen at `src/App.tsx` (route `/:shareId?`). Mode: Operate. Audience: Dylan and the person next to him, sending one file or message between two phones.

## Direction contract

THESIS: This screen is a friendly share deck, not a signal instrument. Two phones hand a file to each other across a pale sky, and the interface says so in the concept's own language: a big pill Send, a pink Receive, file rows with names and times, a small drawn exchange. It refuses the discarded beam world's ink panels and teal-on-paper severity, and the generic card-grid default.

OWN-WORLD: Pale sky ground (#D9EAF5, sky tint #A3D0E9), white deck cards with soft offset shadows, heavily rounded (20px cards, pill buttons and tiles). Deep blue #0F6EAA is Send and primary; hot pink #D6336C is the receive direction; green is listening and ready; purple and yellow appear only inside the drawn exchange. Nunito (rounded geometric sans, self-hosted variable woff2) — extra-bold tight headings, small grey-blue body. Mono only for IDs, codes, and timestamps.

STORY: The visitor understands in one glance: this is the phone that shares, tap to send, watch it land. They believe it is easy because the screen looks like the share sheet they already know: a big blue Send, a pink Receive, file rows with names and times. They do: Start, Connect, Send.

FIRST VIEWPORT: Header — avatar circle with the user's initial, bold title, live status pill. Below it, the hero: a white deck card with a soft shadow holding the large QR on white, the session ID in mono, and a blue pill Copy link button; before start, a big blue pill Start session. Then three step cards in the concept's tile language (numbered chips in blue, pink, green): 1 Your code (QR), 2 Connect (nearby/code/link tiles plus the drawn two-phone exchange with its caption), 3 Send (file zone plus message, blue pill Send). History follows as file rows with direction-coloured arrow chips.

FORM: Chosen form: Maveric share-deck (pale sky, pill tiles, Send/Receive pair, file rows) mapped onto the transfer flow. Ordered list: 1) Maveric share-deck (chosen), 2) signal-beam stepper (discarded, the old world), 3) single-column utility with inline QR. seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
