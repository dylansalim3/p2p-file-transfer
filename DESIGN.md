---
name: P2P File Transfer
description: Direct device-to-device file transfer in the browser — the screen is a signal, the QR code is the address.
colors:
  signal: "#0f766e"
  signal-bright: "#2dd4a8"
  signal-soft: "#f0faf7"
  ink: "#16181d"
  ink-soft: "#4a4f57"
  paper: "#f6f4ef"
  line: "#d8d2c4"
  wait: "#92400e"
  danger: "#cf222e"
  card: "#ffffff"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "28px"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.card}"
    rounded: "{rounded.sm}"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.signal}"
  panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  qr-panel:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
---

# Design System: P2P File Transfer

## Overview

**Creative North Star: "The Direct Beam"**

The screen is a signal, not a form. One phone beams a file straight to the phone next to it — no server, no upload — and the interface shows that beam: a large QR code as the address, a vertical line joining three steps that fills in as each one completes, and connection state said in plain words with a signal meter beside it. The world is paper and ink with a single signal teal; the QR hero is the one dark moment on the page, so the brightest thing on screen is always the code someone needs to scan.

The system is restrained on purpose. This is a utility used for thirty seconds at a time, usually standing next to the other person, so every element earns its place by moving the transfer forward: start, connect, send, and a history of what crossed the beam. Nothing decorative competes with the QR code.

**Key Characteristics:**
- Paper ground, ink panels, one signal teal — colour does real jobs (live, listening, done), never decoration.
- Flat panels with thin ink borders; no gradients, no glass, no shadows as decoration.
- Mono type only for IDs, codes, and timestamps — never as a costume.
- Big touch targets (48px minimum), status always paired with a word, never colour alone.

## Colors

One accent on a paper-and-ink ground; the accent means "live signal" everywhere it appears.

