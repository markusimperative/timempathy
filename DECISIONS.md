# Timempathy decision log

## 2026-09-09 — First interpretation

Timempathy is an encounter with different scales of experience, followed by recognition across ages. The first local version is a continuous journey through scale, memory, a private reflection, and an imagined collective wall. Visitors may skip freely. There is no timer to finish the experience, sound, score, lifespan estimate, or instruction to improve themselves.

### Time as a thread around a life already lived

The opening is a bespoke SVG contour sculpture; the first interaction is two circular threads. One full circle represents a selected age's life so far. One year occupies exactly `1 / age` of that circle. Both traces play over the same eight seconds, with pause and direct scrubbing. The animation is deliberately illustrative: it does not simulate anyone's psychological clock. Ages are adjustable without collecting a birthday or making age-based personality claims.

Considered, but not implemented: an accelerating tunnel and age-dependent playback speed. Both would suggest an empirically calibrated perceptual speed we do not have. Also rejected at the sketch stage: a remaining-life visualization and a conventional comparative bar chart. The former would redirect the emotional purpose; the latter would make the experience mostly calculation.

### Remembered time is not an achievement contest

An illustrated week gives equal space to days, then compresses three repeated cups in a deliberately authored recollection. Visitors can choose a familiar cup as the moment that stays. The scene acknowledges that the visitor's memory could differ completely. This is a design hypothesis inspired by event-memory work, not an experiment on visitors or a measurement of memory.

### The wall connects without ranking

Twelve explicitly labeled fictional hopes span ages 17–86. Themes are editorial navigation, not inferred personality or a ranking. Four authored pairs create echoes across ages. No AI classification, demographic stereotype, voting, identity, or popularity mechanism is needed. Ordinary conversational language is intentional.

### Local reflection before a public contribution system

No backend is justified for this first development milestone. By default the reflection exists only in React state for this visit. Browser persistence is an unchecked, explicit choice, with one localStorage key and a visible removal action. Age is optional for this private reflection. Data is never silently added to the authored examples or transmitted. An actual public contribution would require age and a moderation workflow; see PRIVACY_AND_MODERATION.md once the public-launch design is recorded.

### Architecture and reuse

React + TypeScript + Vite support an interactive static application without an unnecessary server framework. Motion handles component transitions and reduced-motion detection. Lucide supplies interface icons. Zod validates reflection input and untrusted stored data. Native buttons, ranges, checkboxes, and links provide the small set of interaction primitives; a full component kit would add little here. Fontsource hosts Instrument Serif and DM Sans locally, avoiding font requests to a third party. Vitest and Playwright with axe-core test domain behavior and the actual browser experience.

No image generation, Three.js/WebGL, charting framework, database, routing framework, authentication, analytics, or cloud deployment was introduced. The distinctive artwork and time metaphor are SVG, maintained directly alongside the application.

### First rendered review

The first desktop and mobile captures show a coherent paper / forest / copper visual system and a readable central hierarchy. All model and persistence tests passed; the first browser pass verified all functional journeys. Automated contrast checks caught insufficient contrast on the ages printed on wall notes. Visual inspection also showed that some secondary copy was too small, and fading unrelated notes would compromise legibility. These are refinement work before the review milestone, not accepted limitations.

## 2026-09-09 — Readability and review refinement

After the first rendered pass, supporting type was enlarged, wall age labels darkened, and opacity-based fading removed from both the wall and memory scene. An echo is now an outline plus a label; paired notes move adjacent in reading order, so the encounter remains visible on mobile. A global pause also stops active playback without restarting it on resume. The hidden skip link was strengthened after full-section screenshots revealed its offscreen box could appear in extended captures.

The first complete functional browser run passed. Initial axe failures on note metadata were fixed; changed states then passed at desktop and mobile sizes. The final suite covers 28 Chromium cases plus 15 domain/storage cases, and the built production bundle was exercised separately. Firefox was attempted but could not launch: Windows reported a missing mozglue side-by-side assembly. No operating-system security setting was changed. The optional Firefox test target is retained with the environment limitation documented.

