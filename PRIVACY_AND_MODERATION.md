# Privacy and publication

## Creator direction

On 2026-09-10 the creator specified: “Any user can participate, let there be no manual review at this stage.” This supersedes the earlier pending-first/manual-review proposal in this document and the original brief. PROJECT.md remains unchanged as the historical brief. The current implementation has no moderator account, inbox, pending state, or approval gate.

The creator selected Cloudflare Workers + D1 for the public launch. The existing local workflow stays available on loopback. The private GitHub repository backs up project code, never the Wall database, private reflections, or removal keys. Local and test databases are never imported into the public Wall. Deployment steps and the account-access boundary are in DEPLOYMENT.md.

## Private reflection

- No account, email, birthday, profile, fingerprint, analytics, tracking cookie, or persistent visitor identifier.
- Clock ages, memory choices, and encounters last only for the visit. There is no dwell measurement or inferred attention. Borrowing a shared hope's age does not save it in the visitor's reflection.
- A private reflection has only trimmed text (1–240 UTF-16 code units) and an optional integer age (1–120). React renders all words as text, never HTML.
- Writing and **Keep this thought** never submit words to the server. Without the separate unchecked persistence option, the thought lives only in page memory.
- Explicit browser persistence saves those two fields under `timempathy.reflection.v1`. There is no history or timestamp. Other users of the same browser can read it; this is disclosed before opting in. It is not encryption or a secure vault.
- Removing the private copy removes that one storage record. Failed persistence falls back to disclosed visit-only storage. Failed deletion keeps the thought visible and explains how to clear site storage. Removing the private copy does not withdraw a shared hope, and the active removal key remains available.
- Browser storage is origin-specific. Private copies in different tabs do not synchronize; an old tab can retain its in-memory copy. Deletion cannot erase screenshots or copies someone has made.

## Explicit sharing

**Offer it to the Wall** presents the audience, lifetime, automated checks and removal method before transmission. Sharing requires an age and an unchecked agreement checkbox. Participants do not need an invitation or account. The server validates agreement and the current consent version as well as the words and age.

Accepted words are published immediately, unchanged apart from trimming outer whitespace. The public projection contains only a random contribution ID, text and age. The server stores a consent version, creation/expiry times, state, and a hash of the removal key. Public reads never include keys, hashes, timestamps or private reflection records.

The client creates a cryptographically random 256-bit key for a sharing attempt. The same key makes retries idempotent and later authorizes withdrawal. The raw key is sent only in the submission body or an Authorization header, never a URL. Only its SHA-256 hash is stored server-side. The key is shown to its author, with an explicit copy control, and is not automatically persisted in the browser. Anyone holding it can remove that hope; a lost key cannot be recovered through an account.

If a response is lost after acceptance, retrying cannot create another copy. **Withdraw and keep it private** attempts to remove any accepted request before closing the sharing choice. If this cannot be confirmed, the UI keeps the key available and explains the uncertainty. Closing the page can still lose a key that the visitor has not copied.

## Automatic checks and removal

The server rejects oversized/malformed input, obvious links, email addresses, phone-like strings, handles, hidden control characters, and matches from Obscenity's English dataset. Rejected words are not stored. These heuristics can miss harmful or identifying content, especially outside English, and can reject benign words. They do not detect every name, location, threat or other concern. Checks run inside the application; no external moderation provider receives the words, and nothing rewrites hopes or interprets their meaning. On the public deployment, Cloudflare hosts the application and processes shared words.

- Accepted: `shared` immediately; there is no pending review state.
- Author withdrawal: text and age are set to NULL; state becomes `withdrawn`.
- Reader flag: text and age are set to NULL; state becomes `flagged` immediately, with no review queue. Readers choose a reason to make the consequence clear, but the reason and reporter identity are not retained. Flags can be misused to remove benign hopes; this is a tradeoff of the creator's current no-review stage.
- Both removal states retain only the receipt/consent metadata until the original expiry, preventing a retry from restoring the words. No public report counts, reactions or ranking exist.
- After seven days, the entire contribution/receipt row expires. Both APIs exclude expired rows immediately. The local server deletes expired rows on startup, requests and a minute timer. The hosted Worker deletes them hourly and before accepting a new contribution; an idle hosted database may retain expired rows for up to an additional hour, or longer during a provider outage.

