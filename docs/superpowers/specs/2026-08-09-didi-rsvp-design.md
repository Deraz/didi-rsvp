# Didi RSVP — Farida's 1st Birthday Website — Design

**Date:** 2026-08-09
**Status:** Approved pending final user review

## Overview

A single-page, sunshine-themed birthday website for Farida's ("Didi's") 1st birthday,
where guests view party details and RSVP. Hosted free on GitHub Pages (static). RSVPs
are stored in a Google Sheet via a Google Apps Script web app. A "secret" admin page on
the same site shows responses after a password check that is validated **server-side by
Apps Script** (playful in tone, but the data read is genuinely gated).

## Party facts (single source of truth: `js/config.js`)

| Key | Value |
|---|---|
| Child | Farida ("Didi"), turning ONE |
| Date & time | Friday 28 August 2026, 6:30 PM Cairo time (`2026-08-28T18:30:00+03:00`) |
| Assumed end time (calendar events) | 9:30 PM (configurable) |
| Venue | Family Park, El Rehab |
| Google Maps | https://maps.app.goo.gl/6SVExxStf4ZbmpAt7 |
| Language | English only |
| Theme | "A little sunshine is turning ONE" / "First trip around the Sun" |

## Architecture

Static site, no build step, no runtime dependencies:

```
didi-rsvp/
├── index.html            # the party page
├── admin.html            # "secret" RSVP dashboard
├── css/styles.css        # theme, layout, animations
├── js/config.js          # party facts, Apps Script URL, photo list
├── js/app.js             # countdown, calendar links, RSVP submit, confetti
├── js/admin.js           # password gate, fetch + render RSVP list
├── apps-script/Code.gs   # backend source (reference copy; runs on Google)
├── assets/               # theme images, hero face, photos/
└── docs/superpowers/specs/  # this document
```

**Backend:** one Google Apps Script web app bound to a Google Sheet in the user's
Drive, deployed as "execute as me / accessible to anyone". One-time manual setup
(~5 min, guided): create sheet → paste `Code.gs` → set password in Script Properties →
deploy → paste the `/exec` URL into `js/config.js`.

## Data model (Google Sheet, one row per RSVP)

| Column | Type | Notes |
|---|---|---|
| Timestamp | ISO datetime | set by Apps Script, not the client |
| Name | string | required |
| Attending | "Yes" / "No" | required |
| Adults | integer ≥ 0 | required when attending; defaults 1 |
| Kids | integer ≥ 0 | required when attending; defaults 0 |
| Wish | string | optional birthday wish for Farida |

Duplicates are allowed (a family may re-submit to correct a mistake); the admin view
lists all rows newest-first so the latest entry per name is easy to spot. No edit/delete
from the site — the sheet itself is the tool for corrections.

## API contract (Apps Script web app)

Both verbs go through the single `/exec` URL. Requests are crafted as CORS
"simple requests" (POST body sent as `text/plain` containing JSON) so no preflight is
needed; Apps Script's response infrastructure permits cross-origin reads.

- **POST** — body `{"name", "attending", "adults", "kids", "wish"}` → validates,
  appends row → `{"ok": true}`. Invalid/missing fields → `{"ok": false, "error": "..."}`.
- **GET** `?action=list&password=...` — password compared against the value in
  **Script Properties** (never present in the repo or the deployed frontend) →
  `{"ok": true, "rows": [...]}` or `{"ok": false, "error": "wrong password"}`.
  Note: HTTP status is always 200 (Apps Script limitation); clients key off `ok`.

## Pages

### `index.html` — the party page

Mobile-first, sections top to bottom:

1. **Hero** — invitation-style: scattered daisies, "A little sunshine is turning" in
   bold spaced marigold caps, then a giant **ONE** where the O is Farida's smiling face
   (circular crop) wearing the lilac party hat; drifting CSS clouds and a peeking
   smiling sun. "FARIDA'S 1ST BIRTHDAY" beneath in warm brown.
2. **Countdown** — live "days : hours : minutes : seconds until Didi turns ONE",
   digits on white cloud-shaped chips. At/after party time it flips to a celebratory
   "It's party time!" state.
3. **Event details** — date, time, venue with two buttons: **Open in Maps** (the share
   link above) and **Add to Calendar** (Google Calendar URL + downloadable `.ics`;
   both embed the venue name as location and the Maps link in the description).
4. **Photo moments** — responsive playful grid of photos from `assets/photos/`,
   listed in `config.js`; section hides itself gracefully if the list is empty.
5. **RSVP form** — name, attending Yes/No (sunny toggle), adults & kids steppers
   (shown only when attending = Yes), birthday-wish textarea, submit button styled as
   a rising sun. Success = confetti burst in theme colors + thank-you message
   (different copy for Yes vs No). Failure = friendly "the sun hid for a second —
   try again" with the form contents preserved.
6. **Footer** — small "made with ☀️ for Farida".

### `admin.html` — the secret dashboard

Not linked from the main page. Password form (playful copy, e.g. "whisper the magic
word"); wrong password shakes. On success (validated by Apps Script): headcount summary
cards (families answered, total adults, total kids, yes/no counts), full table
newest-first, and a "wishes wall" of birthday messages. A refresh button re-fetches.
The password is kept for the session only (`sessionStorage`), so a shared phone
doesn't stay unlocked.

## Visual design

- **Palette:** sunshine yellow `#FFC838` family, warm cream `#FFF6E3`, cloud white,
  marigold/orange headings `#E8842C` family, warm brown text `#6B4A2B` family,
  daisy-pink accents `#E85D8A` family, lilac party-hat accent `#A99BE0` family.
  Exact values tuned against the invitation during implementation.
- **Type (Google Fonts):** Fredoka or Baloo 2 for rounded bold display ("ONE"),
  a warm script (e.g. Caveat/Pacifico family) for flourishes, and a clean caps style
  for details lines — mirroring the invitation's three type voices.
- **Motifs:** cloud-shaped section dividers, sun-ray accents around headings,
  balloon clusters along desktop edges, daisy bullets, ✳ sparkle marks.
- **Motion:** slow-drifting clouds, gentle sun spin on hover, floating balloons,
  confetti on submit — all CSS/vanilla JS, fully disabled under
  `prefers-reduced-motion`.
- **Responsive:** phone-first (most guests arrive via WhatsApp link); layouts scale
  up gracefully to tablet/desktop with the decorative density increasing on wider
  screens. Images sized/compressed for fast mobile loads.

## Error handling

- **Client:** required-field validation before submit; network/HTTP failure shows a
  retry message and preserves input; countdown works entirely offline.
- **Apps Script:** rejects malformed POSTs; wraps handlers in try/catch returning
  `{"ok": false}`; password checked with constant string compare from Script
  Properties.
- **Admin:** wrong password → shake + message; fetch failure → "couldn't reach the
  sunshine servers" retry state.

## Testing

- `curl` tests against the deployed Apps Script: valid POST, malformed POST,
  list with right/wrong password.
- Manual browser pass on mobile-width and desktop-width for every section,
  including reduced-motion mode and the post-party countdown state.
- A local static server (`python -m http.server` or similar) for development.

## Deployment

1. Git repo initialized locally; pushed to the user's GitHub account.
2. GitHub Pages serves from the `main` branch root (public repo).
3. Apps Script deployed once from script.google.com; its `/exec` URL committed in
   `js/config.js` (the URL is safe to publish — writes are open by design, reads
   require the password).

## Out of scope (YAGNI)

Guest edit/delete of RSVPs, email notifications, multiple languages, RSVP deadline
enforcement, analytics, CMS — none needed for a one-day family party.