### Primary
- **Signal Teal** (#0F766E): The live beam. Primary buttons, completed step dots, the filled beam rail, selected peer rows, "Connected" state. On paper it reads at about 5.7:1.

### Secondary
- **Signal Bright** (#2DD4A8): Signal teal's voice on dark ink — the "Your ID" label, the QR arc rings, the light inside the dark hero panel.

### Tertiary
- **Waiting Amber** (#92400E): The listening state only — the pulsing dot while the session waits for a device. Never used for success or as a general accent.

### Neutral
- **Paper** (#F6F4EF): Page ground.
- **Card White** (#FFFFFF): Panels and the QR card.
- **Ink** (#16181D): Text, panel borders, the QR hero panel, the start panel.
- **Ink Soft** (#4A4F57): Secondary text, hints, timestamps — about 7.5:1 on paper.
- **Beam Line** (#D8D2C4): The unfilled stepper rail, dividers, unselected peer borders.
- **Danger Red** (#CF222E): Stop session only.

### Named Rules
**The One Signal Rule.** Teal means the beam is live. Nothing else on the screen is teal, and nothing live is any other colour except amber while it waits.

## Typography

**Display Font:** System sans stack (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif) — no webfont dependency; the app must work with no network beyond the peer connection.
**Body Font:** Same system sans stack.
**Label/Mono Font:** ui-monospace, SFMono-Regular, Menlo, Consolas, monospace — for peer IDs, session IDs, and timestamps only.

**Character:** A workhorse grotesque with 700 for the title, step titles and step dots, and mono where the content is literally a code.

### Hierarchy
- **Display** (700, 26px, 1.15, -0.02em): The page title, "P2P File Transfer", once per screen.
- **Title** (700, 17px, 1.3): Step titles ("Your signal", "Connect", "Send") and the History heading.
- **Body** (400, 15px, 1.5): Hints, notes, empty states.
- **Label** (400, 13px, mono): Peer IDs and timestamps. The "Your ID" label and the "Or" divider are body face, sentence case, untracked (700, 12px) — changed from tracked uppercase in the Hallmark audit polish (2026-11-06), which overrules the old tracked-caps label voice.

### Named Rules
**The Mono Is Data Rule.** If it is not an ID, a code, or a timestamp, it is not set in mono.

## Layout

A single centred column, max 560px, 16px side padding, generous vertical separation (28–32px between major sections, 12–16px inside groups). The header stacks vertically below 480px so the title never wraps next to the status pill. Steps are a vertical stepper: a 2px rail at 15px from the left joins 32px numbered dots; the rail fills teal from the top as steps complete. On phones the message composer stacks (input above a full-width Send button); the connect row stays horizontal because its input is short.

## Elevation & Depth

Flat by default. Depth is conveyed by ink borders (1.5px) and tonal layering (paper ground, white panels, one ink hero panel), never by shadow. There are no drop shadows anywhere in the system.

### Named Rules
**The Flat-By-Default Rule.** No shadows. A panel that needs emphasis gets a darker ground or a thicker border, not a blur.

## Shapes

Corners are small and consistent: 6px for buttons and inputs, 8px for panels and peer rows, 12px for the ink hero/start panels, 999px only for the status pill and signal dots. Borders are 1.5px solid ink on panels, 1.5px dashed grey on the empty file zone, 2px teal on a selected peer row. The only curves that are not rectangles are the circular step dots, the status dots, and the quarter-arc signal rings drawn around the QR card.

## Components

### Buttons
- **Shape:** 6px radius, min-height 48px, 700 weight.
- **Primary:** Signal teal background, white text; full-width in the start panel and composer.
- **Hover / Focus:** 2px teal focus outline with 2px offset; no hover shadow.
- **Secondary / Ghost:** White "Copy link" button inside the ink hero (ink text on white); "Stop session" is a quiet text button in muted paper on ink.

### Status pill
- **Style:** White pill, 1.5px ink border, 999px radius, 13px semibold text, an 8px dot on the left.
- **State:** Grey dot "Not started"; amber pulsing dot "Listening…"; teal dot "Connected to N devices".

### QR hero panel
- **Style:** Ink background, 12px radius, centred; a white QR card (12px padding, 8px radius) holding a 216px QR code; three thin quarter-arc rings in signal bright at the top-right corner; "Your ID" label in signal bright above the mono ID; full-width Copy link button; quiet Stop session below.

### Stepper
- **Style:** Numbered 32px dots on a 2px rail; done dots are teal with a white check, the current dot is white with a teal ring and number, upcoming dots are grey-ringed. The rail fills teal from the top in proportion to real progress (started 33%, connected 66%, first transfer 100%).

### Peer rows
- **Style:** Full-width buttons, white, 1.5px line-coloured border, 8px radius, 56px min-height; mono peer ID truncated with ellipsis, four signal bars, and the word "Connected" in teal.
- **Selected:** 2px teal border on a pale teal tint (#F0FAF7).

### Inputs / Fields
- **Style:** 48px min-height, 6px radius, 1.5px border; focus is a 2px teal outline.
- **Disabled:** The message Send button is disabled until text is typed; the file Send button is hidden until a file is picked.

### Composer
- **Style:** One white panel holding both send paths: a dashed file zone (solid teal border once a file is picked, showing its name and a Remove link) and, below an "Or" divider, the message input with its Send button. A note underneath states the real behaviour: files auto-download on the other phone, messages are copied to its clipboard.

### History
- **Style:** A plain list under a hairline rule; each row carries a direction arrow (up = sent, down = received) and a type icon (file/message), a label that may wrap to two lines, the peer name in body face, and a mono timestamp. Empty state: one line of secondary text.

## Do's and Don'ts

### Do:
- **Do** keep the QR code the largest, highest-contrast element on the screen.
- **Do** pair every colour-coded state with a word ("Connected", "Listening…").
- **Do** use 48px minimum touch targets for every action.
- **Do** keep send progress honest: a "Sending…" button state, then a history entry — never a faked progress bar (PeerJS reports no byte progress).

### Don't:
- **Don't** hide the QR code behind a tap or a popover.
- **Don't** use mono for anything that is not an ID, code, or timestamp.
- **Don't** add gradients, glass, or shadows to this system.
- **Don't** add a second accent colour — amber is only for waiting, red only for stop.
- **Don't** use an eyebrow/kicker label above a heading.
