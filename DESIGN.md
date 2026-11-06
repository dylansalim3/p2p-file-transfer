---
name: P2P File Transfer
description: Direct device-to-device file transfer in the browser — a friendly share deck on a pale sky.
colors:
  sky: "#d9eaf5"
  sky-tint: "#a3d0e9"
  mist: "#eaf3f9"
  card: "#ffffff"
  ink: "#1b2a38"
  ink-soft: "#5b7285"
  ink-soft-sky: "#42586a"
  line: "#c7d8e5"
  send: "#0f6eaa"
  send-soft: "#e3f0f8"
  receive: "#d6336c"
  receive-soft: "#fce8f0"
  receive-deep: "#b02a5c"
  ready: "#2e7d52"
  ready-soft: "#e2f3e8"
  ready-deep: "#256b45"
  mauve: "#974a63"
  file-purple: "#7c5cbf"
  file-yellow: "#d9a514"
  grey: "#8ba6b4"
typography:
  display:
    fontFamily: "Nunito, ui-rounded, 'SF Pro Rounded', system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Nunito, ui-rounded, 'SF Pro Rounded', system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 800
    lineHeight: 1.3
  body:
    fontFamily: "Nunito, ui-rounded, 'SF Pro Rounded', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  small:
    fontFamily: "Nunito, ui-rounded, 'SF Pro Rounded', system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
  note:
    fontFamily: "Nunito, ui-rounded, 'SF Pro Rounded', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: "Nunito, ui-rounded, 'SF Pro Rounded', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 800
    lineHeight: 1.2
  icon:
    fontFamily: "Nunito, ui-rounded, 'SF Pro Rounded', system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1
  avatar:
    fontFamily: "Nunito, ui-rounded, 'SF Pro Rounded', system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 900
    lineHeight: 1
rounded:
  sm: "12px"
  md: "16px"
  lg: "20px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "28px"
components:
  button-primary:
    backgroundColor: "{colors.send}"
    textColor: "{colors.card}"
    rounded: "{rounded.pill}"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.send}"
  panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  qr-panel:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
---

# Design System: P2P File Transfer

## Overview

**Creative North Star: "The Share Deck"**

Two phones hand a file to each other across a pale sky, and the screen says so in the language of a share sheet: a big pill Send, a pink Receive, file rows with names and times, a small drawn exchange of two phones. The world is copied from Maveric's Dribbble file-sharing concept (pale-blue canvas, pill tiles, Send/Receive pair, file rows), mapped onto the transfer flow — the concept's file manager content (categories, storage gauges) was left behind; this is a transfer tool, not a file manager.

The system is friendly on purpose. This is a utility used for thirty seconds at a time, usually standing next to the other person, so every element earns its place by moving the transfer forward: start, connect, send, and a history of what crossed between the phones. Colour does real jobs: blue is the send direction, pink is the receive direction, green is listening and ready.

**Key Characteristics:**
- Pale sky ground, white deck cards with soft shadows, heavily rounded (20px cards, pill buttons and tiles).
- Deep blue is Send and primary; hot pink is the receive direction; green is listening and ready.
- Nunito, a rounded geometric sans, self-hosted — extra-bold, tightly set headings.
- Mono type only for IDs, codes, and timestamps — never as a costume.
- Big touch targets (48px minimum, 52px for primary actions), status always paired with a word, never colour alone.

## Colors

Two directions on a pale sky ground; each direction owns one colour everywhere it appears.

