# Timempathy

**We share the same clock, but not the same experience of time.**

[Visit Timempathy](https://timempathy.markmathew.com/)

A contemplative, interactive journey through the weight of a year, the texture of memory, and the ordinary hopes that connect people across ages. The experience supports private reflection and an optional shared Wall, hosted on Cloudflare Workers + D1. A visitor can offer a hope, encounter another age, and borrow the clock beside those words. Only explicitly shared hopes reach the server; keeping a thought private sends none of its words there.

## Current clock experience

**Borrow another clock.** Two light rings hold five and fifty years already lived. A highlighted arc shows one year; fine ticks mark the years. Each age slider sits beneath its own clock, with a small row of quick age choices below the pair. One shared scrubber and the final copper play button control the eight-second passage. Changing an age now holds the elapsed months in place while the arc changes shape. A faint trace of the previous share lingers briefly, then clears; scrubbing or still mode clears it immediately. The “one year / in both lives” arrow exchanges the two ages without advancing the year. The labels remain centered. Reduced motion offers an immediate comparison. “About this lens” follows as a separate section explaining the proportion before the memory chapter.

The chapter is sized against real viewports, including a 1366 × 768 laptop and a 320 × 568 phone. Its title, clocks, controls, and final action fit together. Enlarged text and unusual aspect ratios can still scroll naturally; content is never clipped to force a fit.

[Clock comparison in motion](docs/screenshots/desktop-clock-playing.png)

## Current memory experience

The memory chapter is an illustrated paper week. Open an ordinary moment, then pull the copper thread toward **Looking back**: the paper week becomes physically shorter. Days you opened draw closer together more gently and keep their ink clear; the currently held moment stays expanded. Exploring all seven days still leaves a visible difference between the week and its recollection. Ink on the folded impressions softens into their existing paper grain; opened moments stay clear. This material change reverses with the fold control. Releasing a day leaves its place in this recollection, and **As it happens** opens the full week again. Before any choice, the original familiar-morning fold remains as an authored example. The currently held day still carries its drawing into tomorrow. These explicit choices last only for the visit; there is no reading-time measurement or stored interaction record.

Native range and button controls support keyboard input. On narrow screens the week can be swiped or moved with arrow buttons. Reduced motion preserves the same choices without timed transitions. The clocks use shared Motion values for smooth year traces. The paper artwork keeps its proportions while it contracts; titles scale with each fold.

[Selected memory scene](docs/screenshots/desktop-memory-held.png) · [A moment beside tomorrow on mobile](docs/screenshots/mobile-tomorrow-companion.png)

## Current Wall experience

A reflection begins privately. **Offer it to the Wall** opens a separate choice explaining who can read it, the seven-day lifetime, and removal. After the visitor supplies an age and explicitly agrees, their original words appear immediately following automated checks. Anyone may participate; there is no account, invitation, or manual review queue.

**Meet another tomorrow** brings two hopes together, favouring another age without interpreting either person's words. **Borrow this person's clock** takes that age into the existing clock comparison while preserving the elapsed months. Returning brings the visitor back to the words. The encounter temporarily replaces the list, giving one pair room to be read.

Authors receive a random removal key, which is not saved automatically. They can withdraw immediately or later with that key. Readers can flag a hope; this removes its words without manual review. Basic automated checks reject obvious contact details and abusive English language. They have false positives and misses; they are not comprehensive moderation.

The shared Wall starts empty. The original twelve fictional wishes remain in a separate **Explore the imagined wall** disclosure, open while the shared Wall is empty. Their six authored pairings and original interactions remain available. Test fixtures never seed the real database.

[Shared encounter, desktop](docs/screenshots/shared-wall-desktop.png) · [Shared encounter, phone](docs/screenshots/shared-wall-mobile.png). These screenshots show isolated test contributions, not participants.

## Current visual direction

The paper, forest, and copper palette gives the experience a quiet, tactile identity. Iterative design review refined the shared clock animation, local font loading, accessible controls, and text contrast. The illustrated cards now resize continuously, so choosing or switching a moment keeps the artwork in proportion instead of stretching it while its crop jumps.

## Run

Requires a standard Node.js 24.15+ installation (tested on 24.19.0) and pnpm 11.19.0. If pnpm is not installed, install the pinned version first:

```sh
npm install --global pnpm@11.19.0
```

Then, from the project directory:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:5173](http://127.0.0.1:5173). The server binds to loopback only.

On Windows, the same commands work with a standard Node.js installation. If PowerShell blocks the package manager's script, use its command launcher:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd dev
```

No account, environment variables, or cloud service are needed. The server creates `.local/wall/prototype.sqlite` automatically. This local database is ignored by Git; development and the local production preview use the same file. A contribution removal key is generated only when opening the sharing choice. Browser persistence is tied to the exact origin; `localhost`, `127.0.0.1`, and a production origin have separate saved thoughts.

## Cloudflare deployment

The React experience runs unchanged on Cloudflare Workers, with D1 for the shared Wall. Static files bypass the API Worker. A fresh public Wall starts empty; local development data is never uploaded. Stay on Workers Free to avoid usage charges; when its quotas are reached the Wall can become unavailable while static assets continue to load.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the project-specific login, database migration, secret setup, deployment, and recovery instructions. The public site is deployed at the link above; later releases use the existing project account and database in configuration.

To test Cloudflare locally:

```sh
pnpm build
# Copy .dev.vars.example to .dev.vars once.
pnpm cf:migrate:local
pnpm cf:dev
```

This serves the Cloudflare runtime on port 8787 with its own local D1 store. The existing `pnpm dev` and `pnpm preview` remain available without Cloudflare credentials.

## Verify

```sh
pnpm typecheck
pnpm test
pnpm test:wall
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm test:production
pnpm test:shared
pnpm cf:check
pnpm test:worker
pnpm format:check
pnpm audit
```

`pnpm test:wall` exercises the API, including consent, deletion, expiry, persistence and rate limits. `pnpm test:shared` starts the built app with an isolated in-memory Wall on loopback port 4180 and verifies separate visitors, failure recovery, accessibility, and a 320px layout. It never writes test hopes to the normal database. `pnpm test:production` also checks that the private journey survives a static-only host with the sharing API unavailable.

`pnpm inspect` captures the real desktop and mobile render into `.local/screenshots` while the development server is running. `pnpm preview` serves the built application at [localhost:4173](http://127.0.0.1:4173). Browser test failures retain traces in `test-results`; `pnpm exec playwright show-report` opens the test report. Generated output and any local reflection data are not committed.

Firefox is an optional additional target: install it with `pnpm exec playwright install firefox` and run `pnpm test:firefox`. On this workstation the bundled Firefox currently fails at Windows assembly startup before any page loads; see REVIEW.md. Default end-to-end tests cover desktop and mobile Chromium.

## Architecture

React + TypeScript, built with Vite. Cloudflare Workers serves a Hono API backed by D1 for explicitly shared hopes. The local Vite workflow retains Fastify and Node SQLite; both backends share validation and automated word checks. Component state handles interaction; fragment links handle navigation. No service worker. Assets and fonts are hosted with the app. The client requests only its same-origin Wall API; research links remain deliberate outbound navigation. Development mounts Fastify in Vite; `pnpm preview` serves the built app and API together at port 4173, bound to loopback. A static-only host supports private reflection and imagined wishes but cannot publish contributions.

| Location                            | Responsibility                                                         |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `src/components/Artwork.tsx`        | Original SVG contour sculpture and proportional year traces            |
| `src/components/Weight.tsx`         | Shared playback, age controls, scrubbing and pause behavior            |
| `src/components/YearScrubber.tsx`   | Native range and output synchronized with shared Motion progress       |
| `src/components/MemoryArtwork.tsx`  | Original layered SVG scenes and portable object drawings               |
| `src/content/moments.ts`            | Authored week and accessible descriptions of its details               |
| `src/components/MemoryPrint.tsx`    | Reversible ink softening using the original SVG grain and Motion       |
| `src/components/Memory.tsx`         | Authored memory transformation and visitor-selected moment             |
| `src/components/HopeNote.tsx`       | Tactile wish and paired-fragment rendering                             |
| `src/content/echoes.ts`             | Authored cross-age relationships between the fictional wishes          |
| `src/components/Tomorrows.tsx`      | Private reflection, sharing choice and imagined wishes                 |
| `src/components/ShareHope.tsx`      | Consent, submission recovery and removal receipt                       |
| `src/components/CommunityWall.tsx`  | Shared hopes, age encounters, borrowing and reporting                  |
| `src/lib/wall.ts`                   | Validated client API, refresh and age-based encounter selection        |
| `worker/index.ts`                   | Hosted API, atomic D1 writes, rate limits and scheduled expiry         |
| `migrations/`                       | Versioned D1 schema                                                    |
| `server/wall-policy.ts`             | Shared validation and automated checks                                 |
| `server/wall.ts`                    | Validation, automatic checks, rate limits, SQLite and deletion         |
| `src/content/en.ts`                 | Narrative copy and explicitly fictional hopes                          |
| `src/lib/model.ts`                  | Proportions, validation, and one private storage record                |
| `tests/material-experience.spec.ts` | Trace cancellation, anchored wishes, theme continuity, reversible ink  |
| `tests/experience.spec.ts`          | Browser journeys, accessibility, privacy boundaries, responsive checks |

The application separates the central narrative from presentation. A full localization pass should extract remaining interface labels and dynamic sentences, introduce locale-aware number formatting, and test longer strings and RTL. English is the only implemented language.

## Project record

- [PROJECT.md](PROJECT.md): the original creative brief, preserved unchanged.
- [PRODUCT.md](PRODUCT.md): product purpose, design constraints, and confirmed behavior.
- [DECISIONS.md](DECISIONS.md): why this interpretation and architecture were chosen.
- [RESEARCH.md](RESEARCH.md): primary sources, limitations, and design hypotheses.
- [PRIVACY_AND_MODERATION.md](PRIVACY_AND_MODERATION.md): actual data behavior, automatic publication and deletion.
- [DEPENDENCIES.md](DEPENDENCIES.md): open-source reuse and licenses.
- [REVIEW.md](REVIEW.md): first substantial version, verification, weaknesses, and next exploration.

## Boundaries

The complete sharing flow runs locally. Public hosting has not been selected or deployed. The creator explicitly chose open participation and no manual review at this stage; the earlier pending-first proposal is superseded. The local Wall expires hopes after seven days, holds at most 200 records (including removal receipts), and does not upload its database to GitHub.

The imagined examples are invented and are not evidence about any age group. The time model is a visual analogy, never a scientific law. There is no life expectancy calculation, social ranking, or analytics. The meaning of each contribution belongs to its author and readers. Technical checks cannot establish whether visitors actually experience greater empathy.

The code remains private/unlicensed pending the creator's choice of a project license. Third-party software retains its own licenses; runtime notices ship in `public/third-party-notices.txt` and are copied into the production build.
