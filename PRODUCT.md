# Timempathy

<!-- impeccable:product-schema 1 -->

This record captures product truth for Impeccable from the creator's original [PROJECT.md](PROJECT.md), subsequent instructions, and the verified implementation. The original brief remains intact. Later explicit creator instructions take precedence; implementation evidence does not authorize a new product direction.

## Platform

web

## Users

Visitors across ages who want to explore how a shared duration can carry different subjective weight and recognize ordinary hopes in lives unlike their own. The experience is self-paced and requires no account, expertise, or contribution.

A specific public-launch audience, including how contributions from minors would be handled, is undecided. The current scope is a local prototype for creator review, not a live public contribution service.

## Product Purpose

**We share the same clock, but not the same experience of time.**

Make temporal difference perceptible through interaction, then allow recognition across ages and a hopeful reflection on tomorrow. Success is a changed intuition and greater empathy, not time spent, completion rates, productivity, or a score. Curiosity, tenderness, recognition, and hope are the intended effects; these effects have not yet been validated with visitors.

## Positioning

Timempathy joins three experiences: borrowing another age's proportional clock, encountering the difference between a week and its recollection, and finding a familiar wish across ages. Interaction carries the meaning, with room for the visitor's own interpretation. Ordinary routine has the same dignity as novelty or exceptional events.

The central question is **How would you like to remember tomorrow?** It invites an imagined memory rather than a plan, goal, or demand to improve life.

## Operating Context

- One self-paced web experience, usable with a mouse, touch, or keyboard on desktop and mobile. Reading and reflection are optional; there is no timed task or required disclosure.
- The current application runs locally at http://127.0.0.1:5173/ with React, TypeScript, and Vite. Run and verification commands live in [README.md](README.md). Framework and library choices were delegated to development judgment.
- The creator reviews actual rendered behavior. Preserve coherent Git milestones on the existing experiments/timepathy branch and use the already authorized private project repository for backup. Public deployment requires a separate creator decision.

## Capabilities and Constraints

- **Borrow another clock:** two ages share one elapsed year. Changing or exchanging ages holds the elapsed months while the arc's proportion changes. Both animated years take eight seconds. The proportion 1 / age is illustrative arithmetic about life already lived, never psychological speed, remaining lifespan, or a scientific law.
- **Memory:** seven authored ordinary-life scenes can fold into a shorter paper week. Explicitly opened days remain unfolded during recollection. A currently held moment can carry its drawing into tomorrow. These are authored interaction rules, not a test or measurement of the visitor's memory or attention.
- **Private reflection:** one short thought with an optional age stays in this visit by default. A separate explicit choice permits local browser storage, with a removal action. Nothing is submitted to a server or added to the Wall.
- **Wall of Tomorrows:** twelve clearly fictional wishes form six authored cross-age pairings. A visitor can open a wish to encounter its companion with both ages visible. Age serves recognition, never ranking or generational stereotypes.
- No accounts, public profiles, social competition, analytics, tracking, dwell measurement, mortality countdowns, productivity scoring, or AI interpretation. Do not add conventional features merely to expand the product.
- Fonts and assets ship locally. English is currently implemented; the architecture must leave room for localization without making the concept depend on English wordplay.
- A future public Wall needs creator-approved audience and territory, hosting, human moderation responsibility, retention/deletion policy, and any external processors. The proposed architecture in [PRIVACY_AND_MODERATION.md](PRIVACY_AND_MODERATION.md) is not permission to launch or collect submissions.

## Brand Commitments

Preserve the name Timempathy, the existing visual identity, original illustrations, and emotional language. The creator explicitly preferred the restored design and asked for deeper experience without adding conventional features. This is a binding preservation constraint, not a request for a new visual direction.

The voice is humane, contemplative, curious, quiet, hopeful, slightly poetic, accessible, and non-preachy. Plain ordinary wishes belong alongside lyrical language. Avoid urgency, guilt, death anxiety, life coaching, motivational slogans, forced significance, and sentimentality without substance. Let visitors notice rather than tell them what life should mean.

## Evidence on Hand

- [PROJECT.md](PROJECT.md): creator-authored purpose, ethical boundaries, and original creative mandate.
- [DECISIONS.md](DECISIONS.md): implementation decisions and creator-directed reversals, including the restoration of the preferred identity and subsequent experiential refinement.
- [RESEARCH.md](RESEARCH.md): primary research, distinctions between evidence and metaphor, and unvalidated design hypotheses. No empirical study of Timempathy's effect on empathy has been conducted.
- src/content/en.ts, src/content/moments.ts, and src/content/echoes.ts: fictional copy, seven scenes, and editorial pairings. They are not real submissions, testimonials, or demographic evidence.
- src/components/Artwork.tsx and src/components/MemoryArtwork.tsx: the original code-native illustrations. Current implementation and reviewed screenshots in docs/screenshots/ establish the incumbent visual identity.
- tests/experience.spec.ts and src/lib/model.test.ts: functional, accessibility, motion, and storage checks. Passing software checks does not establish a psychological outcome.

## Product Principles

1. Make time perceptible through consequential interaction; use explanation where it supplies needed meaning or an honest boundary.
2. Preserve the dignity of ordinary life and the visitor's authority over its meaning.
3. Let age reveal both difference and common humanity, without predictions, stereotypes, or competition.
4. Keep the experience restrained, emotionally safe, hopeful, and private by default.
5. Reuse mature software for generic capabilities; concentrate original work on Timempathy's distinctive experience.

## Accessibility & Inclusion

Every essential interaction must work by keyboard and touch, with meaningful screen-reader descriptions, visible focus, readable type, sufficient contrast, and meaning beyond color. Respect reduced-motion preferences and the global pause; provide immediate or controllable equivalents to animation without time pressure.

Preserve the compact, centered clock experience and its final playback action, while allowing natural scrolling with enlarged text. Keep paper illustrations proportional throughout resizing. Cross-age wishes must remain readable together on narrow screens, with predictable focus and return behavior.

Avoid a single cultural model of a good life. Public audience policy and a complete localization pass remain open; do not invent either during interface refinement.