No public publishing or remote Git operation is part of this milestone. The next product evidence should come from consenting visitors, particularly across ages and assistive technologies.

## 2026-09-09 — A paper week, and a moment carried into tomorrow

The creator endorsed a tactile illustrated direction, especially interaction with embedded meaning. This milestone explores the memory landscape and continuity into tomorrow. The thread-based clocks and an illustrated relationship between wall notes remain separate proposed experiments.

The week now has seven connected scenes with paper grain, changing light, furniture, and small ordinary details. A native range lets the visitor continuously fold repeated mornings; endpoint buttons give an immediate alternative. Folding changes page width and orientation while labels remain outside the tilted surface. Any selected day reopens, including the familiar cups. This is an authored metaphor for recollection, not a prediction of how visitors remember their own lives.

Choosing a moment reveals a brief description of its detail and carries its object into the next chapter. Shared React state connects the scenes; no identifier or extra storage was introduced. Changing or releasing the choice leaves the visitor's words untouched. Reloading clears the object even when the visitor separately opted to store a written reflection. Native fragment navigation moves focus to the tomorrow heading.

Original SVG scenes replace the earlier isolated outline icons. Motion handles page layout and small selected-state changes: a curtain shifts, a second cup becomes distinct, a chair draws closer, or a leaf turns. Native horizontal scrolling and arrow buttons expose the entire week on a phone. Reduced motion retains the folded composition and every interaction with zero-duration transitions. There are no required hover gestures or timed tasks, and no new dependencies.

Rendered inspection caught nested-SVG sizing and stale styling from the old memory strip. Both were removed. Browser checks also caught the initial anchor-focus race and selected-state text contrast; both were corrected. The 34 desktop/mobile Chromium cases are passing after targeted reruns of the fixes, alongside 15 unit cases, type checking, and the production build. Fold movement was inspected in the real browser at intermediate and settled states. Representative desktop and mobile captures are in docs/screenshots.

Remaining creative limitation: the mornings fold according to one authored recollection, and a carried drawing remains an illustration rather than a personal memory artifact. Whether this feels tender and meaningful still needs direct visitor feedback. The existing Firefox startup limitation is unchanged.

## 2026-09-09 — A contextual Taste Skill refinement

The creator requested the Taste Skill repository. Both its main and redesign guides were read at a pinned revision, with the interpretation recorded in docs/TASTE_REVIEW.md. The working dials are layout variance 6, motion intensity 4, and visual density 3. The existing storybook identity and original SVG illustrations take priority over generic photographic, marketing, and framework prescriptions. The skill's print-emulating exception fits the light paper theme.

The opening now has a compact two-line title and fewer competing invitations. Chapter headings stand without numbered banners. A continuous paper palette connects the chapters. On the wall, larger ages share space with each hope; a restrained copper line connects the adjacent echo pair. Pressed feedback and supporting contrast were refined without changing the visitor journey or data behavior.

Both year dials now subscribe to one Motion value. The native scrubber synchronizes directly with that value, so continuous playback does not rerender the whole clock scene every frame. React state only tracks discrete playback phases and user choices. The synchronized eight-second passage and 1/age geometry are unchanged.

A production Lighthouse audit surfaced mismatched visible and accessible labels on the memory buttons. Removing their redundant aria-label lets the actual day, caption, and hold action supply the name. The browser accessibility suite now includes WCAG 2.1 A. Three above-the-fold font preloads shorten the local loading chain. Final validation and remaining audit observations are recorded in docs/TASTE_REVIEW.md.

## 2026-09-09 — Restore the preferred design and stabilize card motion

The creator preferred the pre-Taste visual version. The original composition, copy, chapter labels, forest clock section, and note-card wall are restored from a6b26df. Shared Motion-value clock playback, three local font preloads, native memory button names, WCAG 2.1 A checks, and improved placeholder contrast remain. The redesign stays in published Git history; this is a new milestone rather than a history rewrite.