The client refreshes shared hopes on focus/visibility, by explicit refresh, and every 30 seconds while the page is visible. Other readers can retain an already rendered copy until their next successful refresh; offline pages and screenshots cannot be recalled. Failed refresh clears the live list rather than presenting it as current. A removal request deletes only the shared record, never an author's private browser copy.

## Local service and storage

Fastify handles requests, size limits and errors. Maintained rate-limit middleware uses a per-process keyed digest of the connection IP in memory, with a one-minute rate window. The digest is an abuse-control key, not a visitor history. Request logging is disabled; the application does not write raw IP addresses, request bodies, or removal keys to logs. The library's bounded in-memory cache can retain expired counters until expiry access/eviction or process exit; there is no persistent rate-limit store.

Limits are 90 requests per minute per connection IP, with five per minute on sharing and reporting routes. These limits include the same-origin service, are deliberately small for the local prototype, and are not a complete public abuse-prevention system. Proxy-provided client IP headers are not trusted. Mutation requests require an explicitly configured Origin; the Host must match a configured local address. No CORS access is enabled. Error responses do not echo submitted content. API responses are marked no-store.

Node's built-in SQLite stores up to 200 records in `.local/wall/prototype.sqlite`, including unexpired removal receipts. SQLite uses DELETE journaling and secure_delete for removed cells. This is local filesystem storage, not encryption or a promise of forensic erasure. No application backup of the database exists. The database and transient test artifacts are Git-ignored. Tests use an isolated in-memory database or a disposable test file and never seed the normal Wall with fictional people.

Fonts and assets ship with the app. Research links are ordinary external links with `rel=noreferrer`; following them is a visitor action. On a static-only host, the shared API is unavailable and private reflection and the clearly imagined Wall remain usable.

## Cloudflare hosting

The hosted API uses Hono and D1. Sharing requires the separate `public-wall-v1` consent version and explains the public audience before submission. The local consent version is rejected by the hosted API. Anyone on the internet can read or copy public hopes. Readers may retain an already loaded copy; deleting a contribution cannot erase screenshots or third-party copies.

Cloudflare receives normal connection information when serving the website. Private reflection text stays in the browser until explicitly shared. The application adds no analytics or request logging, and Workers observability is disabled in configuration. Cloudflare can still process operational and security data under its own service policies; disabling application logs is not a promise that the provider stores nothing.

Rate limiting uses Cloudflare's native counters: 90 API requests per minute and five per minute for each of sharing and flagging. The key is an hourly rotating HMAC of Cloudflare's trusted connection-IP header using a Worker secret; raw IPs and removal keys are not stored in D1 or rate-limit keys. Counters are approximate and local to a Cloudflare location. People sharing a network share an allowance. These are limited abuse controls, not identity verification or comprehensive protection. No persistent visitor identifier is created. Withdrawal has its own route and is not blocked by the sharing allowance; the general API allowance still applies.

Only the configured published origin is accepted, with an exact same-origin check for mutations and no CORS permission. API responses are `no-store`; static files are served directly with a restrictive content security policy, no-referrer and no framing. The application does not cache the feed. D1 read replication is not enabled. A transactional insert plus a unique removal-key hash prevents concurrent retries or submissions from creating duplicates or exceeding the 200-record capacity, which includes unexpired removal receipts.

D1 automatically retains recovery history for **seven days on Workers Free**. Cleared words can therefore remain in provider recovery history for up to seven more days after database deletion. This is disclosed before public sharing. The application cannot promise immediate physical erasure from provider backups. Do not restore an old Wall backup into public service: it could resurrect withdrawn or flagged words. For this temporary Wall, prefer a fresh empty database after unrecoverable corruption. If the account moves to Paid, review the longer recovery window and update the disclosure before accepting contributions.

Sources: [D1 limits and backup windows](https://developers.cloudflare.com/d1/platform/limits/), [D1 recovery](https://developers.cloudflare.com/d1/reference/time-travel/), [rate-limit behavior](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [Cloudflare privacy policy](https://www.cloudflare.com/privacypolicy/).

This document describes engineering behavior; it does not claim comprehensive moderation or a legal compliance determination.
