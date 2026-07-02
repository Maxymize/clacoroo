# Changelog

> English translation of [CHANGELOG.md](./CHANGELOG.md) (Italian, canonical). Updated in sync with each release.

## v1.2.2 — 2026-07-01 — Fix: Fable 5 cost not calculated

- [FIX] Fable 5 sessions showed up as $0 cost in stats: the reference price for this model was missing. Now calculated correctly, same as every other model

## v1.2.1 — 2026-07-01 — Models: mirror Claude Code's selector

- [FIX] The model dropdown in Claude Config now shows only the tiers selectable by default in Claude Code (Default, Opus, Sonnet, Haiku, Fable), written as aliases. `sonnet` always points to the current Sonnet model (Sonnet 5 today), so it stays valid with future models too
- [IMPROVEMENT] The specific "other/previous" IDs (e.g. Opus 4.7, Sonnet 4.6) are out of the dropdown; in Claude Code they live behind "Other models" or need `--model`. Values already saved in settings.json are preserved

## v1.2.0 — 2026-07-01 — Sonnet 5 in the model list + Sessions consolidated

- [FEATURE] Sonnet 5 (`claude-sonnet-5`) is now selectable among the models in Claude Config; pricing and the "Sonnet 5" name are recognized in the cost statistics and session cards too
- [REFACTOR] Internal cleanup of the Sessions section (behavior unchanged)

## v1.1.39 — 2026-06-30 — Sessions: project drill-down + global search + breadcrumb

- [FEATURE] Sessions view is now two-level: a grid of projects (one card per folder, with session count, cost, turns) → sessions for the selected project, with breadcrumb to go back
- [FEATURE] Global search: typing filters sessions across all projects at once; sort projects by last activity, creation, cost or session count
- [FEATURE] Each session card shows the exact creation and last-modified date and time, alongside the "x days ago"
- [FIX] Cleaner first-message preview: skips IDE context tags and /watch skill output instead of showing them as the prompt
- [FIX] More readable transcript: content padding and bullet lists no longer clipped against the edge

## v1.1.38 — 2026-06-29 — Sessions: list page + readable transcript modal

- [FEATURE] New Sessions page: list of all work sessions in ~/.claude/projects/ with cards (folder, first message, time, turns, cost) or compact row view
- [FEATURE] Search by folder or first message, sort by last activity or creation date, toggle cards/list view
- [FEATURE] Transcript modal: click a session to read the conversation with windowing (40 entries at a time, loads more on scroll), collapsible tool calls
- [FEATURE] Quick actions in the modal: resume in internal terminal, open external terminal, copy `claude --resume` command, open folder

## v1.1.37 — 2026-06-29 — Live stats: tokens in plain sight, real cost, attribution

Statistics are now computed live from your session transcripts, no longer from a cache that lagged behind. More accurate and more transparent.

- [FEATURE] Live-computed Stats: "work tokens" (input + output) front and center, with cache (read/write) separated and explained instead of one billions-large number inflated by re-read context
- [FEATURE] Real API cost per token type (input/output/cache), per model and per project — the equivalent value of what you actually consumed
- [FEATURE] New **Attribution** tab: how much cost is attributable to each plugin/skill/agent/MCP server, plus the main-session vs subagent split
- [FEATURE] New **Efficiency** tab: cache hit ratio, average context per turn, turns over 150k tokens, and most-used tools with error rate
- [IMPROVEMENT] Heatmap, models, projects and all metrics respect the period filter (7d / 30d / All)

## v1.1.36 — 2026-06-25 — MCP: connected/failed servers visible again + project scope

- [FIX] The MCP panel only showed "needs auth" servers and reported "0 connected": the `claude mcp list` parser didn't recognize Claude Code's current status symbols (✔ connected, ✘ failed) and silently dropped every connected and failed server. They all show again now
- [FIX] A plugin's detail showed "MCP —" even for plugins that provide MCPs (e.g. claude-mem, cloudflare, neon, context7, supabase): detection looked for `mcp.json` instead of the standard `.mcp.json`. It now detects the servers, shows their count and lists their names in the plugin detail
- [FEATURE] Project-scoped MCPs (defined in `.claude.json` for a folder) are now shown too, with a "project: …" badge and a "From project" filter. The **Remove** trash button now works on them too (not just user-added ones) and actually drops them from the config
- [FEATURE] **"Disconnect"** button on connected OAuth MCP servers (HTTP/SSE): clears the authentication (`claude mcp logout`) so you can re-authorize them, even with a different account — handy to move an MCP from one account to another
- [IMPROVEMENT] MCPs provided by a plugin: the card explains they're managed from the plugin and a **"Manage plugin"** button jumps straight to the owning plugin in the Plugins section; claude.ai connectors note they're managed on claude.ai. The remove confirmation reminds you that already-open `claude` sessions keep seeing the server until restarted

## v1.1.35 — 2026-06-24 — Claude Quota: dedicated tab + stop consuming rate-limit

A new tab for quota and usage insights, and CLACOROO no longer eats into your account's limits/overload while left open.

