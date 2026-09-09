# Research and interpretation

Consulted 2026-09-09. Sources are primary studies and upstream software projects. These notes deliberately separate evidence, arithmetic, and authored metaphor.

## Human time

### Wittmann, Rudolph, Linares Gutierrez & Winkler (2015)

[Time Perspective and Emotion Regulation as Predictors of Age-Related Subjective Passage of Time](https://pmc.ncbi.nlm.nih.gov/articles/PMC4690970/). International Journal of Environmental Research and Public Health, 12, 16027–16042. DOI: 10.3390/ijerph121215034.

An online survey of 423 people aged 17–81 investigated reported passage of time, time perspective, and emotion. This is observational self-report, not causal proof. The paper distinguishes duration estimation, awareness of time passing, and perspective on past/present/future. It discusses age associations that differ across retrospective intervals, with the past decade particularly relevant. The intuitive explanation that increased routine causes faster years remains debated.

**Application:** no deterministic statements about how a given age feels; no equation labeled as a scientific law; no claim that novelty guarantees a longer-feeling life. Both clock animations take the same objective duration. The notes explicitly distinguish time passing from remembered time.

### Swallow, Zacks & Abrams (2009)

[Event boundaries in perception affect memory encoding and updating](https://pubmed.ncbi.nlm.nih.gov/19397382/). Journal of Experimental Psychology: General, 138(2), 236–257. DOI: 10.1037/a0015631.

Experiments using film clips and recognition tasks found relations between event boundaries and memory for objects. These findings concern event organization and short-delay memory, not a formula for how quickly years pass.

**Application:** the memory sequence is inspired by the idea that memory is organized around events. The initial repeated-cup fold and the visitor-shaped folds are authored illustrations, not a reproduction of this study or a claim that routine is forgotten. Explicitly opening a day keeps it distinct when the paper contracts, including an ordinary cup. That rule makes a choice perceptible; it is not an attention measurement or an empirical model of memory. The copy makes this scope visible.

## Arithmetic, not empirical psychology

`1 / age` is a fraction of lived years when an age is treated as an exact whole-year quantity. It says nothing about remaining lifespan, subjective speed, or the emotional value of a year. Both circular visualizations normalize life so far to the same circumference. The bright segment represents one year; there is no shared absolute spatial scale of total lived duration.

## Design hypotheses requiring people, not unit tests

- Keeping the same elapsed months fixed while the visitor exchanges ages may make context perceptible through the changing arc. The geometry uses 1/age; it does not change psychological time or playback speed.
- Seeing the material length of the week contract around explicitly opened days may make remembered duration perceptible. A repeated ordinary moment has the same ability to remain distinct as rain or a conversation.
- Opening one wish and encountering its companion in the same field of view may support recognition across ages. Underlined passages and all six pairings are editorial choices between fictional texts, not classifications or inferred similarities between real people.

None of these hypotheses has been evaluated with participants. The fictional dataset cannot establish the prevalence of any hope across ages. Do not cite it as demographic evidence.

## Open-source evaluation

- [React](https://github.com/facebook/react): established UI composition, MIT; local state is enough for this scope.
- [Vite](https://github.com/vitejs/vite), [guide](https://vite.dev/guide/): established development/build pipeline, MIT; compatible with the installed Node 24 runtime.
- [Motion](https://github.com/motiondivision/motion), [reduced-motion documentation](https://motion.dev/docs/react-use-reduced-motion): MIT; used for component transitions and preference detection. Shared Motion values drive synchronized year progress and the change in arc size when ages are borrowed. CSS transitions resize the actual paper widths to preserve the SVG artwork.
- [Lucide](https://github.com/lucide-icons/lucide): ISC icons with an inherited MIT notice for Feather-derived work; selective imports avoid shipping the full icon set.
- [Zod](https://github.com/colinhacks/zod): MIT; shared type-safe validation of input and stored data without handwritten validation infrastructure.
- [Fontsource](https://github.com/fontsource/fontsource): locally packaged fonts; individual font licenses are SIL OFL 1.1.
- [Vitest](https://github.com/vitest-dev/vitest): MIT; tests the proportional model and persistence boundaries.
- [Playwright](https://github.com/microsoft/playwright): Apache-2.0; runs the actual browser at desktop and touch sizes.
- [axe-core](https://github.com/dequelabs/axe-core): MPL-2.0; automated accessibility checks supplement visual and keyboard checks, not a substitute for assistive-technology testing.

Published stable package versions were installed, then pinned for reproducibility with a lockfile. Maintenance and license information came from upstream project documentation and installed package metadata. The projects are established, but popularity does not eliminate security risk; the final validation records the package audit result.
