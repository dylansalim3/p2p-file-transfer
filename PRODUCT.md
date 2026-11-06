# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dylan and the people he sends files and short text messages to, in person on their phones — two devices in the same room, one file or message at a time. (Inferred from the brief and the app's existing flow; Dylan has not named other audiences.)

## Product Purpose

A browser-based peer-to-peer file transfer tool: open the app, start a session, share your link or QR code, the other device connects, and a file or a text message goes straight from one browser to the other over WebRTC — no account, no server holding the file, no upload step. Success is a transfer that completes in seconds with no setup beyond scanning or pasting.

## Positioning

Direct device-to-device transfer in the browser. The connection is the product: your ID and QR code are the address, and the file never passes through a middleman server. (Mechanism as implemented: Trystero 0.26.0 Nostr strategy over WebRTC DataChannel; signalling only — no file data touches a server.)

## Operating Context

- Used on phones, mobile-first, usually in the same room as the recipient.
- The sender starts a session and shares a link or QR; the receiver opens the link (which pre-fills the connect box) or scans the QR.
- One file at a time as a whole Blob; text messages are sent separately and copied to the recipient's clipboard.
- Multiple simultaneous connections are supported.

## Capabilities and Constraints

- Start / stop a peer session; copyable share link; QR code for the session link.
- Connect to another peer by finding it nearby, joining the same short code, or pasting its ID; incoming connections arrive as requests and nothing flows until the other side accepts.
- Send one file (any type, with real send progress) or a text message to a selected connection; received files auto-download; received text is copied to the clipboard.
- Stack: React 19 + TypeScript + Vite, Redux Toolkit, Ant Design 6.7.0, Trystero 0.26.0 (Nostr strategy), BrowserRouter (`/:shareId?` route pre-fills the connect box).
- Live on Cloudflare Pages at https://p2p-file-transfer-dod.pages.dev/ (project `p2p-file-transfer`). GitHub Pages is frozen at the phase-2 build.
- Constraints (Dylan, 2026-11-06): keep Ant Design; keep every existing feature and the Trystero flow exactly; no transport change; no workflow-file changes. Title stays "P2P File Transfer".
- Later work done: device discovery (Phase 4), Cloudflare/BrowserRouter migration (Phase 3).

## Brand Commitments

- Name: "P2P File Transfer".
- Component library: Ant Design — Dylan's standing choice for this app.
- Visual direction (Dylan, 2026-11-06): Maveric Dribbble share-deck — pale sky ground, white deck cards, pill tiles, blue Send / pink Receive. Replaces the 2026-11-06 signal/beam world (warm paper, ink panels, signal teal), which Dylan rejected as too AI slop.

## Evidence on Hand

- Working app in `~/workspace/p2p-file-transfer`, live at https://p2p-file-transfer-dod.pages.dev/ (Cloudflare; Hallmark audit polish, commit 584bc7a).
- Main UI: `src/App.tsx` (393 lines); transport: `src/helpers/transport.ts` (Trystero); state: `src/store/peer/`, `src/store/connection/`, `src/store/discovery/`, `src/store/history/`.

## Product Principles

1. The transfer is the whole job: every screen exists to get a file from this phone to that phone, fast.
2. The QR code is the address: show it large and inline, never buried behind a tap.
3. Status in plain words: a user should always be able to say, in one sentence, whether they are connected and to whom.
4. Nothing leaves the browser except through the peer connection itself.

## Accessibility & Inclusion

Mobile-first touch targets; keyboard-accessible controls; status must not be conveyed by colour alone.