- [FEATURE] New **Claude Quota** tab in Stats: your limit bars (Session 5h, Weekly 7d, Weekly Sonnet) and "What's contributing to your limits" with a Day/Week switch (>150k context, subagent-heavy, 8+ hours, 4+ parallel, per-plugin). Computed locally from transcripts, zero API calls
- [FIX] CLACOROO no longer refreshes the OAuth token: refreshing could invalidate the one Claude Code uses (rotating refresh token), causing limit/overload warnings in open `claude` sessions. It now only reads the current token; if expired it just reports it and lets Claude Code refresh it
- [IMPROVEMENT] Background quota polling is now **Manual by default**: when idle, CLACOROO no longer queries the quota endpoint (shared with Claude Code's rate-limit). It refreshes when you open the Quota tab/Dashboard or hit refresh; auto can still be re-enabled in Settings
- [IMPROVEMENT] New round **"?"** button in the top bar (right of Terminal): opens the documentation on clacoroo.app in the interface language

## v1.1.34 — 2026-06-18 — Claude Config: permissions editor

- [FEATURE] New **Permissions** row in Claude Config: manage the rules that decide what Claude Code can do without asking (allow), what it always asks for (ask), and what is forbidden (deny), plus the default mode. Collapsible lists with search, format validation, a warning when a rule grants overly broad access or already exists in another list, and a button to copy a rule on the fly to move it between lists. The allow/deny/ask lists apply immediately to already-open Claude Code sessions; the default mode applies to new sessions
- [FIX] The "Disabled" badge on a plugin card and the details of the "Plugins by weight" modal (title, footer, context-window percentage) now follow the interface language (IT/EN) instead of staying in fixed Italian
- [IMPROVEMENT] The model menu in "Plugins by weight" now dynamically lists the models measured by Claude Code: it adapts on its own when new ones appear, with no versions hard-coded

## v1.1.33 — 2026-06-16 — API key: low credit balance warning

- [FIX] When testing the Claude API key and the account has insufficient credit (HTTP 402), CLACOROO now shows a clear warning ("⚠ Credit balance too low — add funds at platform.anthropic.com/settings/billing") instead of a generic HTTP error
- [DOCS] README (EN+IT): app screenshot grid + updated Gatekeeper note

## v1.1.32 — 2026-06-16 — Fix i18n: changelog badge, health issues, terminal

- [FIX] "Current" badge in the Changelog modal now follows the interface language (IT/EN)
- [FIX] Health error messages on agent/skill cards now follow the interface language
- [FIX] Integrated terminal was not opening (black screen): local variable `t` in the tab loop was shadowing the global `t()` function
- [IMPROVEMENT] Context Estimate removed from the Plugins page: only shown in Dashboard and Stats

## v1.1.31 — 2026-06-16 — DMG: installer window background in English

- [CHORE] The text in the macOS DMG installer window is now in English ("Drag CLACOROO to the Applications folder")

## v1.1.30 — 2026-06-16 — macOS: Developer ID signing + automatic notarization in CI

- [FEATURE] macOS DMGs produced by CI are now signed with a Developer ID certificate and notarized by Apple: no more "unverified developer" warning on launch. The GitHub Actions workflow imports the certificate into an ephemeral temporary keychain and runs `xcrun notarytool submit --wait` + `xcrun stapler staple` before publishing the installers

## v1.1.29 — 2026-06-15 — Translations: last remaining strings (terminal, hooks, MCP, misc)

- [FIX] Translated the last strings still hardcoded in Italian that showed regardless of the chosen language: terminal and tab tooltips, missing hook-dependency warnings (and their terminal messages), MCP chips and badges on the Dashboard, the heatmap legend, search placeholder and account tooltip. They now all follow the interface language (IT/EN)

## v1.1.28 — 2026-06-15 — Quotas: honor Retry-After on rate limit

- [FIX] When the usage/quota endpoint responds "too many requests" (429) and tells the client how long to wait (the `Retry-After` header), CLACOROO now honors that delay instead of using only its own fixed backoff. Reduces the app's contribution to the account-wide rate limits it shares with Claude Code itself

## v1.1.27 — 2026-06-14 — New-version banner only when the download is ready + Homebrew

- [FIX] The "new version available" banner no longer shows while the installers are still being published: it now waits until at least one downloadable file (.dmg/.exe/.AppImage/.deb/.rpm) is actually uploaded to the release. Before, it could appear early and lead to downloading the previous version
- [DOCS] Install and update via **Homebrew** on macOS: `brew install --cask maxymize/clacoroo/clacoroo`; to update `brew update && brew upgrade --cask clacoroo`. Added to the READMEs (EN+IT) and clacoroo.app

## v1.1.26 — 2026-06-03 — MCP: enable/disable toggle to save tokens

- [FEATURE] MCP servers you added now have an enable/disable toggle (like plugins): turn one off when you don't need it to remove its tools from the context and save tokens, turn it back on in one click when you do. Disabling asks for confirmation; the configuration is saved so you can re-enable it without re-entering it
- [IMPROVEMENT] Skill and agent cards now show "Managed by the X plugin": skills and agents can't be toggled individually, they're enabled or disabled together with the plugin that provides them

## v1.1.25 — 2026-06-03 — Updates: download link always to the official site

- [FIX] The "Open download page" button (banner and footer) now always opens the official clacoroo.app/download page, never the raw GitHub release page

## v1.1.24 — 2026-06-03 — Configurable quota refresh frequency

- [FEATURE] New "Data refresh frequency" setting: choose how often CLACOROO refreshes the live Dashboard data (from 30 seconds up to 60 minutes, or Manual to refresh only with the Refresh button). The same cadence refreshes everything: quotas, context estimate, statistics, Plugins by weight and Claude Code usage. Lower intervals refresh more often but use the API more
- [FEATURE] New "Last update" badge in the center of the Dashboard header, with a live minutes-and-seconds counter (e.g. "1m 23s") and the active mode ("Auto every 30 s" or "Manual"). The first refresh runs as soon as the app opens; in auto mode it resets on each refresh, pressing Refresh resets it to zero
- [IMPROVEMENT] When the API rate-limits requests, the "Updates paused" note now suggests increasing the refresh interval in Settings

## v1.1.23 — 2026-05-31 — Feedback: report bugs and request features

- [FEATURE] New "Feedback" button in the sidebar footer: opens a form on the website where you can report a bug or request a new feature. The form opens in the app's language

## v1.1.22 — 2026-05-31 — Updates: automatic detection on launch

- [IMPROVEMENT] On every launch CLACOROO now checks right away for a new version (before, it could skip the check and show stale data), then re-checks automatically every 3 hours while the app is open — no longer every 24 hours
- [IMPROVEMENT] The launch check is silent: the banner appears only when there's an actual update, no message on every start. The "Check for updates" button still confirms the result
- [IMPROVEMENT] The "Open download page" button (banner and footer) now opens the official clacoroo.app/download page instead of the raw GitHub release page

## v1.1.21 — 2026-05-31 — Usage readout: no more account rate-limiting

- [FIX] When Anthropic's API was rate-limiting requests, CLACOROO kept polling it, adding to your account's limit — which could spill over to Claude Code too. It now backs off automatically and retries later, without interfering
- [IMPROVEMENT] During a pause, the quota bars show the last known values with a discreet note ("Updates paused…") instead of a raw technical error

## v1.1.20 — 2026-05-29 — Update check: detects new versions

- [FIX] The update check now correctly detects newly published versions: it previously always said "you're up to date" because it queried an endpoint that ignored the most recent releases

## v1.1.19 — 2026-05-29 — Windows: Claude Code detection and terminal

- [FIX] On Windows CLACOROO now correctly detects the Claude Code binary (`claude.exe`/`claude.cmd` in the typical install paths): account status and CLI-backed actions work again
- [FIX] The integrated terminal now finds `claude` even when the app starts with a reduced PATH: the detected binary's folder is prepended to the terminal PATH (also helps on macOS for apps launched from Finder)

## v1.1.18 — 2026-05-29 — Missing translations + readable update tooltip

- [FIX] The "temporary local edit" warning in the .md file editor and all messages in that window now follow the interface language (they were always in Italian before)
- [FIX] The update button tooltip (next to the version number) is now translated and no longer clipped at the edges: it anchors to the button and wraps when needed

## v1.1.17 — 2026-05-29 — Opus 4.8, Ultracode effort, and no lost models

In Claude Config: added the Opus 4.8 model and the Ultracode effort level.

- [FEATURE] The **Opus 4.8** model is now selectable in Claude Config, and effort now includes the new **Ultracode** level
- [FIX] If `settings.json` has a model or effort not yet in CLACOROO's list (e.g. a future version), it's now shown as selected instead of silently falling back to an older value — no more risk of overwriting your chosen model
- [FIX] Fixed the "A JavaScript error occurred in the main process" crash (`Object has been destroyed`) that could appear when reopening CLACOROO while another copy was already running: the existing window is now safely brought to the front (or recreated)

## v1.1.16 — 2026-05-29 — Readable toasts + marketplace invalid-path error

- [FIX] Long messages (e.g. CLI errors with absolute paths) now wrap inside the toast box instead of overflowing off the right edge; errors stay visible longer so you have time to read them
- [IMPROVEMENT] When a marketplace update fails because the saved path points to a different user (typical after copying the `.claude` folder from another computer or a system reset), CLACOROO shows a clear notice with the exact command to fix it and a button to copy it

## v1.1.15 — 2026-05-29 — Fix crash "JavaScript error in the main process"

- [FIX] Fixed the crash with the "A JavaScript error occurred in the main process" dialog (`write EIO` error) that could appear when returning to the app after closing the terminal it was launched from: benign stdout/stderr write errors are now ignored without bringing the app down

## v1.1.14 — 2026-05-28 — Interactive onboarding tour

- [IMPROVEMENT] The welcome tour now highlights the real UI elements one at a time (sidebar, dashboard, plugins, MCP, hooks, terminal, language) instead of a static text dialog, with the CLACOROO mascot guiding you
- [IMPROVEMENT] Tour content updated to all current features; still replayable from Settings and the command palette

## v1.1.13 — 2026-05-28 — DevTools disabled in builds + fix launch without Claude Code

- [SECURITY] Developer tools (DevTools) are now disabled in distributed builds: they can no longer be opened via shortcut or menu
- [FIX] Fixed an error at launch on systems where Claude Code is not yet installed: reading MCP servers no longer throws

## v1.1.12 — 2026-05-28 — Fix quota threshold notifications not shown when app is focused

- [FIX] Claude quota threshold notifications did not appear when the CLACOROO window was in the foreground: now they're always shown, even with the app open (the typical case where you're working and about to run out of quota)
- [FEATURE] New "Test notification" button in Settings → Notifications to quickly verify that system notifications work (useful to check the macOS permission)

