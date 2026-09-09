# Privacy and moderation

## Implemented local behavior

- No account, email, birthday, profile, fingerprint, analytics, tracking cookie, or hidden identifier.
- Clock ages, explicitly opened memory scenes, and the chosen Wall pairing are transient interface state. They are not copied into the reflection or stored. Opening scenes records only explicit choices for this page; the app does not measure reading time, hovering, or dwell duration. Reloading clears these choices.
- A reflection contains only `text` (trimmed, 1–240 UTF-16 code units) and `age` (optional integer 1–120). React renders it as text, never HTML.
- Unsubmitted text lives in memory. Submitting without the unchecked persistence option keeps one reflection in memory for the current page only.
- If the visitor explicitly selects persistence, the same two-field record is saved under `timempathy.reflection.v1` in localStorage. There is no history or timestamp. A saved reflection survives until removed or browser storage is cleared.
- This is device-local storage, not encryption or a secure vault. Other users of the browser can read it. The UI says so before opting in.
- The removal action removes the app's single storage key. A failed write falls back to a clearly disclosed session-only thought. A failed deletion leaves the thought visible and explains how to clear site storage. Malformed stored data is not rendered; the app reports that it could not be read.
- Browser deletion is not forensic erasure and cannot remove copies a visitor has made. No synchronization exists between tabs or devices. A stale tab may display an old in-memory copy until it is reloaded.
- No reflection is transmitted, publicly displayed to other visitors, or mixed into the sample dataset. The local preview carries the label “Your private thought.”
- All fonts and assets are local. Research links are ordinary external links with `rel=noreferrer`; visiting them is a deliberate outbound action.
- The development server is bound to `127.0.0.1`. No public deployment or remote repository write has been performed.

## Public wall architecture — designed, not implemented

A public wall must have a real moderation boundary. Adding a POST endpoint that immediately populates the wall is not an acceptable next step.

### Data boundary

Use a small conventional backend with a relational database and a separate authenticated moderation view. Do not build a custom authentication system: choose a maintained provider or established self-hosted auth package once hosting is selected. The public read API must query only approved records. Raw submissions and moderation reasons must never be included in the public API, client bundles, static assets, or public error messages.

Proposed contribution record: random opaque ID, text, integer age, language, status, created timestamp, review timestamp, and expiry timestamp. Public projection: opaque contribution ID, approved text, and age only. The contributor gets an unguessable deletion receipt; store only its hash server-side. No public user identity or long-lived visitor identifier.

### Lifecycle

`received → pending review → approved | rejected`; an approved item can later become `withdrawn` or `quarantined`. Every state change is audited in the private moderator system. If the moderation service is unavailable, submissions remain pending and nothing new becomes public. The server enforces schema validation, request size limits, and rate limiting; client-side validation is supplementary.

Human review precedes publication. Automated checks may flag spam, links, contact details, hate, sexual content, harassment, threats, or self-harm material, but must not be treated as comprehensive moderation. No model should rewrite a visitor's hope or decide what it ought to mean. Any future vendor use requires its own privacy and authority decision.

### Abuse prevention and care

- Establish written moderation criteria and reviewer coverage before accepting submissions.
- Protect the moderation view with established authentication, least privilege, and short sessions.
- Give visitors a discreet reporting mechanism; reported material can be quarantined while reviewed.
- Use bounded rate limits. If IP-derived data is needed, use a short-lived keyed digest and a small expiry; do not retain raw IP addresses by default. Reverse-proxy and hosting logs must also be reviewed rather than assuming the application controls all collection.
- Avoid making distress performative. Define a humane private response path and locally appropriate support information before accepting high-risk content. The site must not suggest that anonymous submission provides emergency care or a monitored support channel.
- Set explicit retention and deletion policies, including backups. Initial engineering proposal: expire abandoned/rejected submissions after seven days, delete short-lived rate-limit records within 24 hours, and revisit approved content after 90 days. These are proposals, not promises made by the current product.
- Design for deletion receipts, takedown/reporting, and moderation failures in integration tests. Verify pending records are inaccessible even with guessed IDs and manipulated queries.

### Creator decisions before launch

The creator must approve the intended audience (including how minors are handled), publication territory, moderation responsibility and funding, retention policy, hosting destination, and any external processor. Those choices carry real ongoing obligations. No legal compliance determination has been made here. This document is an engineering design for review, not a claim that a public launch is already authorized or safe.