### Primary
- **Send Blue** (#0F6EAA): The send direction and the primary action. Primary buttons, the Copy link button, the selected peer row, the "Connected" state, step 1's chip. White on it reads at about 5.5:1.

### Secondary
- **Receive Pink** (#D6336C): The receive direction. Received history rows, the incoming-request card, step 2's chip. White on it reads at about 4.6:1. The deep variant (#B02A5C) is the undone step-2 numeral on the pink tint, where the base pink would fail the 4.5:1 floor.
- **Ready Green** (#2E7D52): Listening and ready. The listening dot (pulsing), step 3's chip, the Link method icon. The deep variant (#256B45) is the undone step-3 numeral on the green tint.

### Tertiary
- **Mauve** (#974A63): Stop session only. About 6:1 on white.

### Neutral
- **Sky** (#D9EAF5): Page ground — a lightened tint of the concept's canvas blue.
- **Sky Tint** (#A3D0E9): The concept's canvas blue itself, used for the exchange illustration panel.
- **Mist** (#EAF3F9): Inner tiles and the QR panel ground.
- **Card White** (#FFFFFF): Deck cards and the QR card.
- **Ink** (#1B2A38): Text, a navy ink tinted from the blue world — about 14.6:1 on white.
- **Ink Soft** (#5B7285): Secondary text on white cards — about 5:1 on white. Never on the sky or mist ground, where it falls under the floor.
- **Ink Soft Sky** (#42586A): Secondary text on sky and mist grounds — about 6:1 on sky, 6.6:1 on mist.
- **Sky Line** (#C7D8E5): Dividers, unselected peer borders.
- **File Purple** (#7C5CBF) and **File Yellow** (#D9A514): File-type colours, used only inside the drawn exchange illustration.

### Named Rules
**The Two-Direction Rule.** Blue means out (send), pink means in (receive). Never swap them, and never use either as decoration.
**The Mono Is Data Rule.** If it is not an ID, a code, or a timestamp, it is not set in mono.

## Typography

**Display Font:** Nunito (variable font, weights 400–900), self-hosted at `public/fonts/nunito.woff2` — no external font dependency; the app must work with no network beyond the peer connection. Fallback stack is `ui-rounded, "SF Pro Rounded", system-ui, sans-serif`.
**Body Font:** Same Nunito stack.
**Label/Mono Font:** ui-monospace, SFMono-Regular, Menlo, Consolas, monospace — for peer IDs, session IDs, and timestamps only.

**Character:** A rounded geometric sans with 900 for the page title, 800 for step titles, headings and buttons, and mono where the content is literally a code.

### Hierarchy
- **Display** (900, 26px, 1.15, -0.02em): The page title, "P2P File Transfer", once per screen, beside the avatar circle.
- **Title** (800, 18px, 1.3): Step titles ("Your code", "Connect", "Send") and the History heading.
- **Body** (400, 15px, 1.5): Hints, notes, empty states.
- **Label** (400, 13px, mono): Peer IDs and timestamps. The "Your ID" label is body face, sentence case, 800, 12px in Send blue.
- **Small** (400, 12px, 1.4): Small labels and the via pill. **Note** (400, 14px, 1.5): Notes inside method tiles and the composer. **Button** (800, 16px, 1.2): Button text. **Icon** (17px) and **Avatar** (900, 20px): the method icon chips and the avatar initial.

## Layout

A single centred column, max 560px, 16px side padding, generous vertical separation (16px between step cards, 24px before History). The header is an avatar circle with the user's initial, the bold title, and a status pill; below 480px the pill drops to its own line under the title, aligned with the title text, so the title never squeezes. Steps are white deck cards stacked vertically — no rail, no stepper line. On phones the message composer stacks (input above a full-width Send button).

## Elevation & Depth

Soft shadows carry the depth: deck cards get a small offset plus a soft blur (`0 2px 6px rgba(27,42,56,0.06), 0 12px 28px rgba(27,42,56,0.08)`), tiles a lighter version. No hard offset shadows, no gradients, no glass. A panel that needs emphasis gets a deeper tint or a thicker border, not a blur.

## Shapes

Corners are large and consistent: 12px for step chips and method icon chips, 16px for method tiles, inputs, the QR panel and peer rows, 20px for deck cards and the history card, 999px for buttons, the status pill, the via pill and direction chips. Borders are 1.5px solid sky line on peer rows, 1.5px dashed grey on the empty file zone, 2px send on a selected peer row. The only circles are the avatar, the status dots, the direction chips and the exchange phones' rounded corners.

## Components

### Buttons
- **Shape:** Pill radius (999px), min-height 48px (52px for primary actions), 800 weight.
- **Primary:** Send blue background, white text; full-width in the start panel, the QR panel (Copy link) and the composer.
- **Hover / Focus:** 2px send focus outline with 2px offset; pressed state darkens slightly (brightness 0.96).
- **Secondary:** White pill buttons for Find nearby devices, Join, Decline and Select a file. "Stop session" is a quiet mauve text button under the QR panel.

### Status pill
- **Style:** White pill, 1.5px sky-line border, 999px radius, 13px extra-bold text, an 8px dot on the left, soft tile shadow.
- **State:** Grey dot "Not started"; green pulsing dot "Listening…"; blue dot "Connected to N devices".

### QR hero panel
- **Style:** Mist background, 16px radius, centred; a white QR card (12px padding, 12px radius, soft shadow) holding a 216px QR code; "Your ID" label in Send blue above the mono ID; "Appearing as" and the display name in 800; full-width blue pill Copy link button; quiet mauve Stop session below.

### Step cards
- **Style:** White deck cards, 20px radius, soft shadow. Each opens with a head row: a 32px numbered chip and the step title in 800.
- **Chips:** Step 1 blue, step 2 pink, step 3 green. Undone chips are the deep numeral on the matching tint (deep pink/green pass 4.5:1 where the base colours would not); done chips are solid with a white check.

### Exchange illustration
- **Style:** A drawn SVG inside a sky-tint panel (16px radius): two white phones with blue and pink outlines, a blue arrow curving one way and a pink arrow the other, three small floating file chips in purple, yellow and green. All fills and strokes come from the token block. The arrows nudge gently (one authored motion, disabled under prefers-reduced-motion). Caption below: "The file goes straight across".

### Connect method tiles
- **Style:** Mist tiles, 16px radius, one per method: Nearby devices (blue radar icon chip), Join with a code (pink key icon chip), Paste an ID or link code (green link icon chip). Notes inside the tiles use Ink Soft Sky for contrast on mist.

### Peer rows
- **Style:** Full-width buttons, white, 1.5px sky-line border, 16px radius, 56px min-height. Stacked: the peer name and a via pill on top, the short mono ID and the state word below — so a name never gets squeezed at 390px.
- **Selected:** 2px Send border on a pale blue tint (#E3F0F8). Disabled (request sent): mist background, not-allowed cursor.

### Inputs / Fields
- **Style:** 52px min-height, 16px radius, 1.5px border; focus is a 2px Send outline. Placeholders use Ink Soft (#5B7285, 5:1 on white) via the `colorTextPlaceholder` token.
- **Disabled:** The message Send button is disabled until text is typed; the file Send button is hidden until a file is picked.

### Composer
- **Style:** Inside the Send step card: a dashed file zone on mist (solid Send border and Send-soft ground once a file is picked, showing its name, a blue pill Send file button, real progress, and a Remove link) and, below an "Or" divider, the message input with its blue pill Send button. A note underneath states the real behaviour: files auto-download on the other phone, messages are copied to its clipboard.

### History
- **Style:** A white deck card (20px radius, soft shadow) holding the rows; each row carries a direction chip (blue circle with an up arrow for sent, pink circle with a down arrow for received), a type icon (file/message), a label that may wrap to two lines, the peer name in body face, and a mono timestamp. Below 480px each row restacks: the label takes the full first line, peer and time sit on a second line, so a long filename stays readable. Empty state: one line of secondary text in its own deck card.

## Do's and Don'ts

### Do:
- **Do** keep the QR code the largest, highest-contrast element on the screen.
- **Do** pair every colour-coded state with a word ("Connected", "Listening…").
- **Do** use 48px minimum touch targets for every action (52px for primary).
- **Do** keep send progress honest: a real percentage from the transport, then a history entry.
- **Do** keep the exchange illustration drawn from tokens — every fill and stroke is a `var()`.

### Don't:
- **Don't** hide the QR code behind a tap or a popover.
- **Don't** use mono for anything that is not an ID, code, or timestamp.
- **Don't** add gradients, glass, or hard offset shadows to this system.
- **Don't** swap the two directions — blue is always out, pink is always in.
- **Don't** add a file manager to this screen — no categories, no storage gauges; this is a transfer tool.
- **Don't** use an eyebrow/kicker label above a heading.
