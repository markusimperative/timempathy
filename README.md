# Timempathy

**We share the same clock, but not the same experience of time.**

A contemplative, interactive journey through the weight of a year, the texture of memory, and the ordinary hopes that connect people across ages. This first version is a working **local prototype**, with clearly labeled fictional wall contributions and a private reflection that is never sent to a server.

## Current clock experience

**One year, inside two lives.** A strip introduces the same twelve months, then two segmented circles place that year among five and fifty years already lived. Each piece is one year. The copper play button sits directly beneath the comparison and gives one gentle invitation when it first enters view. The strip and both year segments fill together over eight seconds; visitors can pause, scrub, replay, or change either age. Reduced motion offers an immediate comparison with the same controls.

[Clock comparison in motion](docs/screenshots/desktop-clock-playing.png)

## Current memory experience

The memory chapter is an illustrated paper week. Pull the copper thread between **As it happens** and **Looking back** to fold familiar mornings together. Selecting any day reopens its scene, reveals a small detail, and places a related drawing beside the tomorrow prompt. The choice lasts for the visit and can be released; it never fills in the reflection or gets stored with it.

Native range and button controls support keyboard input. On narrow screens the week can be swiped or moved with arrow buttons. Reduced motion preserves the same choices without timed transitions. The clocks use shared Motion values for smooth year traces. The imagined wall retains its original note-card presentation and adjacent echo pairs.

[Selected memory scene](docs/screenshots/desktop-memory-held.png) · [A moment beside tomorrow on mobile](docs/screenshots/mobile-tomorrow-companion.png)

## Current visual direction

The original paper / forest / copper design is restored following creator review. The [Taste Skill experiment](docs/TASTE_REVIEW.md) remains in Git history; its shared clock animation, local font preloads, native accessible button names, and improved placeholder contrast are retained. The illustrated cards now resize continuously, so choosing or switching a moment keeps the artwork in proportion instead of stretching it while its crop jumps.

## Run

Requires Node.js 22.12+ (tested on 24.19.0) and pnpm 11.19.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:5173](http://127.0.0.1:5173). The server binds to loopback only.

On the dedicated Windows workstation, Node and pnpm are supplied by the Codex runtime. Node is on PATH; use the local launcher when pnpm is not:

```powershell
.\scripts\pnpm.ps1 install --frozen-lockfile
.\scripts\pnpm.ps1 dev
```

No accounts, keys, environment variables, database, or cloud service are needed. Browser persistence is tied to the exact origin; `localhost`, `127.0.0.1`, and a production origin have separate saved thoughts.

## Verify

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm test:production
pnpm format:check
pnpm audit
```

`pnpm inspect` captures the real desktop and mobile render into `.local/screenshots` while the development server is running. `pnpm preview` serves the built application at [localhost:4173](http://127.0.0.1:4173). Browser test failures retain traces in `test-results`; `pnpm exec playwright show-report` opens the test report. Generated output and any local reflection data are not committed.

Firefox is an optional additional target: install it with `pnpm exec playwright install firefox` and run `pnpm test:firefox`. On this workstation the bundled Firefox currently fails at Windows assembly startup before any page loads; see REVIEW.md. Default end-to-end tests cover desktop and mobile Chromium.

## Architecture

Static React + TypeScript application, built with Vite. Component state handles interaction; fragment links handle navigation. No backend or service worker. Assets and fonts are hosted with the app. Production runtime makes no external requests until a visitor deliberately opens one of the research links.

| Location                           | Responsibility                                                         |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `src/components/Artwork.tsx`       | Original SVG contour sculpture and proportional year traces            |
| `src/components/Weight.tsx`        | Shared playback, age controls, scrubbing and pause behavior            |
| `src/components/YearScrubber.tsx`  | Native range and output synchronized with shared Motion progress       |
| `src/components/MemoryArtwork.tsx` | Original layered SVG scenes and portable object drawings               |
| `src/content/moments.ts`           | Authored week and accessible descriptions of its details               |
| `src/components/Memory.tsx`        | Authored memory transformation and visitor-selected moment             |
| `src/components/Tomorrows.tsx`     | Private reflection, wall, themes, cross-age echoes                     |
| `src/content/en.ts`                | Narrative copy and explicitly fictional hopes                          |
| `src/lib/model.ts`                 | Proportions, validation, and one private storage record                |
| `tests/experience.spec.ts`         | Browser journeys, accessibility, privacy boundaries, responsive checks |

The application separates the central narrative from presentation. A full localization pass should extract remaining interface labels and dynamic sentences, introduce locale-aware number formatting, and test longer strings and RTL. English is the only implemented language.

## Project record

- [PROJECT.md](PROJECT.md): the original creative brief, preserved unchanged.
- [DECISIONS.md](DECISIONS.md): why this interpretation and architecture were chosen.
- [RESEARCH.md](RESEARCH.md): primary sources, limitations, and design hypotheses.
- [PRIVACY_AND_MODERATION.md](PRIVACY_AND_MODERATION.md): actual data behavior and the required public-wall architecture.
- [DEPENDENCIES.md](DEPENDENCIES.md): open-source reuse and licenses.
- [REVIEW.md](REVIEW.md): first substantial version, verification, weaknesses, and next exploration.

## Boundaries

This is ready for local review, not for collecting public submissions. The wall examples are invented and are not evidence about any age group. The time model is a visual analogy, never a scientific law. There is no life expectancy calculation, social ranking, analytics, AI interpretation, or automatic publication.

The code remains private/unlicensed pending the creator's choice of a project license. Third-party software retains its own licenses; runtime notices ship in `public/third-party-notices.txt` and are copied into the production build.