## v1.1.11 — 2026-05-27 — CHANGELOG cleanup + "concise entries" rule

- [DOCS] Rewrote entries from v1.1.0 to v1.1.10 in concise form (max 3-6 badged bullets). Removed internal implementation details, file paths, function names, future roadmap and strategic status from entries — only user-visible changes remain
- [DOCS] Formalized the CHANGELOG style rule: entries are user-facing (in-app Changelog modal), so they must stay concise. Technical details live in commit messages

## v1.1.10 — 2026-05-27 — Cross-platform smoke test guide

- [DOCS] New `SMOKE_TEST.md` file with Linux/Windows VM setup via UTM, app verification checklist, platform-specific notes

## v1.1.9 — 2026-05-27 — Claude quota threshold system notifications

- [FEATURE] System notifications when a Claude quota (Session 5h, Weekly 7d, Weekly Sonnet) exceeds 80%, 95% or 100%
- [FEATURE] On/off toggle in Settings → Notifications, with 12h cooldown to avoid spam

## v1.1.8 — 2026-05-27 — Empty states with CLACOROO mascot

- [FEATURE] Completely empty sections (Plugin, Skill, Agent, MCP, Hooks, Marketplace) now show the CLACOROO mascot with description and a button to reach the solution, instead of a minimal "No X" text

## v1.1.7 — 2026-05-27 — Inline CLAUDE.md editor

- [FEATURE] Inline editor to modify the global CLAUDE.md file (`~/.claude/CLAUDE.md`) directly from Settings
- [FEATURE] Inline editor for the CLAUDE.md of every tracked project, reachable from the project row
- [SECURITY] The backend only accepts paths to CLAUDE.md files that are actually whitelisted (global or tracked projects)

## v1.1.6 — 2026-05-27 — Immediate system-language switch + English fallback

- [FIX] The "Use system language" button now applies the system language instantly, no app restart required
- [FEATURE] Explanatory toast if the operating system is on a not-yet-supported language (automatic fallback to English)

## v1.1.5 — 2026-05-27 — Anti-spam "config changed" toast + MCP card layout

- [FIX] Fixed the spam of "Configuration changed" toasts that appeared periodically: the notification now shows only if the configuration file content actually changes
- [IMPROVEMENT] MCP cards now always have the footer (Tools/Disable/Remove actions) aligned at the bottom even when the card content is minimal

## v1.1.4 — 2026-05-27 — Residual translations + Changelog in the active language

- [REFACTOR] The Changelog modal now displays release notes in the active app language (was always Italian)
- [REFACTOR] Translated the MCP card labels (Transport/URL/Command), the plugin tooltips (Open in Finder/in VS Code), the long warning tooltip on agents/skills, and the Hooks page filters

## v1.1.3 — 2026-05-27 — Translations Dashboard + Marketplace + Sidebar + API key + MCP

