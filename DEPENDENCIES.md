# Dependencies and licenses

Exact versions are pinned in `package.json` and `pnpm-lock.yaml`. The application has eleven direct runtime packages. Its shared Wall uses a local service; no paid or externally hosted dependency is required.

| Package                     | Version | License                                | Why it is here                                                |
| --------------------------- | ------- | -------------------------------------- | ------------------------------------------------------------- |
| React / React DOM           | 19.2.8  | MIT                                    | Declarative interaction and component state                   |
| Motion                      | 13.2.0  | MIT                                    | Component transitions and reduced-motion preference detection |
| Lucide React                | 1.43.0  | ISC, with inherited Feather MIT notice | A few consistent interface icons                              |
| Zod                         | 4.5.4   | MIT                                    | Input and stored-data validation with inferred types          |
| Fontsource DM Sans          | 5.3.0   | SIL OFL 1.1                            | Locally served readable interface type                        |
| Fontsource Instrument Serif | 5.3.0   | SIL OFL 1.1                            | Locally served editorial type                                 |

| Fastify | 5.12.3 | MIT | Maintained HTTP routing, body limits, validation boundary and errors |
| @fastify/rate-limit | 11.2.0 | MIT | Bounded request rate controls |
| @fastify/static | 10.1.3 | MIT | Same-origin built-app preview beside the API |
| Obscenity | 0.4.6 | MIT | Local heuristic English language check |

Node 24.15+ supplies SQLite through its built-in module (tested on 24.19.0); there is no native database add-on to compile. The SQLite API is at release-candidate stability in this Node line. Generic HTTP, limiting and storage behavior use maintained implementations; original work remains the relationship between reflection, a shared hope and its clock.

Primary references: [Fastify server](https://fastify.dev/docs/latest/Reference/Server/), [rate-limit](https://github.com/fastify/fastify-rate-limit), [static serving](https://github.com/fastify/fastify-static), [Node SQLite](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html), [Obscenity and its limitations](https://github.com/jo3-l/obscenity).

Development tools: Vite 8.2.2 and its React plugin 6.1.1 (MIT); TypeScript 7.0.2 (Apache-2.0); Vitest 5.0.0 (MIT); Playwright 1.63.0 (Apache-2.0); axe-core / Playwright 4.13.0 (MPL-2.0); Prettier 3.9.6 (MIT); Node/React type definitions (MIT). Installed package metadata and upstream license files are the source of truth.

Run `pnpm licenses:generate` after changing a runtime dependency. The script traverses the installed runtime dependency graph and preserves the full license notices for all 85 runtime packages in `public/third-party-notices.txt`; Vite includes this file in the production build. The script fails if a package lacks a discoverable notice or a version-specific reviewed copy. abstract-logging 2.0.1 omits a standalone file; its README links the author’s MIT license page. A source-attributed copy is kept in scripts/license-notices/abstract-logging@2.0.1.txt. The build preserves that notice as well. Original font license text is included.

Generic UI is deliberately native where it fits: buttons, links, ranges, textarea, checkbox, number input. React manages the scene, Motion handles transition mechanics, and SVG carries Timempathy's own visual idea. A large UI kit, WebGL engine, AI SDK or date library would add cost without solving a demonstrated need. SQLite now solves an actual requirement: keeping shared hopes available to a second visitor and deleting them reliably.

The dependency audit on 2026-09-10 reported no known vulnerabilities in the installed dependency tree. This is a registry advisory check, not a security certification.

## Cloudflare deployment

Hono 4.13.7 (MIT) provides Workers-compatible HTTP routing and bounded request-body middleware. Cloudflare Workers supplies static hosting and native short-lived rate counters; D1 supplies managed SQLite with transactional batches. These replace the Node/Fastify transport only for hosted deployment. Zod and Obscenity rules are shared between both backends.

Wrangler 4.130.0 (MIT OR Apache-2.0) and @cloudflare/workers-types 5.20260908.1 are development-only. Wrangler includes Cloudflare's local Workers runtime and test harness. Its declared esbuild and workerd install scripts are allowed explicitly in pnpm-workspace.yaml; arbitrary package build scripts are not enabled. No GPU, new UI library, or analytics dependency was added. Runtime notices now include Hono.

The local Miniflare dependency is constrained to sharp 0.35.4 through a narrow pnpm override, fixing [GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c) in its bundled image decoder. The public site does not process uploaded images or ship sharp.
