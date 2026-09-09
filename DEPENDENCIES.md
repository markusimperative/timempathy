# Dependencies and licenses

Exact versions are pinned in `package.json` and `pnpm-lock.yaml`. This is a small static application with seven direct runtime packages; no service or paid dependency is required.

| Package                     | Version | License                                | Why it is here                                                |
| --------------------------- | ------- | -------------------------------------- | ------------------------------------------------------------- |
| React / React DOM           | 19.2.8  | MIT                                    | Declarative interaction and component state                   |
| Motion                      | 13.2.0  | MIT                                    | Component transitions and reduced-motion preference detection |
| Lucide React                | 1.43.0  | ISC, with inherited Feather MIT notice | A few consistent interface icons                              |
| Zod                         | 4.5.4   | MIT                                    | Input and stored-data validation with inferred types          |
| Fontsource DM Sans          | 5.3.0   | SIL OFL 1.1                            | Locally served readable interface type                        |
| Fontsource Instrument Serif | 5.3.0   | SIL OFL 1.1                            | Locally served editorial type                                 |

Development tools: Vite 8.2.2 and its React plugin 6.1.1 (MIT); TypeScript 7.0.2 (Apache-2.0); Vitest 5.0.0 (MIT); Playwright 1.63.0 (Apache-2.0); axe-core / Playwright 4.13.0 (MPL-2.0); Prettier 3.9.6 (MIT); Node/React type definitions (MIT). Installed package metadata and upstream license files are the source of truth.

Run `pnpm licenses:generate` after changing a runtime dependency. The script traverses the installed runtime dependency graph and preserves the full license notices for all 12 runtime packages in `public/third-party-notices.txt`; Vite includes this file in the production build. The script fails if a package lacks a discoverable notice, prompting a deliberate review instead of silently omitting it. Original font license text is included.

Generic UI is deliberately native where it fits: buttons, links, ranges, textarea, checkbox, number input. React manages the scene, Motion handles transition mechanics, and SVG carries Timempathy's own visual idea. A large UI kit, WebGL engine, AI SDK, date library, or database would add cost without solving a demonstrated need.

The dependency audit on 2026-09-09 reported no known vulnerabilities in the installed dependency tree. This is a registry advisory check, not a security certification.