- [REFACTOR] Translated the Dashboard "Plugins by weight" subtitles, the Marketplace card counters and the "See all" chips
- [REFACTOR] Translated the sidebar "Support" label, the API key panel buttons (Test connection / Save / Reconfigure / Replace / Remove) and the MCP card reconnect texts

## v1.1.2 — 2026-05-27 — Scalable i18n architecture + bilingual Changelog

- [FEATURE] New `npm run audit:locales` script to automatically verify that all languages have the same keys and the same placeholders
- [DOCS] Step-by-step guide to add a new language to the app (in `src/renderer/locales/README.md`)
- [FEATURE] CHANGELOG now also published in English (`CHANGELOG.en.md`), kept aligned with every release

## v1.1.1 — 2026-05-27 — Extended translations across main pages

- [REFACTOR] Translated many Italian texts still hardcoded across Dashboard, Marketplace, Plugin, Skill/Agent, MCP, Hooks, Stats, Claude Config and Settings pages
- [REFACTOR] Relative time format ("18h ago", "1d ago") now follows the active app language

## v1.1.0 — 2026-05-26 — 🎉 Bilingual release: CLACOROO is now multilingual

- [FEATURE] The entire interface is now available in Italian and English
- [FEATURE] The language is auto-detected from the operating system on first launch (English fallback for not-yet-supported languages)
- [FEATURE] Instant manual language switch from the new "Appearance" group in Settings

## v1.0.120 — 2026-05-26 — Pack N (Phase 3g): onboarding tour and remaining strings translated

- [FEATURE] Welcome tour, update banner, command palette and token budget modal now follow the interface language (IT/EN)
- [IMPROVEMENT] Translation coverage extended to nearly every user-visible string in the app

## v1.0.119 — 2026-05-26 — Pack N (Phase 3f): Account and API key panels translated

- [FEATURE] The Claude Account and Claude API key panels in Settings now follow the interface language (IT/EN)

## v1.0.118 — 2026-05-26 — Pack N (Phase 3e): plugins, marketplaces and hooks translated

- [FEATURE] Filters, plugin card buttons, system notifications and status tooltips now follow the interface language (IT/EN)

## v1.0.117 — 2026-05-26 — Pack N (Phase 3d): Stats page translated

- [FEATURE] Tabs, period filters, KPIs and the context breakdown in the Stats page now follow the interface language (IT/EN)

## v1.0.116 — 2026-05-26 — Pack N (Phase 3c): Settings translated

- [FEATURE] The main Settings groups (Paths, Editor, Terminal, Tracked projects, Updates, Plugin development) now follow the interface language (IT/EN)

## v1.0.115 — 2026-05-26 — Pack N (Phase 3b): modals and confirmation dialogs translated

- [FEATURE] The Add Marketplace and Add MCP modals, plus every confirmation dialog in the app, now follow the interface language (IT/EN)

## v1.0.114 — 2026-05-26 — Pack N (Phase 3a): empty states and notifications translated

- [FEATURE] Empty-state messages and the most common toast notifications now follow the interface language (IT/EN)

## v1.0.113 — 2026-05-26 — Pack N (Phase 2 batch 2): MCP badges and filters translated

- [FEATURE] Status/scope badges, MCP filters, sorting and the view switcher now follow the interface language (IT/EN)

## v1.0.112 — 2026-05-26 — Pack N (Phase 2 batch 1): Dashboard translated

- [FEATURE] Section titles, KPIs and summaries on the Dashboard now follow the interface language (IT/EN)

## v1.0.111 — 2026-05-26 — Internal i18n infrastructure cleanup

- [REFACTOR] Simplified the internal handling of the active language, no user-visible change
- [IMPROVEMENT] Small startup time optimization

## v1.0.110 — 2026-05-26 — Pack N (Phase 1): first multi-language infrastructure

- [FEATURE] Introduced the app's translation infrastructure (Italian/English), with automatic detection of the system language on first launch
- [FEATURE] New language switcher in Settings, with an option to revert to the system language
- [FEATURE] Sidebar, top bar and main section titles are now translated; other areas will follow in upcoming versions

## v1.0.109 — 2026-05-26 — Opus/Sonnet comparison and quick plugin disable

- [FEATURE] The "Plugins by weight" panel can now compare estimated token consumption between the Opus and Sonnet models
- [FEATURE] New "Disable" button directly on the plugin row in the token budget, without needing to go to the Plugins section
- [DOCS] Added a public roadmap for future ideas not yet planned

## v1.0.108 — 2026-05-26 — Dashboard: section icons and a more readable token budget

- [IMPROVEMENT] Uniform spacing between Dashboard sections, with an icon next to every section title
- [IMPROVEMENT] The "Plugins by weight" panel now shows a compact version in the Dashboard and a full table in the Stats page

## v1.0.107 — 2026-05-26 — New "Plugins by weight" section in the Dashboard

- [FEATURE] New Dashboard section showing plugins sorted by context token consumption, with the 10 heaviest highlighted
- [FEATURE] Modal with a full table of every active plugin and its token weight

## v1.0.106 — 2026-05-26 — Clarity: sidebar "Config" entry renamed

- [IMPROVEMENT] The "Config" menu entry was renamed to "Claude Config" to clearly distinguish it from the app's own Settings

## v1.0.105 — 2026-05-26 — Dashboard: new Plugin/Skill/Agent/Hooks summary sections

- [FEATURE] Added Plugin, Skill, Agent and Hooks summary sections to the Dashboard (alongside the existing Marketplace and MCP), each with a visible-item cap and a "See all" link

## v1.0.104 — 2026-05-26 — MCP: disable/enable a single server

- [FEATURE] Manually added MCP servers can now be disabled and re-enabled individually, without touching the whole plugin
- [FEATURE] The disabled server's configuration stays saved and is restored when re-enabled

## v1.0.103 — 2026-05-26 — MCP: list the tools exposed by a server

- [FEATURE] New "Tools" button on connected MCP cards: shows the list of tools exposed by the server, with name, description and parameters
- [IMPROVEMENT] If the server doesn't support this feature yet, the app shows a clear message instead of a generic error

## v1.0.102 — 2026-05-26 — Fixed button icons and internal cleanup

- [FIX] Fixed a bug where some cards and buttons still showed the old icons instead of the new ones
- [REFACTOR] Consolidated several internal helpers to reduce duplication, no behavior change for the user