Clicking a memory card revealed a separate animation defect: Motion layout projection immediately applied the final SVG crop, then horizontally scaled the outer card back toward its previous width. A round sun was squeezed by roughly 30% at the start of the captured desktop transition. The seven-card strip now transitions its actual flex widths and bases with CSS. The existing paper tilt/lift and small scene animations remain with Motion. This limited layout work is intentional: the drawing and its viewport resize together, keeping the illustration proportional throughout the transition. Global pause and reduced motion disable these transitions.

A browser regression samples the round landmarks during selection, quick switching, and release; it checks their proportions throughout motion and verifies that intermediate widths are rendered. Desktop and phone frames were inspected in addition to the existing functional, accessibility, and privacy checks. The source comparison confirms that the only differences from the preferred visual baseline are the retained technical improvements, accessible heading spacing, and this card-motion correction. No dependencies or external services were added.

Validation: all 34 existing desktop/mobile Chromium cases passed. The new motion regression passed on both targets, including three repeated runs per target after broadening sampling to all three cup cards. The 15 unit tests, TypeScript check, Vite build, production privacy/runtime smoke, formatting, and whitespace checks pass. The initial mobile regression sampled only the first card during a short interrupted transition; the revised test observes all affected cards and gives the first transition time to render.

## 2026-09-10 — Make the year and its context visible

The creator found the clock concept unclear and asked for a stronger play invitation. The forest chapter now introduces a single year as a copper strip with twelve month divisions, followed by two circles containing five and fifty year segments. Every segment represents one year already lived. A shared Motion value fills the month strip and one segment in each circle over the same eight seconds. The difference is the share of the circle, never an asserted difference in psychological speed. Plain-language captions replace the primary fractions, while accessible descriptions retain precise proportions. Age controls cover 1–100 and preserve the whole-circle case at age one. Equal ages receive matching comparison copy.

The copper button appears immediately after the drawings and before age adjustments. Its larger size, contrast, play symbol, and tactile pressed feedback establish the first action. A single expanding outline runs when the button first enters view. It stops on interaction, never repeats within the visit, and is omitted in still mode. The button switches between play, pause, continue, and replay; still mode offers an immediate comparison and beginning state. No playback starts automatically. Progress remains outside the React render loop.

The original hero, paper week, note-card wall, local font preloads, and private reflection behavior are preserved. No dependencies were added. Rendered inspection covered normal playback, still mode, desktop, phone, and narrow layouts. All 36 existing browser cases passed; four new desktop/mobile cases verify segment counts, synchronized month progress, age extremes, equal ages, and the one-time cue. Their first run exposed test-only initialization and SVG-length parsing assumptions; both were corrected and the cases passed. The 15 unit cases, type check, production build, and production smoke pass. Accessibility checks include WCAG 2.1 A and AA.

Remaining product question: the representation now exposes its meaning directly, but whether visitors connect that proportion to empathy still needs observation with people across ages. The illustrative nature of the model stays explicit.

## 2026-09-10 — Center the clocks and compact their controls

The creator requested centered clock text, a comparison arrow between the faces, controls arranged side by side, and the play button at the bottom of the section. The age and “years lived” label now form one centered HTML block over each SVG, replacing separately positioned text baselines. Type scales with the dial, and the SVG retains its complete accessible description. This also removes the negative letter spacing that affected the number’s apparent centering.

An existing Lucide arrow connects the two faces with “one year / in both lives.” Age selection sits beside the month strip and scrubber on desktop. Phones retain two age sliders in one row, with age presets beside the timeline underneath. Supporting copy and the model caveat precede the copper play button, which is now the section’s last item and last keyboard action. Playback, its one-time cue, reduced motion, and private reflection behavior are unchanged. No dependencies were added.

