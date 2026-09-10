# Cloudflare Workers + D1

Live: [Timempathy](https://timempathy.timempathy.workers.dev/), first deployed 2026-09-10. Worker: `timempathy`; D1: `timempathy-wall`, EU jurisdiction, read replication disabled. The schema is applied and the rate-limit secret is installed. Use the later-release workflow for this existing deployment.

The creator authorized this hosting route. Keep the account on **Workers Free**; do not upgrade, purchase a domain, or attach a paid plan as part of deployment. Current free limits: 100,000 Worker requests/day, D1 5 million rows read and 100,000 rows written/day, 500 MB per database and 5 GB total. Static asset requests are free and unlimited. Quotas are shared across an account. Hitting a quota can interrupt the Wall; this setup does not promise unlimited traffic.

The configured Worker serves only `/api/*`; the asset service serves the React build and fonts directly. D1 stores only explicitly shared hopes and removal receipts. Keep D1 read replication off so a removed hope cannot be served from a lagging read replica. No analytics, paid services, domain, external moderation provider, or extra content processor is configured.

## Before first deployment

1. Run `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm cf:check`, and `pnpm test:worker`.
2. Run `pnpm cf login --device --scopes account:read user:read workers_scripts:write d1:write`. Enter the displayed code on Cloudflare’s website and approve access for the account intended for this project. This flow avoids a local browser callback. The wrapper sets Wrangler’s configuration directory to `.local/cloudflare/config`, discards inherited API credentials, and refuses the legacy global-directory fallback. OAuth credentials remain in that ignored directory, separate from other projects. Never paste tokens into chat or commit credentials.
3. Record the selected account ID in `wrangler.jsonc`. These IDs are identifiers, not secrets. Stay on Workers Free. Inspect only this project's resources; if `timempathy` or `timempathy-wall` already belongs to another project, choose a new name before continuing.
4. Create a fresh database with `pnpm cf d1 create timempathy-wall --jurisdiction eu`. Put the returned database ID into the existing `DB` entry in `wrangler.jsonc`. Never import `.local/wall/prototype.sqlite` or test fixtures. The EU restriction applies to D1 storage; it does not claim all HTTP processing stays in the EU.
5. Apply the schema: `pnpm cf d1 migrations apply timempathy-wall --remote`.
6. Set `PUBLIC_ORIGIN` to the exact HTTPS address, such as `https://timempathy.<your-subdomain>.workers.dev`. Configure the account's free workers.dev subdomain if this is its first Worker. No custom domain is needed.
7. Publish with `pnpm cf deploy`. The Wall fails closed until the secret below is set; static browsing works.
8. Run `pnpm cf secret put RATE_LIMIT_SECRET` and enter a fresh random secret of at least 32 characters at the hidden prompt. Keep it in Cloudflare's secret store, never in source. The example `.dev.vars` value is for local use only.
9. Check the public page and `/api/wall` over HTTPS, confirm the feed starts empty, inspect desktop/mobile rendering, and verify privacy copy. Use the isolated local browser test for fixture-heavy testing. A real public smoke contribution must be clearly labelled as a deployment check and withdrawn immediately using its key.

After authorization, `pnpm cf whoami` shows the selected account details without printing credentials.

## Local Cloudflare development

Copy `.dev.vars.example` to `.dev.vars`, run `pnpm cf:migrate:local`, then `pnpm build` and `pnpm cf:dev`. Open `http://127.0.0.1:8787`. Local D1 lives in the ignored `.wrangler/` directory. It is independent of the Fastify database used by `pnpm dev` and `pnpm preview`.

`pnpm test:worker` uses Cloudflare's official test harness with isolated local D1. It applies the real migration, tests concurrency, capacity, expiry, deletion, origin checks, limits, database outages and asset headers, then runs the existing independent-browser exchange. The normal local and hosted databases are never seeded by that test.

## Later releases and recovery

Run the checks, review pending SQL migrations, apply only those migrations to this project's database, then deploy the tested source. Do not enable preview URLs against the real Wall. Keep account and database IDs fixed in configuration to prevent accidental cross-account deployment. Back up code in the existing private repository; no hosted database data belongs in Git.

A code rollback must remain compatible with the current D1 schema and consent contract. Do not roll back database history to recover code: D1 recovery can restore previously withdrawn words. Prefer a fresh empty Wall after unrecoverable corruption. The private reflection experience works even when the Wall is offline.

Expired contributions disappear from API responses at seven days. An hourly scheduled job physically removes expired rows; sharing also prunes them. D1 Free recovery history can retain deleted words for seven additional days. If changing the plan, update retention disclosures first. No automatic backup export is configured.

Sources: [static asset pricing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [device login](https://developers.cloudflare.com/workers/wrangler/commands/general/#login).