## v1.0.101 — 2026-05-26 — Hooks: explanatory tooltip on events

- [FEATURE] Event badges in the Hooks section now show a tooltip explaining when the event fires and how plugins typically use it

## v1.0.100 — 2026-05-26 — Three UX fixes: activity log, toasts and the "modified" badge

- [FIX] The recent-activity log now also includes the most recent actions (file edits, MCP add/remove) that weren't being recorded before
- [FIX] Toasts generated inside a modal are no longer hidden behind the overlay
- [FEATURE] Locally modified skill/agent cards now show a "Modified" badge with a timestamp

## v1.0.99 — 2026-05-26 — Inline editor for skill and agent .md files

- [FEATURE] The skill/agent preview modal now has an "Edit" button that opens a text editor to fix the `.md` file directly from CLACOROO
- [FEATURE] Clear warning that changes are local and will be overwritten on the next plugin update
- [FEATURE] Confirmation prompt when closing the editor with unsaved changes

## v1.0.98 — 2026-05-26 — Clearer tooltip on Skill/Agent health badges

- [IMPROVEMENT] The tooltip on skill/agent warning/error badges now better explains what they mean, that they aren't a problem with the user's install, and how to fix them

## v1.0.97 — 2026-05-26 — Compact view extended to Marketplace, Plugins, MCP, Hooks

- [FEATURE] Every main section now offers both a card view and a compact row view, switchable instantly from the top bar
- [FIX] Fixed a visual overlap issue between status badges on Skill/Agent cards

## v1.0.96 — 2026-05-26 — Card/compact view for Skills and Agents

- [FEATURE] Skills and Agents now also have a card view (alongside the existing compact one), selectable with a new switcher in the section bar

## v1.0.95 — 2026-05-26 — MCP: more readable cards + consistent icons

- [FIX] MCP cards with very long commands no longer distort the grid height: the text is now truncated with a "Show all" button
- [REFACTOR] Replaced emoji icons with a consistent icon set on buttons and badges across the app (partial work, continues in later versions)

## v1.0.94 — 2026-05-26 — Plugin filter in Hooks + full MCP management

- [FEATURE] New "Plugin" filter in the Hooks section, visible when hooks from multiple plugins are installed
- [FEATURE] Ability to add and remove MCP servers directly from CLACOROO, with a new guided modal for adding one

## v1.0.93 — 2026-05-26 — Hooks: automatic detection after installing a dependency

- [IMPROVEMENT] After starting the install of a missing tool from the integrated terminal, CLACOROO automatically detects when it's ready and refreshes the card, no need to manually press "Refresh"

## v1.0.92 — 2026-05-26 — Fixed "Install" button for missing dependencies

- [FIX] Fixed a bug where the "Open terminal" button in the install confirmation dialog didn't respond to clicks

## v1.0.91 — 2026-05-26 — Hooks: quick-install button for missing dependencies

- [FEATURE] When a hook card flags a missing CLI tool, a new button opens the integrated terminal with the official install command already filled in, without running it automatically
- [FEATURE] For tools that require a graphical installer, an alternative button opens the official documentation page

## v1.0.90 — 2026-05-26 — Hooks: dependency detection always up to date

- [FIX] Detection of CLI tools required by hooks now correctly refreshes after installs or uninstalls performed while the app is open, no restart required

## v1.0.89 — 2026-05-26 — Hooks: more reliable dependency detection

- [FIX] Fixed detection of CLI tools installed via installers that only modify the user's shell profile: they're now correctly found even when not present in the app's base PATH

## v1.0.88 — 2026-05-26 — Hooks: fixed false positives in dependency detection

- [FIX] Fixed a bug where missing-dependency detection flagged shell keywords and command arguments as "tools to install", producing meaningless warnings

## v1.0.87 — 2026-05-26 — Hooks: badge for missing CLI dependencies

- [FEATURE] Hook cards now flag when a CLI tool required by the command (e.g. Bun, Deno, Python) isn't installed, with a warning badge and install instructions
- [FEATURE] New Dashboard KPI for hooks with missing dependencies, shown only when present

## v1.0.86 — 2026-05-26 — MCP: guided reconnection to the official Claude Code menu

- [FIX] The reconnect button for OAuth MCP servers now opens the official Claude Code `/mcp` menu directly in the integrated terminal, instead of leaving an empty session with no guidance
- [IMPROVEMENT] Reconnect button labels and descriptions updated to reflect the new behavior

## v1.0.85 — 2026-05-26 — MCP: assisted reconnection for disconnected servers

- [FEATURE] Cards for disconnected MCP servers now show the action best suited to the server type (re-authorize on claude.ai, open the terminal, or clear the local cache), with a fallback action always available
- [SECURITY] CLACOROO never reads or modifies the authentication credentials held by Claude Code: it only acts on a non-sensitive local cache

## v1.0.84 — 2026-05-25 — Refreshed sidebar icons

- [IMPROVEMENT] All sidebar icons replaced with a more consistent, recognizable set (especially MCP and Hooks, flagged as unclear by users)
- [FIX] README logo now readable on GitHub's dark theme too

## v1.0.83 — 2026-05-25 — New Hooks section

- [FEATURE] New "Hooks" menu entry: a dedicated browser that collects every hook from every installed plugin, with search, event/scope filters, sorting and a detail modal with config copy
- [FEATURE] New "Hooks" KPI in the Dashboard, clickable to jump to the section

## v1.0.82 — 2026-05-25 — Sorting available in every section

- [FEATURE] Added a sort menu (already present in Marketplace) to Plugins, Skills, Agents and MCP too, with the preference remembered per section

## v1.0.81 — 2026-05-25 — Copy skill/agent content from the modal

- [REFACTOR] Removed the small copy button on every skill/agent card (it only copied the name, of little use) and replaced it with a single button in the modal header that copies the entire content of the open document

## v1.0.80 — 2026-05-25 — App icon: transparent corners

- [FIX] Fixed the app icon's corners, which showed up white instead of transparent in the Dock, the installer and Finder previews

## v1.0.79 — 2026-05-25 — macOS: install without "app is damaged" warnings