Rendered review covered 1440px, 768px, 390px, and 320px widths, including ages 1 and 100. At the narrowest width, the label blocks are centered within a hundredth of a pixel and fit inside both rings. The browser regression now verifies that the play invitation is the final section action. All 40 desktop/mobile Chromium cases, 15 unit tests, TypeScript, the production build, and the production privacy/runtime smoke pass.

## 2026-09-10 — Restore the clock chapter’s restraint

Creator review showed that the segmented rings, separate month strip, repeated explanations, and two-column control panel made the chapter feel populated. Rearranging those elements had shortened the section without recovering the first version’s visual balance. The chapter now returns to fine circular threads, light sage and copper arcs, quiet yearly ticks, and “Borrow another clock.” A brief introduction and small captions carry the meaning. Each age slider is directly beneath its own face. The separate month graphic, large visible status sentence, repeated helper text, control-panel dividers, and next-chapter icon are removed. The live status remains available to screen readers.

One shared scrubber and the copper play button remain below the clocks. The button is still the last item. The model caveat is a short line with a link to the existing fuller explanation; the mathematical analogy remains explicit. Shared Motion values, centered labels, the one-time play cue, pause and reduced motion, font preloads, and the corrected paper-card motion are preserved. No dependencies were added.

The principal acceptance check is the actual viewport, not a screenshot that expands to capture an oversized element. At 1366 × 768 the chapter is about 708px high; at 390 × 844 it is about 647px. A short-phone spacing variant fits the chapter into 320 × 568 while keeping the clocks, controls, and play action visible. Only the redundant visible “Borrow an age” label is omitted there; the preset group keeps its accessible name. Zoomed text and unusual aspect ratios retain natural scrolling.

All 40 existing desktop/mobile browser cases pass. The new viewport regression also passes on a laptop and a short phone, including age 100 and playback with both clocks and the button visible. Its first phone run revealed a nine-pixel anchor overshoot caused by using the desktop inset; matching the existing mobile inset fixed the issue. Unit tests (15), TypeScript, the production build, privacy/runtime smoke, formatting, and whitespace checks pass. Clock inspection screenshots now capture the browser viewport.

## 2026-09-10 — Give the lens its own place

The creator requested the lens explanation directly beneath “Borrow another clock” and smaller numbers inside the faces. The existing explanation now appears once in a compact, separate “About this lens” section between the clocks and memory. The inline caveat/link is removed from the playback controls; the final information section retains privacy and research in two columns. Dial numbers are reduced from 27 to 22 percent of the dial width (about 19%) while the complete text group stays centered.

Desktop and phone rendering confirms the section order, centered labels, and no overflow. Ten targeted Chromium cases pass across both sizes, covering the journey, keyboard playback, accessibility, enlarged layouts, and complete clock viewport fitting. TypeScript, the production build, formatting, and whitespace checks pass.

## 2026-09-10 — Let the visitor change what time becomes

The creator asked to deepen the existing experience while preserving its visual identity and restraint. Three explanatory moments were replaced with consequences of interaction. In the clocks, choosing an age used to reset the year, interrupting the comparison. It now holds the exact elapsed months while the arc changes shape through a shared Motion value. The existing connecting arrow exchanges ages. Playback resumes from the held position, always using the same eight-second year. Still mode changes the geometry immediately, with accessible descriptions of the fixed months.

The week previously redistributed a fixed row of space and always folded the same three mornings. Its actual paper length now contracts. Once a visitor opens a day, that day remains unfolded in subsequent recollection, even after it is released; other days fold around it. Returning to “As it happens” opens the full week again. An ordinary cup has exactly the same ability to remain distinct as any other scene. Only explicit choices enter this temporary state: no dwell measurement, inferred attention, scores, timestamps, or persistence. The existing illustrated scenes and the single moment carried into tomorrow remain. Real CSS widths continue to protect the drawings from projection distortion. Visual review caught crowded titles on the narrower folds; container-relative typography and wrapping corrected them.

