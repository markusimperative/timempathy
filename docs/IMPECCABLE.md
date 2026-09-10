# Impeccable setup

Installed on 2026-09-10 from [pbakaus/impeccable](https://github.com/pbakaus/impeccable/tree/cd12f8660e2dde57b9615c8a6b8ea674101f9cfc), revision cd12f8660e2dde57b9615c8a6b8ea674101f9cfc. The Codex distribution is .agents/skills/impeccable; skill version 4.3.1, engine version 0.1.5. Installation used Codex's skill-installer helper with that exact repository, path, and revision.

The user-wide skill is installed at C:/Users/mamat/.codex/skills/impeccable. The Windows launcher is scripts/impeccable.cmd under that directory. Its first context invocation downloaded the engine from the upstream release and verified its SHA-256 sidecar before execution. This is development tooling, not an application dependency. The upstream repository is Apache-2.0 licensed.

## Project initialization

[PRODUCT.md](../PRODUCT.md) records the existing creator brief and subsequent decisions using Impeccable's product schema. It preserves [PROJECT.md](../PROJECT.md) and the current identity. No new aesthetic, user research, public-launch permission, or audience policy is implied. The creator's standing instruction to resolve routine implementation decisions supplied the authority to initialize from the extensive existing context without another interview.

.impeccable/live/config.json targets the Vite app's index.html shell. The context loader ran successfully; detect-csp reported no policy, and the running app returned HTTP 200 with no CSP header. No security policy, HTML injection, or automatic edit hook was added. Live mode is configured for a later explicit session; it is not running. Runtime output and per-developer state are excluded from Git.

No standing image-first/code-first buildPath preference was recorded. This initialization performs no new visual build. The next surface can use the workflow appropriate to that request without treating an unanswered preference as creator approval.

## Use

The skill becomes available on the next Codex turn. Invoke $impeccable with a scoped command, such as $impeccable critique the clock experience. For a live browser session, invoke $impeccable live. Keep the working directory at the project root when using the Windows launcher directly.

Future refinements must preserve the current identity and the creator's restraint, accessibility, privacy, and emotional intent. The original brief and explicit creator instructions take precedence over generic skill advice.