- [FIX] Fixed the "CLACOROO is damaged and can't be opened" message that appeared when downloading the app from the public release: now only the normal Gatekeeper "Open downloaded app?" prompt appears

## v1.0.78 — 2026-05-25 — Skill/Agent: copy command only

- [REFACTOR] Removed the direct terminal-launch button for skills/agents (of little use for globally scoped items): the copy-command button remains, to paste into an already-open Claude session in the right project

## v1.0.77 — 2026-05-25 — Skill/Agent: new launcher with copy and guided start

- [FEATURE] Every skill/agent card now has two buttons: copy the command to the clipboard, or open the integrated terminal with Claude Code started and the command already typed (never sent automatically)

## v1.0.76 — 2026-05-25 — Active support/donation channels

- [FEATURE] New "Support CLACOROO" row in the sidebar with quick access to GitHub Sponsors, Buy Me a Coffee and PayPal
- [DOCS] READMEs updated with badges and a dedicated section on supporting the project

## v1.0.75 — 2026-05-25 — Skill/Agent: quick terminal launch + shell choice

- [FIX] The version number shown in the app now always comes from a single source, removing possible mismatches
- [FEATURE] New "Run in terminal" button on every Skill and Agent card
- [FEATURE] New "Default shell" selector in Settings, with automatic detection of the shells available on the system

## v1.0.74 — 2026-05-25 — Anthropic-independence disclaimer

- [DOCS] Added a disclaimer, both in the READMEs and at the bottom of the app's Settings, clarifying that CLACOROO is an independent project not affiliated with Anthropic
- [REFACTOR] Simplified the brand name across the documentation and the app's credits

## v1.0.73 — 2026-05-25 — README and About panel polished

- [DOCS] Italian and English READMEs fully rewritten, with every app feature organized by area
- [FIX] Fixed the project name's acronym in the documentation
- [IMPROVEMENT] Simplified the app's About panel

## v1.0.72 — 2026-05-25 — DMG installer redesigned with CLACOROO identity

- [FEATURE] New macOS install window with dedicated artwork, the CLACOROO mascot and a pixel-art style logo
- [FIX] Fixed a known issue in some build tools that prevented the DMG's custom background from displaying correctly on recent macOS versions

## v1.0.71 — 2026-05-23 — API key panel button cleanup

- [REFACTOR] Removed a duplicate button in the account panel and reorganized the API key form buttons onto a single row

## v1.0.70 — 2026-05-23 — Claude API key: integrated, encrypted management

- [FEATURE] New "Claude API key" panel in Settings to enter, test, save and remove the API key without manually editing config files
- [SECURITY] The key is stored encrypted using the operating system's native credential manager (Keychain on macOS, equivalents on Linux/Windows) and is never shown in plain text in the UI
- [FEATURE] "Test connection" button to verify the key is valid before using it
- [FEATURE] Warning when the operating system doesn't support encrypted storage, with instructions on how to enable it

## v1.0.69 — 2026-05-23 — Account: disconnected state correctly detected

- [FIX] The Account panel now correctly shows "Disconnected" when the Claude session has expired, instead of incorrectly staying on "Connected"
- [FEATURE] New "Terminal login" button that appears when re-authentication is needed, with a warning also visible in the sidebar

## v1.0.68 — 2026-05-23 — More readable Changelog with category badges

- [IMPROVEMENT] The in-app Changelog viewer was redesigned: one row per entry, with colored badges per category (feature, fix, improvement, etc.) instead of long paragraphs

## v1.0.67 — 2026-05-22 — Integrated terminal

- [FEATURE] New integrated terminal in the app: a multi-tab popup panel, resizable, with a status indicator for each tab
- [FEATURE] Keyboard shortcuts to open/close the terminal and create new tabs
- [SECURITY] The integrated terminal always validates launch parameters (folder, size, shell) before opening a new session

## v1.0.66 — 2026-05-22 — Cleanup of leftover references to the old license

- [DOCS] Updated a few remaining references to the old MIT license in the internal documentation

## v1.0.65 — 2026-05-22 — License changed to AGPL-3.0-or-later

- [REFACTOR] The project moves from the MIT license to AGPL-3.0-or-later to protect the code from closed commercial forks
- [DOCS] Added a new "License" entry in the app's About panel, linking to the official text

## v1.0.64 — 2026-05-22 — Fixed stuck "update available" indicator

- [FIX] The footer no longer failed to show the "up to date" state right after installing an update: the check now refreshes correctly
- [DOCS] Added a note on the Gatekeeper workaround needed until the app is signed and notarized

## v1.0.63 — 2026-05-22 — End-to-end test of the update system

- [CHORE] Full verification of the update detection and install flow, from download through installation

## v1.0.62 — 2026-05-22 — Sidebar footer: version and update status

- [FEATURE] The sidebar footer now shows the app's current version and a colored indicator flagging whether an update is available
- [FEATURE] "UPDATE" button to open the download page directly when a new version is out

## v1.0.61 — 2026-05-22 — Flicker between modals eliminated for good

- [FIX] Fixed the last remaining cases of visual flicker when switching from one modal to another

## v1.0.60 — 2026-05-22 — No more flicker between consecutive modals

- [FIX] Fixed the visible flicker when opening a modal on top of one already open

## v1.0.59 — 2026-05-22 — External editor: Windows and Linux support

- [FIX] The external editor integration now also works correctly on Windows and Linux, not just macOS
- [IMPROVEMENT] More specific per-platform error messages when the editor isn't found

## v1.0.58 — 2026-05-22 — External editor: added Antigravity

- [FEATURE] Added the ability to open files with the Antigravity editor (Google), alongside the existing options

## v1.0.57 — 2026-05-22 — Configurable external editor

- [FEATURE] New Settings option to choose the default external editor (VS Code, Cursor, or the system default), instead of a single fixed choice

## v1.0.56 — 2026-05-22 — Plugin modal: hook details and open-source action

- [FEATURE] The "Plugin content" modal now also shows the list of hooks with their count
- [FEATURE] Buttons to open the plugin in Finder or in the editor directly from the modal
- [IMPROVEMENT] Clicking a skill/agent in the modal now opens its preview right away, one step fewer

## v1.0.55 — 2026-05-22 — Marketplace sorting

- [FEATURE] New sort menu for the Marketplace section (default, recently added/updated or least recent), with the preference remembered