The Wall previously announced a familiar wish in its echo caption. A visitor can now open any of the twelve original wishes into an authored pair. The source wish stays first; its companion appears beside it with both ages visible. A fine paper thread and underlined details make the relationship visible without adding an interpretation paragraph. Six authored pairings cover the existing fictional texts, including the four previous pairs. These are editorial relationships, not demographic evidence or an automated matching system. The default paper wall, filters, and echo button retain their appearance. Focus moves to an opened pair; Escape returns it to the original wish or echo button. Every pair was inspected at 320px with both ages in view.

The forest, paper, typography, illustrations, smaller centered clock numbers, nearby lens explanation, and final play-button placement are preserved. Generic behavior continues to use React, Motion, native buttons/ranges, and CSS. No dependencies or external services were added. The scientific scope remains an authored metaphor; effects on empathy still require observation with visitors.

Validation: all 48 desktop/mobile Chromium cases passed, including new checks for intermediate arc shapes with unchanged months, actual paper contraction around opened ordinary moments, and cross-age focus return. Eight affected cases passed again after the fold typography refinement; both focus-return cases passed after completing the echo-button return path. All 15 unit tests, TypeScript, production build and privacy/runtime smoke, and formatting checks pass.

## 2026-09-10 — Initialize Impeccable from established product truth

The creator requested Impeccable init and supplied the upstream repository. The Codex skill was installed user-wide at revision cd12f8660e2dde57b9615c8a6b8ea674101f9cfc (skill 4.3.1, engine 0.1.5). PRODUCT.md captures the original brief, subsequent creator corrections, and verified current behavior, with public-launch policy and unvalidated empathy outcomes explicitly left open. It does not replace PROJECT.md or define a new visual world. The standing autonomous mandate and extensive confirmed context made another routine interview unnecessary.

A future live session can target the existing Vite shell through .impeccable/live/config.json; the CSP detector and running app required no security changes. No picker was injected and no hook was enabled. No standing image-first/code-first preference was inferred. Installation provenance and usage are in docs/IMPECCABLE.md. Application source and runtime dependencies are unchanged.

## 2026-09-10 — Leave traces, preserve places, soften impressions

The creator approved a restrained experiential pass using Impeccable, UI UX Pro Max, and vgpu. Impeccable's motion guidance established one short sequence per action, continuity around the visitor's chosen object, and immediate still-mode equivalents. UI UX Pro Max's interruption and focus guidance informed cancellable motion and focus that stays with the reading position. The existing paper, forest, copper, typography, drawings, compact clock layout, and private-data boundaries remain.

Changing an age leaves one faint outline of the previously displayed whole-year share while the current arc reshapes. The trace waits 650 ms, fades over 900 ms, and is replaced on another age change. Scrubbing and still mode clear it immediately. The shared months never advance as a consequence of changing age. The screen-reader status now includes the previous and new proportions as well as the held months. This is still arithmetic about a share of life already lived, not an assertion about psychological speed.

The original memory illustrations now soften slightly and expose stronger paper grain as their cards fold. Explicitly opened days remain clear. A single Motion value per print keeps opacity, blur, and grain synchronized with the existing 750 ms paper movement; changing direction cancels the previous transition. All labels sit outside the visual treatment. The same fully reversible states are available immediately in still mode. Browser review also found an existing animated window path briefly receiving an undefined initial shape; an explicit initial state removes the SVG warning.

Opening a Wall wish previously moved its pair to the top. It now inserts the companion beside the chosen wish's original row and column. At a row's right edge, the companion arrives from the left. Viewport compensation preserves the source's vertical reading position; only an offscreen pair scrolls enough to reveal both ages. The source remains first in logical reading order. The companion arrives over 480 ms, the thread draws next, and shared fragments underline last; still mode shows the completed relationship immediately. Escape restores the original wish and reading position. Opening a wish preserves its theme, including when its companion belongs to another theme. No summaries, new controls, or social features were added.

