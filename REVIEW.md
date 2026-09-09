# First substantial version — review

2026-09-09 · local prototype · branch `codex/first-experience`

**Timempathy now has a coherent, working first experience.** It moves from a difference in the scale of lived time toward a similarity in what people might hope for. The interactions, typography, artwork, and privacy behavior have been built and inspected in a real Chromium browser. The public wall remains an honestly labeled imagined installation; public collection has not been enabled.

Open [the local experience](http://127.0.0.1:5173). See [README.md](README.md) for a fresh start.

Representative rendered captures: [opening](docs/screenshots/desktop-hero.png), [the clocks](docs/screenshots/desktop-weight.png), [remembered week](docs/screenshots/desktop-memory-remembered.png), [wall echoes](docs/screenshots/desktop-wall-echo.png), and [mobile reflection](docs/screenshots/mobile-tomorrow.png).

## 1. Interpretation

The project is about making room for another person's experience. A difference in age is a starting point for curiosity, not a prediction about a person. The experience ends with familiar, modest hopes rather than a demand to use life better.

## 2. The experience created

A continuous, freely navigable journey: an opening contour sculpture, two borrowed clocks, an illustrated week that changes in recollection, a private thought about tomorrow, and a wall of imagined hopes across ages. The final research and privacy note explains the boundaries without interrupting the central encounter.

## 3. Major interactions

- **Borrow another clock:** set a starting and borrowed age, or use the age presets. One full circle represents each selected age's life so far. A year takes the same eight seconds in both circles, tracing a different fraction of each. Play, pause, resume, or scrub through months. Reduced motion supplies direct beginning/end controls and the same scrubber.
- **The texture of memory:** change between equal days and one imagined recollection. Familiar mornings compress; visitors can choose to hold any moment, including an ordinary repeated cup.
- **Remembering tomorrow:** write a short private reflection. The optional age is not copied from the clocks. Keep it for the visit, or explicitly choose browser persistence. Remove it without leaving the experience.
- **The Wall of Tomorrows:** encounter 12 authored examples; explore themes; find an echo between two ages. Paired hopes move beside each other and receive an outline and text label. Other notes remain fully readable.

## 4. Visual and emotional decisions

Warm paper, forest ink, and copper carry through the whole experience. Original vector contours suggest material and accumulated traces. Serif type carries the human questions; sans-serif type carries controls and caveats. The dark clock scene creates a change of attention; the paper wall returns to everyday, ordinary language.

There is no soundtrack to startle someone, no scroll hijacking, no forced pacing, no countdown, and no age-related character portrait. Motion is subtle or user initiated and can be stopped. Visual review led to larger supporting type and stronger note metadata contrast.

## 5. Architecture

A static React/TypeScript application built by Vite. Four focused scene components, reusable original SVG artwork, a narrative content module, and a small validated storage boundary. Native fragment navigation and local component state are sufficient. The app requires no secrets or external services. See [README.md](README.md) for the source map.

## 6. Dependencies

React provides composition; Motion handles transitions and reduced-motion preferences; Lucide supplies icons; Zod validates input and storage; Fontsource serves both fonts locally. Vitest, Playwright, axe-core, and Prettier provide testing and source maintenance. Exact versions, license details, and generated runtime notices are recorded in [DEPENDENCIES.md](DEPENDENCIES.md).

## 7. Research

The experience draws cautiously from Wittmann et al. (2015) on age, time perspective, and emotion, and Swallow, Zacks & Abrams (2009) on event boundaries and memory. Neither study validates the `1 / age` visualization or the remembered-week transformation. Those are explicitly marked as mathematical and design metaphors. [RESEARCH.md](RESEARCH.md) records sources and their limits; the application links to the primary papers.

## 8. Experiments and rejected approaches

At the concept stage, an accelerating tunnel was rejected because different simulated speeds would imply unsupported psychological calibration. Remaining-life displays contradicted the emotional brief. A conventional graph was too explanatory on its own.

The first implemented memory scene faded familiar days and the first echo treatment dimmed unrelated notes. Rendered inspection and contrast checks exposed their costs. The refinement retains spatial change and pair outlines while leaving all text readable. A first version also separated later echo pairs by several rows; they now move together so the relationship works on a phone.

These are documented design decisions and real interface revisions, not claims of participant research or unseen prototypes.

## 9. Privacy and moderation

No accounts, analytics, identifiers, or network submissions. One reflection can be explicitly saved on the device, with shared-browser visibility disclosed. Text renders literally, malformed stored data is rejected, and storage failures are not presented as successful persistence or deletion.

The public moderation architecture is designed but not implemented: pending-first submissions, a strictly approved-only read boundary, a human review queue, private moderation records, deletion receipts, abuse controls, and bounded retention. Launch needs an agreed audience, moderation ownership, and external hosting authorization. See [PRIVACY_AND_MODERATION.md](PRIVACY_AND_MODERATION.md).

## 10. Accessibility and verification

The application uses semantic headings, sections, forms, native controls, visible keyboard focus, a working skip link, text equivalents for the clock proportions, live status updates, and no color-only selection. Reduced-motion mode removes the timed requirement; the global pause control also stops active year playback. Text remains readable in both wall and memory states. The mobile memory strip is explicitly presented as horizontally scrollable and remains keyboard accessible.

Verified during this milestone:

- TypeScript strict checking, production build, and 15 unit tests for proportions, invalid ages, reflection validation, corrupt storage, replacement, and removal.
- 28 browser checks across desktop Chromium and a 390px emulated touch viewport: the full journey, synchronized and completed playback, keyboard ages, scrubbing, pause/resume, the memory scene, wall themes and echoes, input validation, literal rendering of HTML-like text, opt-in persistence, reload, deletion and failure states, skip-link navigation, reduced motion, and narrow layout.
- axe-core WCAG A/AA checks in both initial and changed memory/echo states, at desktop and mobile sizes. Initial contrast failures were corrected and rechecked.
- Real rendered screenshots at 1440×960 and 390×844, plus narrow layout checks at 320px. The screenshots were visually reviewed; the work was not judged from source alone.
- Production-preview smoke test across all scenes, private reflection, adjacent echo pairs, and bundled license notices; no external requests or runtime errors. The final wall change was followed by four focused wall/accessibility checks, all passing.
- Dependency advisory audit with no known vulnerabilities reported on 2026-09-09.

Firefox was installed and attempted, but Windows failed before loading any app page: the browser's side-by-side assembly activation could not find `mozglue`, despite `mozglue.dll` being present. This is a browser/runtime startup problem, not a passing Firefox check. The optional `pnpm test:firefox` target remains available for a supported environment. Safari, a physical phone, a screen reader, and participant testing remain unverified.

## 11. Known weaknesses

The clock model is clearer than it is fully embodied: visitors may understand proportional difference without feeling another person's time. A first-to-last-year arc becomes small at older ages, especially on phones; the visible fraction and text description carry the same information. The memory scene is deliberately authored and simple. The wall has no real participants, so its emotional authenticity is limited. English is the only language implemented, and not every interface string has yet been extracted for localization.

The browser stores plain text if explicitly asked. This is not a private vault or multi-device journal. A second open tab does not synchronize removal or edits. JavaScript is required for the experience, though a noscript explanation is provided.

## 12. Open questions

Does the circle metaphor produce a felt difference or mainly a numerical one? Does the imagined week preserve the dignity of routine in different cultural contexts? Does the writing prompt leave enough permission not to write? Is a collectively moderated public wall worth its ongoing responsibilities? These need observation and creator judgment, not more features by default.

## 13. What to explore next

First, observe a few consenting visitors of different ages using the existing version, without explaining what they are supposed to feel. Ask what they noticed and where they felt directed. Then refine the temporal interaction based on those observations. Conduct screen-reader, Safari, and physical-device checks and a full localization pass. Build a moderated public contribution system only when its audience and operational responsibilities are agreed.

## 14. Differences from the original intent

The experience uses a visible proportional metaphor rather than pretending to reproduce another person's internal clock. The wall is collective in its design but synthetic in its current content. Reflections are local and private, with optional age; a real public contribution would follow a separate moderated flow with age required. No sound, AI, or live backend was necessary for this interpretation.

## 15. Does it create temporal empathy?

It plausibly creates the conditions for it. The paired clocks make a difference tangible without claiming authority over anyone's mind. Holding an ordinary moment resists novelty as a moral demand. Similar hopes across ages are the strongest point of recognition: the passage from difference to familiarity gives the experience its emotional shape.

I believe this version is coherent and worth putting in front of people. I cannot yet claim that it changes visitors' intuition: that conclusion requires people, not a passing test suite.