## v1.0.54 — 2026-05-22 — Marketplace card: clearer count

- [FIX] Fixed the installed/available plugin count on the marketplace card, which was ambiguous in some cases

## v1.0.53 — 2026-05-22 — Marketplace card: installed vs available

- [FEATURE] The marketplace card now clearly distinguishes installed plugins from those available but not yet installed
- [IMPROVEMENT] Sorting and tooltips updated to reflect this distinction

## v1.0.52 — 2026-05-22 — Plugin install from the marketplace

- [FEATURE] The "Marketplace plugins" modal now shows every available plugin, with an "Install" button and a token-cost preview before confirming
- [FEATURE] Desktop notification and automatic refresh after installation

## v1.0.51 — 2026-05-22 — Add Marketplace from the panel

- [FEATURE] New "+ Marketplace" button in the Marketplace section's top bar, with a guided modal to add a new one

## v1.0.50 — 2026-05-22 — Plugin count badge polish

- [IMPROVEMENT] Improved the readability of the plugin-count badge on Marketplace cards

## v1.0.49 — 2026-05-22 — Sidebar: Marketplace before Plugins

- [IMPROVEMENT] Reordered the menu entries to reflect the logical hierarchy (Marketplaces contain Plugins, which in turn contain Skills/Agents/MCP)

## v1.0.48 — 2026-05-22 — Marketplace card: clickable plugin count

- [IMPROVEMENT] Removed an unpolished graphical strip from Marketplace cards
- [FEATURE] The plugin count on the card is now clickable to open the list directly

## v1.0.47 — 2026-05-22 — Plugin and marketplace card polish

- [IMPROVEMENT] More consistent button layout on plugin cards regardless of description length
- [IMPROVEMENT] Instant tooltips on icon buttons, without the browser's native tooltip delay

## v1.0.46 — 2026-05-22 — "Plugin content" modal

- [FEATURE] New button on plugin cards that opens a modal summarizing the content (skills, agents, MCP, hooks and token estimate)
- [FEATURE] Clicking a skill/agent in the modal jumps straight to the relevant section with the filter applied

## v1.0.45 — 2026-05-22 — Per-project stats: design and filter

- [IMPROVEMENT] New, more readable design for per-project statistics
- [FEATURE] Projects with no recorded activity are now filtered out automatically

## v1.0.44 — 2026-05-22 — Fixed histogram tooltip position

- [FIX] The daily-tokens histogram tooltip in Stats no longer overflows the window edges

## v1.0.43 — 2026-05-22 — Explanatory note on per-model percentages

- [DOCS] Added a note clarifying the meaning of the per-model usage percentages in Stats

## v1.0.42 — 2026-05-22 — Fixed per-model token percentages

- [FIX] Fixed a calculation error that showed clearly wrong per-model usage percentages (e.g. over 24000%)

## v1.0.41 — 2026-05-22 — No more flicker on the Config page

- [IMPROVEMENT] Changes in Claude Config now apply instantly, without reloading the whole page

## v1.0.40 — 2026-05-22 — Settings cleanup and Voice toggle fix

- [FIX] Fixed a bug where the Voice toggle wasn't correctly saved to the Claude Code configuration
- [FIX] Fixed the response-language options, which Claude Code was no longer recognizing correctly
- [FEATURE] Added the missing theme variants to the Claude Code theme selector
- [IMPROVEMENT] Settings' About section condensed into a single row

## v1.0.39 — 2026-05-22 — Session/week quotas on Windows and Linux too

- [FEATURE] Session/week usage quotas are now readable on Windows and Linux too, not just macOS

## v1.0.38 — 2026-05-22 — Dashboard reorganized + Config as its own section

- [IMPROVEMENT] Dashboard reorganized to put the most frequently changing information at the top
- [FEATURE] The Config section becomes its own sidebar entry with a dedicated keyboard shortcut

## v1.0.37 — 2026-05-22 — Fixed wrong quota percentages

- [FIX] Fixed a bug that showed quota usage percentages 100 times larger than reality (e.g. 1400% instead of 14%)

## v1.0.36 — 2026-05-22 — Critical fixes to reading Claude quotas

- [FIX] Fixed an error that prevented correctly reading the Claude account's usage quotas
- [FEATURE] Automatic session renewal when close to expiring
- [SECURITY] Renewal happens only in memory: CLACOROO never modifies the credentials saved by Claude Code

## v1.0.35 — 2026-05-22 — Session and week quotas visible in the app

- [FEATURE] New usage bars (5h session, week, Sonnet week) visible both in the Account panel and in a new Dashboard "Claude Quotas" section
- [FEATURE] Bar color changes based on the usage threshold reached
- [FEATURE] Direct link to usage management on claude.ai

## v1.0.34 — 2026-05-22 — Logout: more polished tooltip

- [IMPROVEMENT] Replaced a fixed warning box with a more elegant tooltip on the Logout button

## v1.0.33 — 2026-05-22 — Clearer warning about global logout

- [FEATURE] Prominent warning explaining that logout disconnects the account everywhere (CLACOROO, CLI, IDE), not just in the app
- [IMPROVEMENT] Confirmation dialog rewritten with more detail

## v1.0.32 — 2026-05-22 — Effort level: slider selector

- [FEATURE] Claude Code's "Effort" level is now set with a 5-level slider instead of a dropdown menu
- [FIX] Fixed a broken link to the billing settings

## v1.0.31 — 2026-05-22 — Guide to using an API key

- [FEATURE] New in-app guide for those who want to use Claude Code with a pay-per-use API key instead of a subscription
- [SECURITY] The guide only shows how to set the key manually: CLACOROO neither saves nor reads it in this mode

## v1.0.30 — 2026-05-22 — Configurable effort level

- [FEATURE] New "Effort level" selector on the Config page to change Claude Code's behavior

## v1.0.29 — 2026-05-22 — Quick account access in the sidebar

- [FEATURE] New always-visible sidebar box with the plan and email of the linked account
- [FEATURE] Quick-access buttons to claude.ai and the API console

## v1.0.28 — 2026-05-22 — New KPI: estimated dollar value

- [FEATURE] New KPI estimating how much recorded usage would cost in dollars if paid per-use, useful for gauging the subscription plan's savings

## v1.0.27 — 2026-05-21 — Claude Account panel