A bounded vgpu 0.4.1 experiment used one shared device, snapshots of the existing SVG drawings, a small ink-and-grain shader, and resize-only rendering. The build isolated it in a 120.46 kB chunk (38.53 kB gzip), but Chromium requestAdapter returned null in this workstation's normal automated session and two isolated software-adapter configurations. The shader's output could not be visually verified. The observed SVG/CSS treatment already supports this modest material change, so the GPU dependency and application renderer were removed. The skill remains installed; the experiment is retained locally in .local/memory-ink-experiment.ts. A future GPU effect should earn its payload with a perceptual benefit and be verified on a usable adapter. No new runtime dependencies remain.

Validation: all 48 existing desktop/mobile Chromium cases passed, including accessibility and privacy checks. Ten additional cases pass for trace interruption, all twelve wishes retaining their positions and keyboard return, theme continuity, both ages visible at 320 × 568, and reversible ink. The 15 unit tests, TypeScript, production build, license generation, and production smoke pass. The production journey makes no external requests and reports no runtime errors. Impeccable's mechanical detector returned no findings. Desktop and phone renders were inspected, including the moment-to-moment clock change, an ordinary cup remaining clear, and a lower Wall wish meeting its companion. These checks establish behavior and visual coherence; whether the changes deepen empathy still needs observation with visitors.

## 2026-09-10 — Let a real hope lead back to a clock

Review against the creator's [source conversation](https://chatgpt.com/share/6aa03f25-9ecc-83eb-90ad-7770ada89f25) found that the emotional language and ordinary-life imagery were close to the intention, but the human exchange still existed only as authored examples. The approved next milestone is a complete local path: imagine tomorrow, keep it private or explicitly offer it, encounter another age's words, then borrow the clock beside that hope. No new social ranking, account, conventional feature set or automatic emotional interpretation is introduced.

The creator answered the pilot policy question explicitly: any user can participate, with no manual review at this stage. That instruction supersedes the earlier proposed human-review queue. Contributions now publish automatically after schema and local heuristic checks. The UI explains the audience and seven-day lifetime before a separate unchecked agreement. A random removal key supports author withdrawal; a reader flag removes the words immediately without keeping a moderator inbox. These checks are limited, and readers can misuse removal. The policy is transparent rather than presented as comprehensive moderation.

Fastify, its maintained rate-limit/static plugins, and Node's built-in SQLite supply generic HTTP, storage and request controls. Obscenity supplies the local English check. There is no external content processor, model rewriting, custom authentication system or remote database. The service binds to loopback and writes an ignored local SQLite file. Public hosting remains unselected. Original words and age are the only substantive public data; short-lived private receipt metadata supports consent and deletion. All synthetic test hopes use isolated databases.

A shared encounter chooses an available different age when possible, preferring a gap of at least fifteen years and otherwise falling back without claiming an emotional match. Selection happens in the browser; private words are not sent for matching. The visitor's own submitted hope and identical text are excluded from automatic encounters. People can also choose a particular hope to read. The two ages remain beside their own words; the prompt leaves recognition to the visitor. Borrowing carries that person's age into the existing clock without advancing or resetting the elapsed year. The original compact clocks, memory impressions, still mode, and paper identity remain.

Rendered review found repetition of the same hope across the private preview, pair and public list, plus a phone header squeezed into a narrow text column. The encounter now replaces the list, and a shared private copy remains in the writing chapter rather than being repeated above the pair. The phone header has two clear rows. Contrast was strengthened on small private/shared labels; the sharing checkbox reuses the existing accessible form treatment. Fictional wishes remain in a separately labelled disclosure, open while the real Wall is empty. Their earlier interactions remain intact.

