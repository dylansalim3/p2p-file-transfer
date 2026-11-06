# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dylan and the people he sends files and short text messages to, in person on their phones — two devices in the same room, one file or message at a time. (Inferred from the brief and the app's existing flow; Dylan has not named other audiences.)

## Product Purpose

A browser-based peer-to-peer file transfer tool: open the app, start a session, share your link or QR code, the other device connects, and a file or a text message goes straight from one browser to the other over WebRTC — no account, no server holding the file, no upload step. Success is a transfer that completes in seconds with no setup beyond scanning or pasting.

## Positioning

Direct device-to-device transfer in the browser. The connection is the product: your ID and QR code are the address, and the file never passes through a middleman server. (Mechanism as implemented: PeerJS over WebRTC DataChannel.)

## Operating Context

- Used on phones, mobile-first, usually in the same room as the recipient.
- The sender starts a session and shares a link or QR; the receiver opens the link (which pre-fills the connect box) or scans the QR.
- One file at a time as a whole Blob; text messages are sent separately and copied to the recipient's clipboard.
- Multiple simultaneous connections are supported.

## Capabilities and Constraints

- Start / stop a peer session; copyable share link; QR code for the session link.
- Connect to another peer by pasting its ID; incoming connections are accepted automatically.
- Send one file (any type) or a text message to a selected connection; received files auto-download; received text is copied to the clipboard.
- Stack: React 19 + TypeScript + Vite, Redux Toolkit, Ant Design 6.7.0, PeerJS 1.5.5, HashRouter (`/:shareId?` route pre-fills the connect box).
- Deployed to GitHub Pages (base `/p2p-file-transfer/`); a Cloudflare Pages copy exists at p2p-file-transfer-dod.pages.dev.
- Constraints (Dylan, 2026-11-06): keep Ant Design; keep every existing feature and the PeerJS flow exactly; no transport change; no BrowserRouter migration; no workflow-file changes. Title stays "P2P File Transfer".
- Planned later work (not this redesign): device discovery (Phase 4), Cloudflare/BrowserRouter migration (Phase 3).

## Brand Commitments

- Name: "P2P File Transfer".
- Component library: Ant Design — Dylan's standing choice for this app.
- Visual direction for the 2026-11-06 redesign (Dylan's word: "Distinct"): a signal / direct-beam motif — large QR as the hero, connection shown as signal/status, restyled Ant Design tokens.

## Evidence on Hand

- Working app in `~/workspace/p2p-file-transfer`, live at https://dylansalim3.github.io/p2p-file-transfer/ (Phase 1 dependency upgrades, commit b78eda4).
- Main UI: `src/App.tsx` (197 lines); transport: `src/helpers/peer.ts`; state: `src/store/peer/`, `src/store/connection/`.

## Product Principles

1. The transfer is the whole job: every screen exists to get a file from this phone to that phone, fast.
2. The QR code is the address: show it large and inline, never buried behind a tap.
3. Status in plain words: a user should always be able to say, in one sentence, whether they are connected and to whom.
4. Nothing leaves the browser except through the peer connection itself.

## Accessibility & Inclusion

Mobile-first touch targets; keyboard-accessible controls; status must not be conveyed by colour alone.