- [FEATURE] New Settings panel with the plan, email, organization and authentication method of the linked account
- [FEATURE] Buttons to refresh the status and to log out, with explicit confirmation

## v1.0.26 — 2026-05-21 — KPI cards: new glow style

- [IMPROVEMENT] KPI cards now have a soft glow instead of a colored line, more consistent with the app's style

## v1.0.25 — 2026-05-21 — More compact KPI cards

- [IMPROVEMENT] Reduced the padding and size of KPI cards for a denser, more readable Dashboard

## v1.0.24 — 2026-05-21 — MCP servers section in the Dashboard

- [FEATURE] New Dashboard section with the configured MCP servers, shown as clickable tiles with a status indicator

## v1.0.23 — 2026-05-21 — Context estimate now includes MCP servers

- [FEATURE] The "Context estimate" bar now also includes the estimated weight of connected MCP servers, updated live

## v1.0.22 — 2026-05-21 — MCP section polish

- [FEATURE] Quick-copy button on every MCP card
- [FEATURE] HTTP/SSE server URLs are clickable and open in the browser (handy for completing authentication)

## v1.0.21 — 2026-05-21 — New MCP servers section

- [FEATURE] New "MCP" section in the sidebar listing configured servers and their connection status
- [FEATURE] Filters by status and server type, button to refresh status live
- [FEATURE] New "Connected MCP" KPI in the Dashboard

## v1.0.20 — 2026-05-21 — Context estimate: smoother animation

- [FIX] The "Context estimate" bar no longer momentarily disappears when enabling or disabling a plugin

## v1.0.19 — 2026-05-21 — Context estimate on the Plugins page too

- [FEATURE] The "Context estimate" bar is now also visible at the top of the Plugins page, updating live with every action

## v1.0.18 — 2026-05-21 — "Claude Code usage" KPI in the Dashboard

- [FEATURE] New Dashboard KPIs for sessions, messages, tokens, active days and favorite model
- [FEATURE] "Context estimate" bar added to the Dashboard as well

## v1.0.17 — 2026-05-21 — More readable "Favorite model" KPI

- [IMPROVEMENT] The favorite model's name now appears in full instead of abbreviated

## v1.0.16 — 2026-05-21 — Fixed session count

- [FIX] The "Sessions" KPI now correctly counts real sessions, which was previously undercounted

## v1.0.15 — 2026-05-21 — Statistics aligned with Claude Code

- [FIX] Fixed the total-token calculation, which was coming out much higher than reality
- [FEATURE] New "Most active day" KPI, and period filters now apply to every KPI, not just the heatmap

## v1.0.14 — 2026-05-21 — Revamped heatmap + new KPIs

- [FEATURE] Activity heatmap redesigned in Claude Desktop style, with the whole year visible
- [FEATURE] New summary KPIs above the heatmap
- [FIX] Fixed the context estimate for skills/agents, which was coming out too high

## v1.0.13 — 2026-05-21 — Activity heatmap + context estimate

- [FEATURE] New GitHub-style activity heatmap
- [FEATURE] New "Context estimate" section showing the estimated composition of the loaded context
- [FIX] Fixed a bug where some Claude Config toggles would reset themselves after a second

## v1.0.12 — 2026-05-21 — New Stats section

- [FEATURE] New "Stats" section with an overview, per-model statistics, per-project statistics and visual configuration
- [IMPROVEMENT] Caching for instant tab switching

## v1.0.11 — 2026-05-21 — Tracked projects: local/global scope

- [FEATURE] CLACOROO can now also show plugins/skills/agents configured at the single-project level, not just global ones
- [FEATURE] New "Tracked projects" management in Settings, with a badge distinguishing global and local items

## v1.0.10 — 2026-05-21 — Command palette, Changelog viewer, sidebar Recent

- [FEATURE] New global command palette to quickly search and open any item
- [FEATURE] Integrated Changelog viewer in Settings
- [FEATURE] Sidebar enriched with a "Recent" section to quickly return to the latest actions

## v1.0.09 — 2026-05-21 — Automatic update check

- [FEATURE] Automatic check for new versions on launch and periodically, with a banner and a direct download link
- [FEATURE] Ability to postpone or skip a specific version

## v1.0.08 — 2026-05-21 — Mascot redesigned

- [IMPROVEMENT] New design for the CLACOROO mascot, more expressive and defined
- [IMPROVEMENT] Polished the app's About panel

## v1.0.07 — 2026-05-21 — Security and native desktop integration

- [SECURITY] Strengthened the app window's security configuration and blocked opening popups or navigating to external sites
- [FEATURE] Native macOS application menu and keyboard shortcuts for the main sections
- [FEATURE] System notifications for plugin actions when the app isn't in the foreground

## v1.0.06 — 2026-05-21 — New typography

- [FEATURE] New fonts (Inter and Source Serif) bundled with the app for a look consistent with the Claude ecosystem
- [FIX] Fixed the app icon in development mode too

## v1.0.05 — 2026-05-20 — First wave of local features

- [FEATURE] Quick buttons to open a plugin in Finder or in the editor
- [FEATURE] Recent-activity log, visible in the Dashboard
- [FEATURE] Plugin validator, welcome tour on first launch, and export/import of a configuration snapshot
- [FEATURE] Health check on skills/agents with a warning badge for malformed files
- [FIX] Fixed the source of truth for a plugin's enabled/disabled state

## v1.0.04 — 2026-05-20 — Cross-platform distribution

- [FEATURE] Installable packages for macOS, Windows and Linux, with a dedicated app icon
- [FEATURE] Native dark mode support on macOS

## v1.0.02 — 2026-05-19 — CLACOROO rebrand

- [FEATURE] Full app rebrand with a visual identity inspired by Claude
- [FEATURE] Pixel-art mascot and animated logo on the loading screen
- [DOCS] README rewritten in Italian

## v1.0.01 — 2026-05-19 — First release

- [FEATURE] Visual management of Claude Code plugins, marketplaces, skills and agents
- [FEATURE] Dashboard with summary KPIs, plugin enable/disable toggle, update and uninstall
- [FEATURE] Marketplace, Skill and Agent sections with search, plus automatic refresh on external configuration changes
- [SECURITY] Secure architecture based on an isolated process and input validation before every executed command