Validation: 15 existing unit cases, eight new API cases, all 58 desktop/mobile browser cases, and the built-app exchange script pass. The latter uses independent visitors and checks explicit consent, optional-to-required age, no self-encounter, borrowing with held months, private/shared deletion boundaries, reader flags, status refresh, wrong keys, lost-response recovery, rejected-text privacy, 240-character text at 320px, and axe accessibility. TypeScript, the build, the static-only fallback smoke, dependency audit and Impeccable detector pass. Backend license notices are preserved for 85 packages, including a reviewed copy of abstract-logging's linked MIT notice omitted from its published package. Passing checks establish behavior, not an empathy outcome; real visitor observation and public deployment are still future work.

## 2026-09-10 — Keep the memory slider responsive after exploration

The creator reported that the fold slider moved without changing the week. Reproduction confirmed that after all seven cards had been opened, every card's fold amount was zero at both slider endpoints. The earlier rule treated opening a day as permanent exemption from all contraction; normal exploration therefore exhausted the interaction.

Opened days now retain clear ink and a flat face while their paper contracts more gently than unopened days. Only the currently held moment remains fully expanded. This preserves the distinction between moments without making the slider inert once the entire week has been explored. Returning to the beginning restores the full width, including when no moment is held. The authored first-visit recollection stays unchanged. Accessible descriptions now say opened days stay clear rather than claiming they remain unfolded.

At tablet widths, a minimum card width could also swallow the size change. The responsive paper basis now leaves enough room to contract above the readable floor, and the existing horizontal navigation becomes available at that breakpoint. Desktop, phone and tablet renderings were inspected. Targeted browser checks cover real pointer dragging after all seven days were opened, intermediate contraction, the held moment, clear artwork, keyboard/reduced-motion reversal, tablet sizing, the original drawing proportions, and carrying a moment into tomorrow. No dependency or storage behavior changes.

## 2026-09-10 — Prepare the existing experience for Workers and D1

The creator chose Cloudflare Workers + D1 for a free public launch. React remains: Timempathy's clocks, memory and Wall share meaningful state, so a framework migration would add work without a demonstrated experiential benefit. Static assets bypass the Worker, and only the same-origin API uses Worker requests. Local development retains Fastify/Node SQLite, sharing the same schema and language rules with Hono on Workers.

The public Wall uses fresh D1 storage, never an upload of local or test contributions. Transactional capacity checks and a unique removal-key digest preserve idempotency under concurrent requests. Author withdrawal and reader flags clear the original words and age, while temporary receipts prevent retries from resurrecting them. An hourly job removes expired rows; every API read excludes expired hopes immediately. Cloudflare's native, per-location rate counters use an hourly keyed connection-IP digest; no raw IP or persistent visitor record is stored in D1. Application observability is disabled.

Public consent explicitly names the internet audience and Cloudflare recovery retention, with a distinct public consent version. D1 Free retains recovery history for seven days, so removal cannot promise immediate erasure from provider backups. Do not restore an old backup into a public Wall; it could resurrect withdrawn words. The creator's open participation/no manual review policy remains in force.

Type checking, existing unit/API tests, deployment bundling, and the real local Cloudflare/D1 browser journey pass. D1 verification covers migrations, restart persistence, parallel retries, the final available place under concurrency, expiry, author deletion, flags, origin enforcement, rate limits, security headers and graceful database outage. Public account authorization remains a separate deployment step.

Browser callback authorization proved unreachable in this environment. The deployment wrapper therefore uses Wrangler’s device login and a project-local XDG configuration under ignored `.local/cloudflare/config`. It clears inherited API credentials and refuses a legacy global Wrangler-directory fallback. This avoids using or overwriting credentials for unrelated projects; no secret is committed.

The first public deployment is now active at https://timempathy.timempathy.workers.dev/. D1 was created fresh in EU jurisdiction with read replication disabled, the real schema was applied, and the Worker secret and hourly expiry schedule were installed. A live HTTPS smoke check verified one explicitly labelled temporary contribution across independent browsers, clock continuity and withdrawal, then removed it. Desktop and phone renders, accessibility, security headers and bundled asset loading pass on the public host. The repository remains private; no paid plan, custom domain or additional service was added.
