# Privacy and publication

## Creator direction

On 2026-09-10 the creator specified: “Any user can participate, let there be no manual review at this stage.” This supersedes the earlier pending-first/manual-review proposal in this document and the original brief. PROJECT.md remains unchanged as the historical brief. The current implementation has no moderator account, inbox, pending state, or approval gate.

The complete flow runs on loopback. No public hosting or external content processor has been connected. The private GitHub repository backs up project code, never the local Wall database, private reflections, or removal keys.

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

The server rejects oversized/malformed input, obvious links, email addresses, phone-like strings, handles, hidden control characters, and matches from Obscenity's English dataset. Rejected words are not stored. These heuristics can miss harmful or identifying content, especially outside English, and can reject benign words. They do not detect every name, location, threat or other concern. No text is sent to an AI model or external moderation provider; no model rewrites hopes or interprets their meaning.

- Accepted: `shared` immediately; there is no pending review state.
- Author withdrawal: text and age are set to NULL; state becomes `withdrawn`.
- Reader flag: text and age are set to NULL; state becomes `flagged` immediately, with no review queue. Readers choose a reason to make the consequence clear, but the reason and reporter identity are not retained. Flags can be misused to remove benign hopes; this is a tradeoff of the creator's current no-review stage.
- Both removal states retain only the receipt/consent metadata until the original expiry, preventing a retry from restoring the words. No public report counts, reactions or ranking exist.
- After seven days, the entire contribution/receipt row expires. Cleanup runs on startup, on requests, and every minute while the server is running. When stopped, no timer runs; expiry is applied on the next startup before serving data.

The client refreshes shared hopes on focus/visibility, by explicit refresh, and every 30 seconds while the page is visible. Other readers can retain an already rendered copy until their next successful refresh; offline pages and screenshots cannot be recalled. Failed refresh clears the live list rather than presenting it as current. A removal request deletes only the shared record, never an author's private browser copy.

## Local service and storage

Fastify handles requests, size limits and errors. Maintained rate-limit middleware uses a per-process keyed digest of the connection IP in memory, with a one-minute rate window. The digest is an abuse-control key, not a visitor history. Request logging is disabled; the application does not write raw IP addresses, request bodies, or removal keys to logs. The library's bounded in-memory cache can retain expired counters until expiry access/eviction or process exit; there is no persistent rate-limit store.

Limits are 90 requests per minute per connection IP, with five per minute on sharing and reporting routes. These limits include the same-origin service, are deliberately small for the local prototype, and are not a complete public abuse-prevention system. Proxy-provided client IP headers are not trusted. Mutation requests require an explicitly configured Origin; the Host must match a configured local address. No CORS access is enabled. Error responses do not echo submitted content. API responses are marked no-store.

Node's built-in SQLite stores up to 200 records in `.local/wall/prototype.sqlite`, including unexpired removal receipts. SQLite uses DELETE journaling and secure_delete for removed cells. This is local filesystem storage, not encryption or a promise of forensic erasure. No application backup of the database exists. The database and transient test artifacts are Git-ignored. Tests use an isolated in-memory database or a disposable test file and never seed the normal Wall with fictional people.

Fonts and assets ship with the app. Research links are ordinary external links with `rel=noreferrer`; following them is a visitor action. On a static-only host, the shared API is unavailable and private reflection and the clearly imagined Wall remain usable.

## Online hosting boundary

Public deployment has not been performed. A concrete hosting destination, persistent storage, TLS/origin configuration, provider logging and backup/deletion behavior still need to be settled for that deployment. The current local implementation and its no-manual-review publication policy are reviewable without external accounts or processors. This document describes engineering behavior; it does not claim comprehensive moderation or a legal compliance determination.
