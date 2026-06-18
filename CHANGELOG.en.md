# Changelog

> English translation of [CHANGELOG.md](./CHANGELOG.md) (Italian, canonical). Updated in sync with each release.

## v1.1.34 — 2026-06-18 — Claude Config: permissions editor

- [FEATURE] New **Permissions** row in Claude Config: manage the rules that decide what Claude Code can do without asking (allow), what it always asks for (ask), and what is forbidden (deny), plus the default mode. Add and remove rules with format validation and a warning when a rule grants overly broad access. The allow/deny/ask lists apply immediately to already-open Claude Code sessions; the default mode applies to new sessions

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
- [STYLE] MCP cards now always have the footer (Tools/Disable/Remove actions) aligned at the bottom even when the card content is minimal

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

## v1.0.120 — 2026-05-26 — Pack N (Phase 3g final batch): onboarding tour + update banner + command palette + token modal + setStatus

Last incremental batch of Pack N before Phase 4 closure. Migrated complete onboarding tour (5 steps + buttons), update notification banner, command palette labels, token budget modal headers + intro + disable button, Plugin search placeholder, modal close aria-label and Copy tooltip.

### Locales — 5 new namespaces

- **`tour.*` (12)**: skip/back/next/start buttons + 5 steps (title + body)
- **`updateBanner.*` (5)**: msgPre, msgTail, openDownload, later, skipVersion
- **`palette.*` (14)**: placeholder, ariaLabel, sectionAction/Section, 7 action labels (goTo/reload/export/import/changelog/restartTour/checkUpdates), pluginDisabledSuffix, pluginsCount{n}, toastSnapshot
- **`token.*` (10)**: modelLabel, disableBtn{tok}, introTopN{model}, 6 table column headers
- **`status.*` (1)**: loading
- **Extended `search.*`**: + plugins / skills / agents placeholders
- **Extended `button.*`**: + copyHookJson / copyDocument / copyToClipboard

### Migration

- [REFACTOR] **Onboarding tour**: module-level `TOUR_STEPS` array removed. Replaced by `getTourStep(idx)` runtime helper that looks up `t('tour.stepNTitle')` + `t('tour.stepNBody')` — follows active language
- [REFACTOR] **Tour buttons** (Skip/Back/Next/Start): all via `t('tour.*')`. Counter "N / 5" formatted dynamically
- [REFACTOR] **Update banner**: msg parts (pre/tail) + 3 action buttons (openDownload / later / skipVersion)
- [REFACTOR] **Command palette**: placeholder + aria-label + 7 action labels + 2 sub labels (action/section) with `{name}` interpolation for goTo
- [REFACTOR] **Token budget modal**: model dropdown label "Model:", disable button "Disable −X" with `{tok}` interpolation, full intro text with `{model}`, 6 column headers
- [REFACTOR] **`setStatus('loading', …)`**: string "Loading…" via `t('status.loading')`
- [REFACTOR] **Plugin search placeholder**: 'Search plugin…' via t()
- [REFACTOR] **4 modal close aria-labels** ("Close"): replace_all to `t('button.close')`
- [REFACTOR] **3 Copy tooltip variants**: copyHookJson, copyDocument, copyToClipboard

### Stats

- 463 total `t()` calls in app.js
- Final estimated coverage: ~97% of user-visible strings migrated

### Residuals (intentionally not migrated)

- **HOOK_EVENT_DOCS** (~30 technical long-form descriptions for developers): kept in IT, tooltips rarely seen. Optional migration post-v1.1.0
- **About dialog** (setupAboutPanel in src/lib/menu.js + main process): static Electron menu texts. Optional migration post-v1.1.0
- **~10 specific error toasts** (e.g., MCP auth cache cleared, snapshot import errors): rarely triggered cases, remain in IT
- **Activity log entries** (kind/action label strings in lib/state.js): backend strings, optional migration

Next step: **v1.1.0 closure** — IT↔EN shape audit + smoke test + explicit bump to bilingual milestone.

## v1.0.119 — 2026-05-26 — Pack N (Phase 3f): Claude Account + Claude API key panels

Pack N i18n continues. Migrated the 2 Settings inner panels (Account + API key) that were hardcoded in Italian. They cover a large chunk of the remaining strings.

### Locales — 2 new namespaces

- **`account.*` (29 keys)**: loading, readError{msg}, unknownError, notAuthed, loginInstr, connected, disconnected, 6 row labels (Email/Org/OrgID/AuthMethod/rowAuthClaudeAi/ApiProvider), 6 button labels and tooltips (LoginTerminal/Refresh/ClaudeAi/Logout), 5 tooltip parts (title/body/3 items/footer), 2 toasts (logout success + error)
- **`apikey.*` (15 keys)**: loadingStatus, error{msg}, statusActive/Empty, storageWarn + tip, description{backend}, 3 row labels (Key/Storage/HelperScript), helperWarn, btnConsole + tip, formLabel, show

### Migration

- [REFACTOR] **`paintAccountPanel`**: all ~25 strings migrated including logout tooltip with 3 list items + footer
- [REFACTOR] **`loadAccountPanel`**: loading text + error msg
- [REFACTOR] **`paintApiKeyPanel` + `loadApiKeyPanel`**: status badge (Active / Not configured), storage warn, description with `{backend}` interpolation, 3 info rows, helper warn, console btn, form label, show toggle
- [REFACTOR] **`makeConsoleBtn`**: button label + tooltip

### Final Phase 3 coverage

- ✅ Almost all main panels migrated (Account + API key inner)
- ⏳ Onboarding tour (~30 strings) → v1.0.120
- ⏳ About dialog (`setupAboutPanel` in main.js + related strings) → v1.0.120
- ⏳ Footer update banner (`renderUpdateBanner`) → v1.0.120
- ⏳ ~15-20 minor scattered toasts/errors → v1.0.120

After v1.0.120 → Phase 4 closure (IT↔EN shape audit + smoke test + EN review) → **v1.1.0 full bilingual**.

## v1.0.118 — 2026-05-26 — Pack N (Phase 3e): plugin/marketplace/hook buttons + filter chips + notifications + tooltips

Pack N i18n continues. Migrated ~50 scattered strings: Plugin/Hook filter chips, plugin card buttons (Update/Remove/Details/Install), system notifications, plugin status tooltips and hook detail labels.

### Locales — new keys

- **`filter.*` (+5)**: active, disabled, allMarketplaces, globals, locals
- **`plugin.*` (16+2)**: activate, deactivate, notifActivated, notifDeactivated, notifInstalled, notifUpdated, disableTip{id,tok}, disableTipShort{id,tok}, seeAllTopN{n}, openFullSection{title}, modifiedLocal{when}, modifiedNote{id}, sectionSkills/Agents/Hook, pluginsInMkt, seePlugins, seeAndInstall, matcher, scope, source, toastEnabled{id}, toastDisabled{id}
- **`hookDep.*` (3)**: installBtn{dep}, docsBtn{dep}, docsTip{dep}
- **`uiErr.*` (2)**: dataLoad, cancelled

### Migration

- [REFACTOR] **Plugin filter chips**: status (All/Active/Disabled) + marketplace filter (All marketplaces) via t()
- [REFACTOR] **Hook filter chips**: scope filter (All/Globals/Locals) + event filter (All)
- [REFACTOR] **Plugin card buttons**: Update / Remove / Details / Install via button.* keys; reused buttons via replace_all
- [REFACTOR] **Plugin toggle tooltip**: 'Enable plugin' / 'Disable plugin' via t()
- [REFACTOR] **Plugin notifications**: 'Plugin enabled/disabled/installed/updated' + toast `✓ Enabled: {id}` / `✗ Disabled: {id}`
- [REFACTOR] **Plugin tooltip**: 'Disable X (recover Y always-on tok)' with full interpolation
- [REFACTOR] **Top-N "See all N plugins by weight"** + tooltip "Open the full section X"
- [REFACTOR] **Modal section heads**: 'Skills', 'Agents', 'Hook' (Plugin content modal) + 'Plugins in marketplace'
- [REFACTOR] **Hook detail labels**: 'Matcher', 'Scope', 'Source'
- [REFACTOR] **Hook dep buttons**: 'Install X' + 'Docs X' + docs tooltip
- [REFACTOR] **Marketplace tooltip**: 'See installed plugins' / 'See and install plugins'
- [REFACTOR] **Modified badge** title with `{when}` + `{id}` interpolation
- [REFACTOR] **Generic UI errors**: 'Data read error' + 'Cancelled' (status load + cancel check)
- [REFACTOR] **Copy / Open preview** + other button reuse from `button.*` namespace

### Stats

- 382 total `t()` calls in app.js (was 0 pre-Pack N)
- Estimated coverage: ~85-90% of user-visible strings migrated
- Residuals: loadAccountPanel / loadApiKeyPanel inner texts, onboarding tour, About dialog, remaining error toasts (~10-15 minor strings)

## v1.0.117 — 2026-05-26 — Pack N (Phase 3d): Stats KPI + range filters + tabs + context breakdown

Pack N i18n continues. Migrated the entire Stats page: tab bar, range filter chips, 10 KPI labels and the 6 context breakdown labels with interpolation.

### Locales — new namespace `stats.*` (23 keys)

- **Tabs (3)**: tabOverview / tabModels / tabProjects
- **Range filters (3)**: rangeAll / range30 / range7
- **KPI labels (10)**: kpiSessions / kpiMessages / kpiTokens / kpiApiValue / kpiActiveDays / kpiMostActive / kpiStreak / kpiLongestStreak / kpiPeakHour / kpiFavModel
- **Context breakdown (7)**: contextSkills{count} / contextSystemPrompt / contextAgents{count} / contextMemoryFiles{count} / contextMcpServers / contextMcpServersConn{count} / contextFreeSpace

### Migration

- [REFACTOR] **Stats tab bar** (3 tabs): hardcoded `tabLabels` map → `tabLabelKeys` with `t()` lookup at render. Variable shadow fix (`tabs.forEach(t => ...)` → `forEach(tab => ...)`)
- [REFACTOR] **`buildStatsKpiGrid`**: all 10 KPI labels via `t('stats.kpi*')`
- [REFACTOR] **Range filter chips** `[['all', 'All'], ['30', '30d'], ['7', '7d']]` → read via `t()` at render time
- [REFACTOR] **`contextCats()`** breakdown labels: 6 categories via `t()` with `{count}` interpolation for skills/agents/memoryFiles/mcpServersConn

### Coverage

- ✅ Entire Stats page (KPI + tabs + filters + heatmap titles + context breakdown)
- ✅ Stat dashboard summary chip Dashboard (already migrated in batch 1)
- ⏳ Stats per-model + per-project tabs (renderStatsModels + renderStatsProjects) — still to migrate in next batch
- ⏳ Account panel + API key panel inner texts → Phase 3e
- ⏳ Onboarding tour → Phase 3e

## v1.0.116 — 2026-05-26 — Pack N (Phase 3c): existing Settings labels (Paths/Editor/Terminal/Projects/Updates/Plugin development groups)

Pack N i18n continues. Migrated the 6 "core" Settings groups that were still hardcoded in Italian.

### Locales — new keys

- **`settings.*` (+30 keys)**: appearance, accountClaude, apiKeyClaude, paths, claudeFolder/Bin/BinFound/BinNotFound, configBinLabel/Desc, trackedProjects/Label/Desc, externalEditor, editorDefault/Desc + 4 editor options (vscode/cursor/antigravity/system), terminal, shellDefault/Desc, shellSystemDefault{shell}, pluginDev/Validator/ValidatorDesc/Validate/Browse/Valid/PathRequired, updates, checkUpdates, checkNow, autoCheck/Desc, lastCheck{when}, lastCheckNever, newVersionInfo{ver,when}
- **`settingsToast.*` (4)**: pathUpdated, editorSet{name}, shellSet{name}, shellDefaultName

### Migration

- [REFACTOR] **"Claude Account"** + **"Claude API key"** + **"Appearance"** groups: titles via `t()`
- [REFACTOR] **"Paths" group**: title + 2 row labels (Claude folder, claude binary) + 2 row descs + 2 status (Found/Not found) + Save button + toast "Path updated"
- [REFACTOR] **"Tracked projects" group**: title + label + desc + "Remove" button
- [REFACTOR] **"External editor" group**: title + label + desc + 4 option labels (Visual Studio Code / Cursor / Antigravity / System) + change toast
- [REFACTOR] **"Terminal" group**: title + label + desc + "System default (X)" with interpolation + change toast "Default shell: X — applies to new tabs"
- [REFACTOR] **"Plugin development" group**: title + Plugin Validator label + desc + Browse/Validate buttons + "Specify a path" + "✓ Valid manifest"
- [REFACTOR] **"Updates" group**: title + 2 row labels + 2 descs (with `{when}` / `{ver}` interpolation) + "Check now" button + "last check: never/timestamp" with locale-aware date formatting (it-IT vs en-US)

### Settings coverage

- ✅ All 6 core groups (Account/API key/Appearance/Paths/Projects/Editor/Terminal/Development/Updates)
- ⏳ Inner panels: `loadAccountPanel()` + `loadApiKeyPanel()` (separate panel renderers with 20+ strings each) → next Phase 3c batch
- ⏳ Onboarding tour, About dialog content, Footer updates banner

## v1.0.115 — 2026-05-26 — Pack N (Phase 3b): Add Marketplace + Add MCP modals + 10 confirm dialogs

Pack N i18n continues. Migrated the 2 main modals (Add Marketplace + Add MCP) with all labels/placeholders/hints/errors + all 10 native Electron confirm dialogs (title + message + detail + buttons).

### Locales — new namespaces

- **`modalMkt.*` (15 keys)**: Add Marketplace modal — title, badge, intro, sourceLabel, placeholder, formatsTitle, 3 accepted formats, submit, submitting, 3 validation errors, errUnknown
- **`modalMcp.*` (30+ keys)**: Add MCP modal — title, badge, intro, name/transport/url/command/args/env/headers (label + hint + placeholder), 3 transport options (label + desc), 2 url placeholder variants (http vs sse), 4 validation errors, toastAdded{name}
- **`confirm.*` (10 dialogs × ~4 fields)**: disablePlugin / removePlugin / installPlugin / removeMarketplace / installTool / disableMcp / removeMcp / logoutAccount / removeApiKey / applySnapshot. All with interpolation `{id}`, `{name}`, `{fullId}`, `{recovery}`, `{tool}`, `{cmd}`, `{mktCount}`, `{plgCount}`, `{desc}`, `{transport}` etc.
- **`toast.*` (+7)**: mktRemoved{id}, mcpDisabled{id}, mcpEnabled{id}, mcpRemoved{id}, apiKeyActivated{warning}, apiKeyRemoved, pluginRemovedNotif (for system notification)

### Migration

- [REFACTOR] **`showAddMarketplaceModal()`**: title/badge/close-aria/intro/source-label/placeholder/helper-list/buttons/validation-errors all via `t()`
- [REFACTOR] **`showAddMcpModal()`**: ~25 strings migrated (form labels + hints + placeholders + 3 transport radios + dynamic URL/Command swap via `updateTargetPlaceholder()` + 4 validation errors + submit/cancel)
- [REFACTOR] **10 `confirmDialog()` calls** migrated with full interpolation. All dialogs preserve behavior but texts follow the active language
- [REFACTOR] **6 specific toasts** (mktRemoved, mcpDisabled/enabled/removed, apiKeyActivated/removed) + system notification "Plugin removed"
- [QUALITY] Variable shadow fix: `transports.forEach(t => ...)` renamed to `tr` to avoid shadowing the global `t()` helper (2 other shadows left because they don't call t() inside)

### Coverage

- ✅ Main Plugin modals (Add Marketplace + Add MCP)
- ✅ All 10 native Electron confirm dialogs
- ✅ Additional contextual toasts (6+1)
- ⏳ Existing Settings labels (Paths/Editor/Terminal/Tracked projects/Account/API key panel) → v1.0.116
- ⏳ Stats KPI + range filters + context breakdown labels → v1.0.117
- ⏳ Onboarding tour + activity log entries → v1.0.116
- ⏳ IT↔EN shape audit + EN review + smoke test → v1.1.0 closure

## v1.0.114 — 2026-05-26 — Pack N (Phase 3a): empty states + main toasts

Pack N i18n continues. Migrated the 12 empty state messages and ~15 common static/parameterized toasts.

### Locales — new keys

- **`empty.*` (+8)**: noPluginResults, noMcpResults, noHooksInstall, noResultsShort, noStatsProjects, noTrackedProjects, noGenericItems
- **`toast.*` (+17)**: configChanged, noPublicRelease, upToDate, updateCheckError{msg}, cannotCopy, pluginRemoved{id}, pluginUpdated{id}, pluginDisabled{id,tok}, projectAdded{name}, projectRemoved, marketplaceAdded, errorPrefix{msg}, errorOpen{msg}, errorOpenFinder{msg}, errorOpenEditor{msg}, errorUpdate{msg}, copiedShort{text}

### Empty state migration (12)

- [REFACTOR] `No activity recorded...` → `t('empty.noActivity')`
- [REFACTOR] `No MCP server configured.` → `t('empty.noMcp')` (3 occurrences in Dashboard MCP + main MCP section + grid)
- [REFACTOR] `No plugin matches the filters.` → `t('empty.noPluginResults')`
- [REFACTOR] `No server matches the filters.` → `t('empty.noMcpResults')` (2 occurrences)
- [REFACTOR] `No hook found. Install a plugin...` → `t('empty.noHooksInstall')`
- [REFACTOR] `No project with activity found...` (Stats) → `t('empty.noStatsProjects')`
- [REFACTOR] `No project tracked. Add one...` (Settings) → `t('empty.noTrackedProjects')`
- [REFACTOR] `No results` (palette) → `t('empty.noResultsShort')`
- [REFACTOR] `No items.` (mcp-empty fallback) → `t('empty.noGenericItems')`

### Common toast migration (15+)

- [REFACTOR] `'Configuration updated — reloading…'` → `t('toast.configChanged')` (the spam toast seen ~every minute, now bilingual while we wait for the polling fix)
- [REFACTOR] Update check: 3 static/parameterized messages (noPublicRelease, upToDate, updateCheckError)
- [REFACTOR] Plugin actions: `Plugin disabled: X (−Y tok)` / `Plugin removed: X` / `Updated: X` / `Update error: X` with interpolation
- [REFACTOR] Common errors: `Error: X` → `t('toast.errorPrefix', {msg: X})` (multiple occurrences)
- [REFACTOR] `Open error: X` / `Finder open error: X` / `VS Code open error: X` → toast.errorOpen* (3 variants)
- [REFACTOR] Tracked project: added / removed
- [REFACTOR] MCP: marketplace added, copied to clipboard, cannot copy

### Toasts left to migrate (Phase 3b-c)

- ~55 toasts with specific contextual messages (Disabled/Enabled XX / Hook copy / Skill markdown save / Account login / API key activate / Snapshot import-export / etc.) → next Phase 3b/c batches

## v1.0.113 — 2026-05-26 — Pack N (Phase 2 batch 2): badge + MCP status + sort dropdown + view switcher + filter chips

Pack N Phase 2 continues. Migrated scope/health/blocked/modified badges, MCP statuses (badge + filter chips), universal sort dropdown, view switcher and MCP filter chips.

### Locales — new keys

- **`sort.mkt*` (5)**: dedicated options for the Marketplace sort dropdown (default / added-desc / added-asc / updated-desc / updated-asc)
- **`filter.*` (5)**: MCP filter chips — `all` / `allKinds` / `fromPlugin` / `builtinClaudeAi` / `needsAuth`
- **`badge.pluginActive`**: 'active' (plugin compact status row)
- **`badge.scopeProgetto`**: 'project' (fallback for local scope without name)
- **`badge.scopeLocalNamed` (interpolated `{name}`)**: 'local: {name}'
- **`badge.scopeLocalParen` (interpolated `{name}`)**: 'local ({name})'

### Migration

- [REFACTOR] **`SORT_OPTIONS`** module-level: each option now has `labelKey` instead of hardcoded `label`. Resolved to `t(labelKey)` inside `renderSortDropdown` → automatically follows the active language (no module-load lock-in)
- [REFACTOR] **`renderSortDropdown`** label "Sort:" via `t('sort.label')`
- [REFACTOR] **`renderViewSwitcher`** tooltip "Cards view"/"Compact view" via `t('view.cards')` / `t('view.compact')`
- [REFACTOR] **Marketplace sort dropdown** (5 options): mapped to `sort.mkt*` keys, label and value separated to avoid collisions with generic SORT_OPTIONS
- [REFACTOR] **MCP status chips** (4): label from `mcp.status.*` + `filter.*` (e.g., 'All' / 'Needs Auth' / 'Error')
- [REFACTOR] **MCP scope chips** (3): 'All types' / 'claude.ai' / 'From plugins' → `filter.*`
- [REFACTOR] **MCP card badge text** (6 statuses): `mcp.status.connected/needsAuth/warning/error/unknown/disabled`
- [REFACTOR] **6 scope badges** scattered across buildPluginCard + buildSkillAgentCard + 3 other card builders → all use `t('badge.scopeGlobal')` / `t('badge.scopeLocal')` / `t('badge.scopeLocalNamed', {name})` / `t('badge.scopeLocalParen', {name})` depending on the format
- [REFACTOR] **Plugin compact status row**: 'local: ...' / 'disabled' / 'active' → `t('badge.*')`
- [REFACTOR] **Health badge text** ('health: error' / 'health: warning'): `t('badge.healthError')` / `t('badge.healthWarn')`
- [REFACTOR] **'modified' badge** in `appendModifiedBadge()`: `t('badge.modified')`
- [REFACTOR] **'disabled' browse-card-blocked**: `t('badge.disabled')`

### Coverage so far

- ✅ Sidebar nav + topbar (v1.0.110)
- ✅ Dashboard KPI + section titles + summary chips (v1.0.112)
- ✅ scope/health/blocked/modified badges on all card builders (Plugin, Skill, Agent compact) (v1.0.113)
- ✅ MCP status (badge + filter chips + scope chips + sort)
- ✅ Universal sort dropdown + view switcher (5 sections Plugin/Skill/Agent/MCP/Hooks)
- ⏳ Plugin section: modals (Add Marketplace, Add MCP, Confirm dialogs), form labels, card tooltips, empty states
- ⏳ Stats KPI + range filters + context breakdown labels
- ⏳ Settings labels (Paths/Editor/Terminal/Tracked projects/API key)
- ⏳ Toast messages + activity log + onboarding tour
- ⏳ IT↔EN shape audit + smoke test → v1.1.0 closure

## v1.0.112 — 2026-05-26 — Pack N (Phase 2 batch 1): section titles JS + KPI Dashboard + summary chips

Pack N continuation. Migrated to `t()` all 11 `sectionTitle()` rendered dynamically in JS + 10 Dashboard KPI labels + Hooks card tooltip + 5 Dashboard summary sections (title + emptyText + chip tooltip).

### Locales — 11 new keys

- [FEATURE] `section.stimaContestoStile` ("Context estimate · claude /context style")
- [FEATURE] `section.attivita7g` / `section.attivita30g` / `section.attivita52sett` — dynamic variants of the Stats heatmap title
- [FEATURE] `kpi.hooksTooltip` / `kpi.hooksWarnTooltip` — Dashboard Hooks card tooltip
- [FEATURE] `chip.openSection` ("Open the {name} section") — `{name}` interpolation to be reused on all Dashboard summary chips (5 sections)
- Mirrored in `en.js` with the same shape

### Migration

- [REFACTOR] **11 section titles** migrated from string literal to `t()`: Claude Quotas, Statistics, Recent activity, Context estimate, Claude Code usage, Plugins by weight, MCP server, Marketplace/Plugin/Skill/Agent/Hooks (dashboard summary), + Stats heatmap title (lookup table on HEATMAP_TITLE_KEY) + Context estimate · claude /context style
- [REFACTOR] **10 Dashboard KPI labels**: Active plugins / Disabled / Local plugins / Marketplace / Total skills / Total agents / MCP connected / Hooks · N plugins / Hooks with missing deps / Always-on tokens / Health issues|Warning|Health
- [REFACTOR] **2 Hooks card tooltips** (kpi click navigation)
- [REFACTOR] **5 Dashboard summary sections** (renderDashboardSection): title + emptyText + chip tooltip "Open the X section" with `{name}` interpolation
- [QUALITY] Stats heatmap title: 3-way ternary chain replaced by `HEATMAP_TITLE_KEY` lookup table + default fallback (more compliant with simplify rules)

### Coverage

- Dashboard: practically 100% of static strings migrated (only text embedded in helper functions not yet touched remains, like `loadDashboardUsage`/`loadDashboardStats`/`loadDashboardMcp`)
- Stats: heatmap title and context breakdown title migrated; Stats KPI + range filters + context breakdown labels in batch 2
- Other sections (Plugin/Marketplace/Skill/Agent/MCP/Hooks/Settings): to migrate in v1.0.113+

## v1.0.111 — 2026-05-26 — Simplify pass post-Pack N Phase 1

Quality cleanup on the freshly introduced i18n infrastructure, after `/simplify` (3 review agents: reuse / quality / efficiency). No functional change for the user — the app behaves identically to v1.0.110.

### Code quality

- [REFACTOR] **`i18nState` object removed**: replaced by a simple `let activeLang = 'it'` module-level. Removed the dead `i18nState.detected` field (written in `initLocale()` but never read). One single source of truth for the runtime language
- [REFACTOR] **`_lookupDeep` → `lookupDeep`**: removed underscore prefix not in line with the codebase convention (no other helper uses `_`)
- [REFACTOR] **Narrative comments trimmed** in app.js and locales/*.js: removed JSDoc that narrated the obvious (`setLocale()`, `resolveLocale()`, i18n header) and versioned comments `v1.0.110 — Pack N:` on the `state.locale` field. Compliant with the "no narrative comments" rule of CLAUDE.md (keep only WHY)

### Efficiency

- [PERF] **IPC `getState()` dedup**: `init()` now calls `getState()` only once and passes `appState` to `initLocale(appState)`. Before there were 2 consecutive IPC roundtrips at cold start (-5ms boot time, marginal but free)
- [PERF] **Regex guard in `t()`**: the substitution `s.replace(/\{(\w+)\}/g, ...)` is skipped if `vars` is undefined OR if the string doesn't contain `{`. Saves ~50-100 regex executions per render (at Pack N Phase 2 ramp-up, where `t()` will be called 500+ times)

### Defensive coding removed

- [REFACTOR] **`try/catch` around `document.documentElement.setAttribute('lang', …)` removed** in `applyStaticI18n` and the langSel handler. `setAttribute` with a string never throws; `document.documentElement` always exists when app.js is loaded. Three lines become one

### DRY

- [REFACTOR] **`changeLocale(lang)` helper** extracted: centralizes the 5 steps of language change (`state.locale =`, `setLocale()`, `setState({locale})`, `applyStaticI18n()`, `render()`). The langSel handler in `renderSettings()` is now 4 lines instead of 7. Eliminates the duplicate `setAttribute('lang')` that was both in the handler and (correctly) in `applyStaticI18n()`

### Numbers

- `src/renderer/app.js`: -82 net lines (127 removed, 45 added)
- `src/renderer/locales/it.js` + `en.js`: -6 lines each (simplified headers)

### Agent findings not applied (false positives or premature)

- ❌ Constants `LANGS.IT / MODELS.SONNET` for strings 'it'/'en'/'sonnet'/'opus': small surface, premature abstraction
- ❌ Moving `applyStaticI18n()` into the i18n block: cosmetic, no behavioral change
- ❌ `tokenValuesFor()` fallback now dead: out of scope (it's Pack C residual, not Pack N)
- ❌ Cache element lookup in `renderSettings()` for the dropdown: Settings re-render is not a hot path

## v1.0.110 — 2026-05-26 — Pack N (Phase 1): i18n infrastructure + sidebar/topbar/section titles migrated

First phase of Pack N — `it` + `en` internationalization (the other half of Phase 0 before the public AGPL launch). Aims to cover ~500-700 total UI strings in 10-15h of work. This v1.0.110 only sets up the infrastructure + static areas; dynamic sections (modals, toasts, badges, sort dropdowns, empty states…) will follow in upcoming Pack N releases.

### i18n infrastructure

- [FEATURE] **`src/renderer/locales/it.js` + `en.js`**: nested tables per category (`nav`, `topbar`, `section`, `kpi`, `badge`, `mcp`, `button`, `view`, `sort`, `search`, `empty`, `settings`, `toast`). ~80 initial strings per language. Loaded via `<script>` tag (no `require()`: CSP + `nodeIntegration:false`). They attach to `window.LOCALES`
- [FEATURE] **Helper `t(key, vars?)`** in `app.js`: hierarchical lookup (e.g., `t('nav.dashboard')`), automatic EN fallback if missing in IT, fallback to the key itself if missing everywhere, `{var}` substitution from `vars` argument
- [FEATURE] **`resolveLocale(raw)`** maps OS locale (`it-IT`, `en-US`, `fr-FR`, …) → 'it' or 'en' with 'en' fallback for unsupported languages
- [FEATURE] **`applyStaticI18n()`**: iterates all nodes with `data-i18n="key"` and updates their `textContent` via `t()`. Also updates `<html lang>` for accessibility/screen reader

### OS language auto-detect (first launch)

- [FEATURE] **IPC `get-system-locale`** in `src/main.js`: calls `app.getLocale()` (preferred) + `app.getSystemLocale()` (fallback) Electron, returns both to the renderer
- [FEATURE] **Bridge `getSystemLocale()`** in `src/preload.js`
- [FEATURE] **`initLocale()`** called ONCE in `init()` BEFORE the first render. Order: (1) persisted `state.locale` → use it, (2) otherwise call IPC → `resolveLocale()` → 'it'/'en', (3) final fallback 'en'
- [FEATURE] **`state.locale`** (`'' | 'it' | 'en'`) persisted in `state.json`. Empty = auto-detect on every launch. Set explicitly only if the user changes language from the dropdown

### Language dropdown in Settings

- [FEATURE] **"Appearance" section → "Language"** in `renderSettings()`: dropdown with `Italiano` + `English`, hint explaining "auto-detected from OS first time". Selection → `setState({ locale })` + `setLocale()` + `applyStaticI18n()` + `render()` immediate (no restart)
- [FEATURE] **"Use system language" button** (visible only if `state.locale` is explicitly set): reset → `setState({ locale: '' })` → on next restart the app re-runs auto-detect from the OS. Explanatory tooltip
- [STYLE] Consistent with the existing pattern of the "Default editor" / "Default shell" select already used in Settings

### Areas migrated to `t()` in this release

- [REFACTOR] **Sidebar nav** (`src/renderer/index.html`): every nav label wrapped in `<span class="nav-label" data-i18n="nav.X">`. Click on the 10 items + language change instantly updates textContent
- [REFACTOR] **Topbar title** (`render()`): maps `state.section` → `nav.X` key → `t()`. Shows "Dashboard"/"Marketplace"/"Plugin"/"Skill"/… in IT and "Dashboard"/"Marketplaces"/"Plugins"/… in EN
- [REFACTOR] **Topbar buttons**: "Refresh" / "Terminal" / "+ Project" / "+ Marketplace" / "+ MCP" + tooltips. Refresh button preserves the Lucide rotate-cw icon

### Areas NOT yet migrated (Phase 2-4 upcoming releases)

- Section titles rendered in JS (`sectionTitle(text, iconName)`) still hardcoded — massive migration in upcoming releases
- Dashboard KPI labels
- "global/local/disabled/modified/health: error" badges
- MCP statuses ("Connected/Needs auth/Warning/…")
- Sort dropdown + view switcher tooltips
- Modal titles + form labels (Add Marketplace + Add MCP + confirm dialogs)
- Toast messages, empty states, recent activity
- Existing Settings labels (Paths, External editor, Terminal, Tracked projects…)

### Design decisions

- **Default fallback EN, not IT**: anglophones = TAM ~25× IT (1.5B vs 60M). System in any non-IT language → shows EN, not IT
- **Auto-detect not persisted**: if the user changes the OS language, CLACOROO follows on next launch. Persistent manual override only if the dropdown is used explicitly
- **`t()` string does not auto re-render**: caller decides if `render()` is needed after language change (for now: yes always from the dropdown)
- **No translations in `main.js`/backend lib**: errors and system messages remain in IT/Italian in v1.0.110; full translation in Phase 3

## v1.0.109 — 2026-05-26 — Pack C: Opus/Sonnet comparator + inline Disable from token budget

Two Pack C features selected by the user (#3 + #4). The other 2 (dependency tree + historical statistics) moved to ROADMAP.md for future community planning.

### Opus 4.7 vs Sonnet 4.6 comparator (#3)

Data for both models is **already in the file** `plugin-catalog-cache.json` of Claude Code. Before we loaded only Sonnet 4.6 — now both are loaded and the user can switch.

- [FEATURE] **`tokensByModel`** new field for each plugin in `state.plugins`: `{ sonnet: {always, invoke}, opus: {always, invoke} }`
- [FEATURE] **`state.tokenModel`** ('sonnet' | 'opus', default 'sonnet') persisted in `state.json`. Restored in `init()` with validation
- [FEATURE] **Dropdown "Model: [Sonnet 4.6 ▼ / Opus 4.7 ▼]"** in the section title of the token budget (both Dashboard compact and Stats full). Immediate switch → recalculates summary + sort + render
- [FEATURE] **Extended token budget modal**: new column **"Δ Opus"** showing the difference in tok + % of Opus relative to Sonnet (typically +30-40%). Modal footer shows the total for both models + overall delta
- [FEATURE] **`tokenValuesFor(p, model)`** helper: extracts always/invoke for the current model with graceful fallback
- [STYLE] `.token-budget-title-row` flex space-between to accommodate title + dropdown at the same level

### Inline "Disable" button from token budget (#4)

Quick "context cleanup" action without having to navigate to the Plugin section.

- [FEATURE] **`.token-budget-disable-btn`** on each Top-N row (Dashboard + Stats): text "Disable −2.1K" with Lucide `ban` icon. Click → confirm dialog with details (recovered tok + note about open sessions) → `pluginAction('disable', fullId)` → toast + reload data
- [FEATURE] **`.token-budget-disable-btn-sm`** compact version (icon only) in the actions column of the full table modal
- [FEATURE] **`confirmAndDisablePlugin(p, recovery)`** helper: confirm + IPC + toast feedback with "Disabled: X (−Y tok)" highlighting the recovery
- [SAFETY] MANDATORY confirm dialog + explanation that already open `claude` sessions continue with the plugin active until restarted (consistent with v1.0.106 OS-level behavior)

### ROADMAP.md created

- [DOCS] **New `ROADMAP.md` file**: open ideas for future iterations, organized by area (Analytics, UX, Distribution, i18n, Multi-account). Pack C task #1 (Dependency tree) and #2 (Historical statistics) moved here from TASK.md
- [DOCS] **Historical Free vs Pro brainstorming**: describes what we'd keep free (everything currently implemented) and what could become Pro (bulk ops, automation, multi-account, custom themes, AI recommendations). Hypothetical pricing €4-7/month · €40-60/year · €99-149 lifetime. Philosophy: free complete and self-sufficient, Pro = automation + scale + premium polish
- [DOCS] **"Suggest a feature" section** placeholder for when the project goes public (GitHub issue template + website form)
- [DOCS] **Open questions** documented: AGPL/Pro code split, payment provider (Stripe/Lemon), license key (offline JWT vs online check)

## v1.0.108 — 2026-05-26 — Section title with Lucide icon + uniform spacing + compact Token budget in Dashboard, complete in Stats

Three Dashboard fixes from user feedback:

### Section titles: icon + font + uniform spacing

- [STYLE] **`.list-section-title`** redesigned: font from `11px` to `13px`, `margin-top: 28px` (was 0, every section was too close to the previous one), `margin-bottom: 12px` (was 10). With `:first-child { margin-top: 0; }` for the first section. Result: uniform distances between ALL sections in Dashboard
- [FEATURE] **`sectionTitle(text, iconName)`** helper: builds `<div class="list-section-title">` with Lucide icon on the left + title text. Replaces the pattern `el('div', 'list-section-title', text)` throughout the app
- [FEATURE] **Lucide icons in Dashboard section titles** (same set as the sidebar):
  - Claude Quotas → `gauge`
  - Statistics → `bar-chart-3`
  - Claude Code Usage → `bar-chart-3`
  - Plugins by weight → `gauge`
  - Marketplace → `store` · Plugin → `puzzle` · Skill → `sparkles` · Agent → `bot` · MCP server → `plug-2` · Hooks → `anchor`
  - Context estimate → `eye` · Recent activity → `rotate-cw`
- [FEATURE] **Added 8 Lucide icons to `LUCIDE_ICONS`**: `store`, `puzzle`, `sparkles`, `bot`, `plug-2`, `anchor`, `bar-chart-3`, `gauge`
- [STYLE] `.list-section-title .inline-icon` with `width: 16px`, `opacity: 0.85`, `color: var(--text-muted)` for consistency with the title text
- [REFACTOR] **`renderDashboardSection` accepts `iconName`** optional (passed by renderDashboard for all 6 sections)
- [REFACTOR] Migrated 5 other hardcoded titles to `sectionTitle()` in `renderStatsOverview` (Heatmap, Context estimate)

### Token budget: compact in Dashboard, complete in Stats Overview

- [REFACTOR] **`renderTokenBudgetSection(container, plugins, {mode})`** accepts new `mode` parameter:
  - `'compact'` (default, Dashboard): Top 5 plugins, standard layout
  - `'full'` (Stats Overview): Top 30 plugins + rank column `#1, #2, ...` + name suffix with marketplace + % of the 200K context window in the summary
- [FEATURE] **Token budget in Stats Overview**: new "Plugins by weight" section added at the bottom of the Overview tab (`renderStatsOverview`). Same logic as Dashboard but with extended dataset and more columns
- [STYLE] New class `.token-budget-list-full` with 5-column grid template (rank + name+mkt + bar + always + invoke); `.token-budget-rank-inline` + `.token-budget-name-mkt` for the extra info in full mode

## v1.0.107 — 2026-05-26 — Pack C: Token cost breakdown per plugin (Top-N + full table modal)

First feature of **Pack C — Insight + analytics**. New "Plugins by weight" section in Dashboard showing Top-10 active global plugins sorted by always-on tokens (fixed weight in the context window). Click on the row or on the "See all" button opens a modal with the full table of all active plugins.

### Backend (data already available)

Data is **already loaded** in `state.plugins` since v1.0.11 — read from `~/.claude/plugins/plugin-catalog-cache.json` of Claude Code for the `claude-sonnet-4-6` model:
- `p.tokensAlways` (always loaded at `claude` boot)
- `p.tokensInvoke` (additional cost when the plugin is invoked)

No backend modification required — pure renderer analytics.

### Frontend

- [FEATURE] **`formatTokenSize(n)`** helper: formats `12500 → "12.5K"`, `1500000 → "1.5M"`, `<1000 → number`
- [FEATURE] **`renderTokenBudgetSection(container, plugins)`** in Dashboard:
  - Filters active global plugins with tokens > 0 (no locals, no blocked)
  - Summary line: "Total always-on: X.XK tok · N active plugins · potential on-invoke Y.YK"
  - Horizontal bar chart of the **Top 10**: name with mkt color dot + proportional bar + tok value + on-invoke estimate
  - Click on any row → opens the full modal
  - Footer "↗ See all N plugins by weight" if there are > 10 active plugins
- [FEATURE] **`showTokenBudgetModal(plugins)`**: large modal (max-w 900) with:
  - Explanatory intro (always-on vs on-invoke + plugin-catalog-cache.json source)
  - Full table: rank · name · marketplace · always (with mini bar) · on-invoke · total
  - Footer with aggregate totals (always + on-invoke + N plugins)
  - All values formatted with `formatTokenSize`
  - Table sorted desc by `tokensAlways`
- [STYLE] New classes: `.token-budget-summary/-total-label/-total-val/-sub`, `.token-budget-list/-row/-name/-name-text/-dot/-bar-col/-bar/-val-always/-val-invoke/-see-all`, `.token-budget-modal/-intro/-table/-rank/-table-name/-mkt/-always/-mini/-mini-bar/-val/-invoke/-total/-modal-footer`. Consistent with CLACOROO design system

### Positioning

The "Plugins by weight" section appears in Dashboard **immediately after the Claude Code Usage KPIs** and **before the Marketplace/Plugin/Skill/... summary sections** (see v1.0.105). High visibility for the "which plugins to disable to recover context" decision.

### Non-goals (remaining in Pack C backlog)

- ❌ Dependency tree skill → plugin → marketplace (hierarchical visualization)
- ❌ Historical statistics (enable/disable over time)
- ❌ Opus 4.7 vs Sonnet 4.6 comparator (data for both is in the catalog cache, but we only use Sonnet now)
- ❌ "Disable" button directly from the budget row (the user can go to the Plugin section to perform the action)

## v1.0.106 — 2026-05-26 — Renamed sidebar "Config" → "Claude Config" for clarity

Small UX fix: the sidebar item "Config" was ambiguous relative to "Settings" (CLACOROO app settings). "Claude Config" clarifies that the section contains Claude Code settings (`~/.claude/settings.json` — model, theme, language, Always Thinking, Voice, Effort), distinct from the app's own settings.

- [REFACTOR] `src/renderer/index.html` line 77: "Config" → "Claude Config" in the sidebar nav entry
- [REFACTOR] `src/renderer/app.js`: `sectionTitles.config: 'Config'` → `'Claude Config'` (topbar title when the section is active)
- [NOTE] The inner page already shows `Claude Code Configuration` as the list-section-title (unchanged)

## v1.0.105 — 2026-05-26 — Dashboard: Plugin / Skill / Agent / Hooks summary sections + "See all"

Dashboard extension (user request 2026-05-26): added 4 new summary sections (Plugin, Skill, Agent, Hooks) with the same style as the existing Marketplace and MCP Server ones. All 6 sections now have a limit of **19 chips + 20th "See all (N)"** that leads to the full section.

### Final Dashboard layout (order = sidebar menu)

1. Context estimate · Claude Quotas · Statistics KPIs · Claude Code Usage (unchanged)
2. **Marketplace** (existing, now with limit + "See all")
3. **Plugin** (NEW) — sorted by `installedAt` desc
4. **Skill** (NEW) — recency = `installedAt` of the owner plugin
5. **Agent** (NEW) — recency = `installedAt` of the owner plugin
6. **MCP server** (existing, now with limit + "See all")
7. **Hooks** (NEW) — recency = `installedAt` of the owner plugin
8. Recent activity (unchanged)

### Shared helper

- [FEATURE] **`renderDashboardSection({container, title, items, buildChip, targetSection, getTimestamp, emptyText})`**: reusable helper for all sections. Sorts items by recency (`getTimestamp` desc), slices to 19, each `buildChip(item)` for painting, then adds as 20th chip a clickable "See all (N)" that does `switchToSection(targetSection)`. Empty state if zero items
- [FEATURE] **"See all" chip as the last tile always present** (even with < 20 items): UX consistency, always the same entry point
- [STYLE] **`.skill-chip.dashboard-see-all`**: CLACOROO accent color (`var(--accent-soft)` bg, `var(--accent)` border + text), Lucide `external-link` icon + label "See all (N)". Hover scaling + accent2

### Recency / sorting

- **Marketplace**: `Date.parse(addedAt || lastUpdated)` desc — fallback to state order
- **Plugin**: `Date.parse(installedAt)` desc — available since v1.0.82 (birthtime of plugin cache dir)
- **Skill / Agent / Hooks**: `installedAt` of the owner plugin as proxy (more recent plugin → more recent skills/agents/hooks of the plugin). For now the best alternative without per-skill timestamp tracking in the backend
- **MCP**: return order from `claude mcp list` (no recency available, I keep API order)

### Dashboard MCP refactor

- [REFACTOR] **`paintDashboardMcpChips`** now also applies the 19 limit + "See all" chip for consistency with the other sections (before it showed ALL MCPs, even 12+)

## v1.0.104 — 2026-05-26 — Pack G v2 FULL closure: Disable/Enable single user-added MCP

Last Pack G v2 task implemented. User choice: **only user-added** (remove+add with config backup in state.json). For plugin-managed and claude.ai builtin the action is not offered because it's not feasible cleanly (see TASK.md technical note).

### Backend

- [FEATURE] **`readUserMcpConfig(name)`** in `src/lib/mcp.js`: reads `~/.claude.json` and returns `{scope: 'user'|'local', config}` of the server if present (checking both top-level `mcpServers` for user scope, and `projects[<cwd>].mcpServers` for local scope). Returns `null` if the server is not user-added
- [FEATURE] **IPC `mcp:disable`**:
  - Looks up config via `readUserMcpConfig` → error if not user-added
  - Saves config in `state.disabledMcpServers[name] = {scope, config, disabledAt: ISO}`
  - Executes `claude mcp remove <name> [-s <scope>]`
  - **Automatic rollback** if remove fails: removes the entry from `disabledMcpServers`
- [FEATURE] **IPC `mcp:enable`**:
  - Reads entry from `state.disabledMcpServers[name]`
  - Rebuilds args for `claude mcp add --transport <t> [-s <scope>] [-e KEY=VAL] [-H "Header: val"] <name> <target> [-- args]`
  - Validation of env keys (regex `^[A-Za-z_][A-Za-z0-9_]*$`) and headers
  - On success: removes the entry from `disabledMcpServers` + invalidates MCP_CACHE
- [FEATURE] **IPC `mcp:list-disabled`**: returns disabled servers as pseudo-servers with `status: 'disabled'`, `statusText: 'Disabled by CLACOROO'`, transport + connection extracted from the saved config. Used by the renderer for merging into the grid
- [FEATURE] **Extended activity log**: `mcp disable` + `mcp enable` recorded

### Frontend

- [FEATURE] **"Disable" button** on user-added MCP cards (both connected and needsAuth, NOT on disabled): confirm dialog → `mcpDisable` → toast + re-render. Lucide `ban` icon
- [FEATURE] **"Enable" button** on disabled cards (primary accent style): direct `mcpEnable` (no confirm — enable is "additive" non-destructive action) → green toast + re-render. Lucide `check` icon
- [FEATURE] **Merge of disabled into MCP grid**: `renderMcp` now makes an additional call to `mcpListDisabled` and merges disabled servers with active servers. Identical sort, they appear as "ghost" cards with dashed border
- [FEATURE] **"Disabled" status badge**: new entry in the status badge dictionary (icon `ban`, label "Disabled"). Card with `data-disabled="true"` has opacity 0.7 to indicate the state

### Behavior

- ✅ Only user-added: backend returns clear error if the user tries on plugin-managed/builtin
- ✅ Reversible lifecycle: disable → enable with preserved config (URL/command/env/headers all saved)
- ✅ For OAuth servers: re-enable might require re-authentication (informative toast in the confirm)
- ✅ Activity log also shows disable/enable for audit

### Confirmed non-goals

- ❌ Plugin-managed disable: removed from scope to avoid the "claude plugins update restores the file" issue
- ❌ claude.ai builtin disable: server-side managed, outside local control

### Pack G v2 final status

| Task | Status | Version |
|---|---|---|
| MCP base section | ✅ | v1.0.21–24 |
| Reconnect MCP | ✅ | v1.0.85 |
| `/mcp` button in claude | ✅ | v1.0.86 |
| Add MCP | ✅ | v1.0.94 |
| Remove user-added | ✅ | v1.0.94 |
| View tools (JSON-RPC) | ✅ | v1.0.103 |
| Disable/Enable single | ✅ | v1.0.104 |

**Pack G v2 closed.** 🎉

## v1.0.103 — 2026-05-26 — Pack G v2 — View tools: MCP JSON-RPC mini-client

Second-to-last open task of Pack G v2: show the tools exposed by an MCP server. CLACOROO now includes a **JSON-RPC mini-client** that performs the standard MCP handshake (`initialize` + `notifications/initialized` + `tools/list`) for stdio plugin-managed servers, and returns the tools list with name, description, parameters.

### Backend

- [FEATURE] **New module `src/lib/mcpClient.js`** with `listToolsStdio(cfg)`:
  - Spawns MCP process via `child_process.spawn` (command + args + env merged with `process.env`)
  - JSON-RPC newline-delimited handshake (protocolVersion `2025-06-18`)
  - Sequence: `initialize` → `notifications/initialized` → `tools/list` → SIGTERM
  - 8s timeout on handshake + 5s on `tools/list`. SIGTERM in cleanup, SIGKILL after 2s grace
  - Graceful errors: premature process exit, JSON-RPC error, timeout — each returns `{ok: false, error: "..."}` with description + STDERR truncated (4KB cap, no leak)
  - **Security**: line-by-line parse, skip non-JSON lines (server logs are ignored). `pending` map for matching response → request via JSON-RPC id
- [FEATURE] **IPC `mcp:list-tools`** in `src/main.js`:
  - Resolves server config from `readPluginMcpDeclarations()` (`.mcp.json` of plugins)
  - **Scope filter**: `claude.ai *` returns error "OAuth required, use /mcp inside claude"
  - **Transport filter**: only `stdio`. HTTP/SSE → error "not supported in this version"
  - **User-added servers** not yet supported (config not in plugin declarations) — returns error with clear message
- [REFACTOR] **`readPluginMcpDeclarations` extended** in `src/lib/mcp.js`: now also includes `env` from the declaration (was ignored — necessary for servers requiring env vars like API keys)
- [BRIDGE] **`mcpListTools(serverId)`** exposed via preload

### Frontend

- [FEATURE] **"👁 Tools" button** on MCP cards with `connected` status. Always visible for connected ones (backend filters support):
  - stdio plugin-managed → performs handshake and shows tools
  - HTTP/SSE / claude.ai → graceful error in the modal
  - user-added → "not yet supported" in the modal
- [FEATURE] **`showMcpToolsModal(srv)`**: modal with:
  - Header `tools` badge + server name
  - Loading state during handshake
  - Orange error box with warning icon and explanation if it fails
  - Tools list: each tool has `name` (mono accent), `title` (if different from name), `description`, compact list of `inputSchema.properties` with param badge (required = orange border)
  - Summary "N tools exposed" at the top
  - Display limit 8 params visible + "+N" indicator
- [STYLE] New classes `.mcp-tools-loading/-empty/-error/-error-text/-summary/-list`, `.mcp-tool-item/-head/-name/-title/-desc/-params/-param/-param-more`

### Test

Tested on the real installation:
- **`plugin:context7:context7`** (stdio, `npx @upstash/context7-mcp`): handshake OK, returns 2 tools (`resolve-library-id`, `get-library-docs`) with visible parameters
- **`plugin:claude-mem:mcp-search`** (stdio, sh + node): handshake OK
- **`plugin:cloudflare:cloudflare-api`** (HTTP): graceful error "http transport not supported"
- **`claude.ai Drive`**: graceful error "OAuth server-side"

### Non-goals

- ❌ We don't support HTTP/SSE in this version (they require OAuth tokens that live in Claude Code's keychain, off-limits for CLACOROO)
- ❌ We don't call `tools/call` (only `tools/list`) — MCP tool execution out of scope for CLACOROO
- ❌ We don't support user-added servers without config (TODO v1.0.104+ with parsing of `claude mcp get <name>` output)

## v1.0.102 — 2026-05-26 — Simplify code review fixes (high-priority cleanup)

Post-`simplify` skill cleanup: 3 parallel agents reviewed commits v1.0.95→v1.0.101 and identified 1 latent bug + other high-value cleanups. Fix of the most important ones.

### Latent bug fixed

- [FIX BREAKING] **`btnWithIcon` duplicate/shadowed**: there were TWO definitions of the function — the new Lucide one (v1.0.95, line ~97) and the old heroicons one (v1.0.40, line ~762). The second **shadowed** the first for all the code written after line 762. MCP/Plugin cards and buttons in modals showed heroicons icons instead of Lucide, defeating the v1.0.95 refactor
- [REFACTOR] Removed legacy `svgIcon` + `ICONS` block (39 lines). Added the 2 missing icons in `LUCIDE_ICONS` (`code`, `upload`). Migrated 6 `svgIcon('xxx')` calls → `icon('xxx')` (with rename `folder` → `folder-open`)

### Cleanup batch

- [REFACTOR] **`modifiedFileKey(kind, fullId, name)`** helper: was reinvented in 3+ sites (save handler, isLocallyModified, badge render). Single source of truth
- [REFACTOR] **`appendModifiedBadge(parent, item, kind, mode)`** helper: identical block was inline in `buildSkillAgentCard` AND `buildSkillAgentChip` with only size/styling variants. Mode `'card'` or `'chip'` distinguishes
- [PERF] **Memoize `buildHookList()` on `state._hookListCache`**: was called 2 times (renderHooks + renderDashboard KPI), each iterating state.plugins × hookEvents × matchers. Now cache invalidated in `processData()` at each reload. No more duplicate compute
- [PERF] **`setViewMode` guard**: added `if (state.viewMode[section] === mode) return;` as first line to avoid setState + render when already set (was guarded only on the button click side)
- [CLEANUP] Removed dead code `kindLabel` (was marked "unused, placeholder")
- [REFACTOR backend] **`detectReconnectType` in `src/lib/mcp.js`**: removed emoji prefixes (`↗`, `🚫`) from action `label`. The renderer now builds the Lucide icon from `kind` without having to strip them with regex `^[^a-zA-Z]+\s*`. Eliminated the fragile regex

### NOT applied (deliberate — false positive or low value)

- ❌ Factory `buildCompactRow(opts)` for 4 sections (Marketplace/Plugin/MCP/Hooks): the 4 functions have truly different structures (counts/status/transport/matcher/sub vary per section), unifying them would increase factory options without significantly reducing LOC
- ❌ Constants `VIEW`/`KIND`/`RECONNECT`: 30+ sites to migrate, low value (strings already stable)
- ❌ `showMarkdownModal({...opts})`: more invasive API change, I kept the 4-arg positional signature
- ❌ `validIdentifier` shared in `src/lib/validators.js`: 4 different sites but with regex slightly different per use case (mcp name vs plugin id vs markdown name). Kept separate
- ❌ Cleanup of `// v1.0.xx —` comments: high volume, low value. Git history is the source of truth

## v1.0.101 — 2026-05-26 — Explanatory tooltip on event badges in the Hooks section

Last open task of Pack K extension. The user **discarded** the other 3 planned tasks (slow-hook indicator, trigger count, overlap warning) for debatable scope / low utility.

- [FEATURE] **`HOOK_EVENT_DOCS`** dictionary in the renderer with long description for each of the 10 Claude Code events: SessionStart, SessionEnd, Stop, SubagentStop, UserPromptSubmit, PreToolUse, PostToolUse, PreCompact, Notification, Setup. Each entry has 2 paragraphs: (1) **when it triggers** (what causes it), (2) **how it's typically used** by plugins
- [FEATURE] **`hookEventDoc(name)`** helper generates the formatted tooltip string. For custom undocumented events returns name + note "Custom event (not documented in Claude Code core)"
- [FEATURE] **Tooltip applied in 4 places**:
  - Event badge on hook cards (cards view)
  - Mini event badge on compact rows
  - Event badge in the header of the hook details modal
  - Event filter chip in the header of the Hooks section (useful to learn what you're filtering before clicking)
- [STYLE] **`.hook-event-badge cursor: help`**: the cursor indicates to the user that hovering produces info

### Discarded (user decision)

- ~~"Potentially slow hook" indicator (`async: false` + long-running script)~~ — too debatable scope, high false positives
- ~~"Estimated trigger" count based on matcher pattern~~ — poorly actionable information
- ~~Overlapping matcher warning on the same event~~ — rare use case

Pack K extension considered **closed** with v1.0.87+v1.0.94+v1.0.101 (hook deps, plugin filter, event tooltip).

## v1.0.100 — 2026-05-26 — Three UX fixes: toast z-index, "modified" badge on cards, extended activity log

One hundredth release! 🎉 Three fixes related to user feedback on v1.0.99 (inline editor).

### Fix #1 — Extended activity log

New actions added after the first implementation of the activity log (v1.0.05) were not being recorded. The "Recent" cards in the sidebar and the "Recent activity" section of the Dashboard only showed plugin/marketplace, missing all the news from v1.0.85+.

- [FEATURE] **`write-markdown-file` IPC** now calls `appendActivity({kind: 'skill'|'agent', action: 'edit', target: name + ' (' + fullId + ')'})` on success and failure
- [FEATURE] **`mcp:add` IPC** logs `kind: 'mcp', action: 'add', target: name + ' (' + transport + ')'`
- [FEATURE] **`mcp:remove` IPC** logs `kind: 'mcp', action: 'remove', target: name`
- [FEATURE] **`mcp:clear-auth-cache` IPC** logs `kind: 'mcp', action: 'clear-auth-cache', target: serverId`
- [FIX] **`refreshSidebarRecent` extended routing**: in addition to `marketplace` and `plugin`, click on the row now routes to `skills`/`agents`/`mcp`/`hooks` sections based on the entry `kind`
- [NOTE] **NOT logged** `hooks:check-tool` (automatic polling, noise) and `hooks:refresh-deps` (called by topbar Refresh, already visible)

### Fix #2 — Toast under modal overlay

Toasts generated by actions inside a modal (e.g., Save .md file, Copy text, Add MCP) appeared **under** the modal's blurred backdrop: the user only saw a colored unreadable smudge in the bottom right.

- [FIX] **`.toast-container z-index`** raised from `9999` to `99999` (above `.md-overlay` which is `99998`). Toasts now appear above the modal with full readability

### Fix #3 — "Modified" badge on skill/agent cards

After saving a modification to a skill/agent `.md` file (v1.0.99), there was no way to see at a glance which skills/agents had been locally edited. Now:

- [FEATURE] **`state.modifiedFiles`** new state field, persisted in `state.json`. Key: `kind:fullId:name`, value: ISO timestamp of last modification
- [FEATURE] **Extended save flow**: after successful `writeMarkdownFile`, adds entry to `state.modifiedFiles` + persists via setState
- [FEATURE] **`isLocallyModified(item, kind)`** cross-check helper on state
- [FEATURE] **"✎ MODIFIED" badge** on skill/agent cards (`.browse-card-modified`): warm orange CLACOROO (`#f0a280` on `rgba(217,119,87,.18)`), next to scope/health/blocked. Lucide `pencil` icon. Tooltip: modification timestamp + reminder that it will be overwritten at the next `claude plugins update`
- [FEATURE] **Mini pencil icon** on compact chips (compact view) for the same purpose, size 11×11, warning yellow color
- [STYLE] `.browse-card-modified` + override `.chip-modified-icon` for the compact view

### Persistence note

The `modifiedFiles` tracking remains until explicitly cleared. Ideally we should invalidate it when the user runs `claude plugins update <plugin>` (which reverts the file to upstream), however:
- We can't intercept when the user does it from an external terminal
- We can intercept when they do it from CLACOROO ("Update" button on the plugin card) — potential future extension
- For now the tooltip reminds the user: "will be overwritten at the next `claude plugins update`". The user knows when the badge is no longer accurate

## v1.0.99 — 2026-05-26 — Inline editor for skill/agent .md files in preview modal

Natural extension of v1.0.98 (explanatory tooltip): the markdown preview modal of skill/agent now has an **"Edit"** button that switches the preview to a textarea editor, allowing the user to fix the frontmatter or body of the `.md` file directly from CLACOROO without opening an external editor. Clear warning above the editor: changes are **temporary** (overwritten at the next `claude plugins update <plugin>`).

### Backend (`src/main.js` + preload)

- [FEATURE] **IPC `write-markdown-file(fullId, kind, name, content)`** + preload bridge `writeMarkdownFile`. Same validation pattern as `read-markdown-file`:
  - `fullId` resolved via `resolvePluginPath` (no path escape)
  - `name` must match regex `^[a-zA-Z0-9][a-zA-Z0-9_.-]*$`
  - `kind` must be `skill` or `agent`
  - `content` must be string ≤ 500KB (sanity limit)
  - **Paranoid path traversal verification**: the final path must be inside the plugin's cache directory (`path.resolve(...).startsWith(root + sep)`)
  - **File must already exist**: we don't create new files, only update of skills/agents already declared by the plugin (no ghost agent creation)

### Frontend (`src/renderer/app.js`)

- [FEATURE] **`showMarkdownModal(name, kind, content, fullId)`** extended: new optional `fullId` argument. If passed, enables the "Edit" button in the modal header
- [FEATURE] **3 new header buttons**: "Edit" (Lucide `pencil` icon), "Save" (`check` icon, green), "Cancel" (`x` icon). Shown conditionally based on `mode` (`preview` vs `edit`)
- [FEATURE] **`switchToEdit()` / `switchToPreview()`** orchestrate the modal content swap: in preview render markdown via `renderMarkdownToContainer`; in edit show warning box + editable textarea
- [FEATURE] **`.md-editor-warn` warning box** above the textarea: triangle-alert icon + text explaining that local changes will be overwritten at the next `claude plugins update <plugin>`, and suggests opening PR/issue for a permanent fix
- [FEATURE] **Confirm dialog on exit with pending changes**: if the user presses Esc / Cancel / closes / click outside with `textarea.value !== currentContent`, confirmation is requested via `window.confirm`
- [FEATURE] **Save flow**: click "Save" → `writeMarkdownFile` IPC → success toast → reload `loadData()` to re-trigger health check (if the fix resolves the warning, the badge disappears from the card immediately)
- [FEATURE] **Cancel flow**: click "Cancel" → with confirm if pending changes → return to preview with original currentContent
- [REFACTOR] **`openMarkdownPreview` propagates `fullId`** to `showMarkdownModal` (it was already available in the caller)
- [STYLE] New classes `.md-editor-warn` (orange badge), `.md-editor-warn-text strong` (bold yellow header), `.md-editor-textarea` (mono 12px, min-height 400px, vertical resize, accent focus border), `.md-save-btn` (green success color override)
- [ICON] New Lucide `pencil` icon for the Edit button

### Use case

Example: the `audit-budget` agent of `maxym-ai-ads` has health-warn because `description` is missing in the frontmatter. Click on the card → preview → "Edit" → add `description: ...` to the YAML frontmatter → "Save" → green toast + badge disappears from the card. Immediate local fix until you update the plugin.

### Non-goals

- ❌ We don't write new files (`existsSync` check mandatory)
- ❌ We don't modify paths outside the plugin cache (paranoid check)
- ❌ There's no confirm before saving (it's the user's responsibility); the permanent warning on the editor is sufficient

## v1.0.98 — 2026-05-26 — Enriched explanatory tooltip on Skill/Agent health badges

User feedback on the warnings/errors visible on Agent cards: what are they and can they be resolved? Investigation:

- **What they are**: errors of the YAML frontmatter of the `.md` file (manifest of agent/skill), generated by `checkMarkdownHealth()` in `src/lib/markdown.js`. Types: `Frontmatter YAML missing or empty` (err), `Missing "name"/"description" field` (err), `Description too short` (warn). They are **plugin author errors**, not missing features on the user's system
- **They are not installable**: the malformed `.md` file lives in `~/.claude/plugins/cache/...` and is overwritten at the next plugin update. It's not a runtime tool to install (like Bun in v1.0.91)

### Chosen fix: document in the tooltip (no new buttons)

- [FEATURE] **Enriched tooltip** on the `.browse-card-health` badge of Skill/Agent cards: in addition to the list of issues, it now explains:
  - What the problem is (`.md` frontmatter error, plugin manifest)
  - That it's NOT a user installation problem
  - The 2 possible fixes: open an issue on the plugin repo (`marketplace upstream`) for a permanent fix, OR manually modify the frontmatter in the local file (knowing it'll be overwritten at the next `claude plugins update`)
  - That the agent/skill works anyway but Claude Code might not invoke it correctly due to missing metadata
- [NOTE] **No "Open issue" or "Edit frontmatter" buttons** for now: deliberate UX choice to keep the card clean. The educational tooltip is sufficient to explain the problem without taking up visual space

## v1.0.97 — 2026-05-26 — Pack M closure: compact view for Marketplace / Plugin / MCP / Hooks

Completed the other half of **Pack M** after v1.0.96 (which brought cards to Skill/Agent). Now **all 6 sections** have both views with live switch in the topbar.

### Compact view for the 4 sections that previously had only cards

- [FEATURE] **`buildMarketplaceCompactRow(m)`**: mkt color dot + name + count `X / Y plugin` (installed/available) + repo + `auto-update` badge. Click opens `showMarketplaceContentModal`
- [FEATURE] **`buildPluginCompactRow(p)`**: mkt color dot + name + mkt + status badge (`active`/`disabled`/`local: project-name`) + count summary (`N skills · M agents · mcp · hooks`). Click opens `showPluginContentModal`
- [FEATURE] **`buildMcpCompactRow(srv)`**: colored status dot (green/orange/red) + name + transport badge (HTTP/SSE/STDIO) + sub (claude.ai/plugin/user-added) + statusText if not connected
- [FEATURE] **`buildHookCompactRow(item)`**: small colored event badge + plugin + truncated matcher (30 char with full tooltip) + scope badge + warn for missing deps if applicable. Click opens `showHookDetailsModal`

### Render function refactor

- [FEATURE] **`renderMarketplaces` / `renderPlugins` / `renderMcp` / `renderHooks`**: each now includes `renderViewSwitcher` in the header and selects the correct builder (card or compact row) based on `state.viewMode[section]`. Different grid class: `.cards-grid|.mkt-cards-grid|.mcp-grid|.hook-grid` for cards, `.compact-list` for compact

### Shared CSS

- [STYLE] **`.compact-list`** flex column with minimum gap (4px) for dense lists
- [STYLE] **`.compact-row`** base with colored border-left (status/mkt), minimum padding, subtle hover
- [STYLE] **`.compact-row-*`** reusable atomic classes: `-dot`, `-name` (mono bold), `-sub` (muted), `-plugin`, `-matcher` (code accent2), `-transport`, `-counts` (margin-left auto), `-pstatus` (badge), `-status-msg`, `-warn` (orange badge with Lucide icon), `-tag`
- [STYLE] **`.plugin-status-active/-blocked/-local`** colored variants for status badge
- [STYLE] **`.hook-event-badge-sm`** mini version of the Hook event badge (9px) for compact rows

### Behavior

- ✅ Immediate switch (no reload), persisted in `state.json`
- ✅ Default `cards` for all sections
- ✅ Search + filters + sort work identically in both views
- ✅ In compact: no inline buttons (Install/Remove/Details) — click on the entire row opens the full details modal

### Fix overlapping health badge on Skill/Agent cards

- [FIX] Skill/Agent card: the "health: warning"/"health: error" health badge overlapped with the `scope-badge GLOBAL` because it used the `.health-badge` class (16x16 circle designed for compact chips, with a single `⚠`/`!` character). The text spilled out of the circle overlapping with the adjacent element
- [FIX] Replaced with new class `.browse-card-health` (proper rectangular badge, aligned in flex with the other badges, gap 6px). Includes Lucide `triangle-alert` icon + text. Variants `.h-err` (red) and `.h-warn` (orange)

## v1.0.96 — 2026-05-26 — Pack M MVP: switchable cards + compact view (Skill/Agent)

First step of **Pack M** (cards + compact view for all sections). MVP with infrastructure + the 2 simplest sections (Skill, Agent — today only compact). The other sections (Marketplace/Plugin/MCP/Hooks — today only cards) will receive compact view in v1.0.97.

### View switcher infrastructure

- [FEATURE] **`state.viewMode = { plugins, marketplaces, skills, agents, mcp, hooks }`** with default `'cards'` for all. Persistence in `state.json` via setState. Restore in `init()` with validation (only `'cards'` or `'compact'` accepted)
- [FEATURE] **`renderViewSwitcher(section, currentMode, onChange)`** helper: 2 icon toggle buttons (Lucide `layout-grid` for cards + `list` for compact) with highlighted active state. Positioned in the `section-header` next to the sort dropdown
- [FEATURE] **`setViewMode(section, mode)`** helper: updates state + persists + re-renders
- [FEATURE] **`renderListSection` extended**: accepts optional `sortConfig.viewSwitcher = {section, mode, onChange}`. Shown to the left of the sort dropdown
- [STYLE] New classes `.view-switcher`, `.view-switcher-btn`, `.view-switcher-btn.active`

### Cards view for Skill/Agent

- [FEATURE] **`buildSkillAgentCard(item, kind)`** new builder: card layout similar to `.hook-card` with header name + plugin/mkt dot, body with scope badge + health badge + blocked badge if applicable, footer with "Open preview" button (reuses `openMarkdownPreview`). Fully clickable card
- [FEATURE] **`buildSkillAgentChip(item, kind)`** extracted separately (was inline in renderSkills/renderAgents). Compact view unchanged
- [FEATURE] **`renderSkills` / `renderAgents` refactored**: based on `state.viewMode.skills/agents` they use the card or chip builder. Different grid class: `.browse-card-grid` for cards, `.skill-grid` for compact
- [STYLE] New classes `.browse-card-grid`, `.browse-card`, `.browse-card-head/-title-wrap/-title/-plugin-line/-mkt-dot/-plugin/-mkt`, `.browse-card-body/-badges`, `.browse-card-blocked`, `.browse-card-foot/-hint`. Reusable for compact views of other sections in v1.0.97

### NEXT (v1.0.97 — Pack M completion)

- Compact view for Marketplace (chip with installed/available count)
- Compact view for Plugin (chip with status)
- Compact view for MCP (chip with status dot + transport)
- Compact view for Hooks (chip with small event badge + truncated matcher)

## v1.0.95 — 2026-05-26 — MCP card truncate + Lucide icon helper (no emoji) + Pack M registered

Two UX fixes from user feedback on the MCP section.

### Truncate MCP command to 2 lines

- [FIX] **MCP card `mcp-search` (claude-mem) very tall**: the very long shell command (~600 char) made the card grow to the entire column, throwing off the grid row height and creating huge empty spaces in the other cards. Now `.mcp-card-conn` has `max-height: 36px` (~2 lines) + "Show all" / "Show less" button below, visible only if the content is truly truncated (`scrollHeight > clientHeight + 2`)
- [STYLE] `.mcp-card-conn.expanded` removes the `max-height` constraint to expand
- [STYLE] `.mcp-card-conn-toggle` neutral uppercase mini-button that activates expansion

### Lucide icon helper (replaces emoji)

- [REFACTOR] **`LUCIDE_ICONS`** dictionary in the renderer with ~20 Lucide SVG paths (plus, x, check, trash-2, play, copy, external-link, search, folder-open, triangle-alert, rotate-cw, circle-check, circle-x, circle-alert, circle-help, ban, eye, terminal, plug, chevron-down/up)
- [REFACTOR] **`icon(name)`** helper generates an inline Lucide `<svg>` node with class `.inline-icon` (14px default, inherits currentColor, stroke style consistent with sidebar)
- [REFACTOR] **`btnWithIcon(cls, iconName, label)`** + **`spanWithIcon`** helpers to reduce boilerplate
- [STYLE] `.inline-icon` centralized CSS + variant `.icon-lg` (16px) and `.icon-only` (no margin-right)
- [FIX] **Replaced emoji on the most visible buttons**: topbar (`+ Marketplace/MCP/Project`, `↻ Refresh`, `▣ Terminal`), MCP card (status badge, `⧉ Copy`, `🗑 Remove`), Hook card (`⌕ Details`, `📁 Open hooks.json`), "Missing" badge, "▶ Install <tool>" + "↗ Docs <tool>" buttons, modal close (`×` → Lucide `x` icon), modal copy (`⎘ Copy` → `copy` icon), MCP reconnect buttons (icon per kind)
- [NOTE] **Partial refactor**: I covered the most visible buttons and badges. Some emojis remain in minor places (toast `✓/✗`, inline indicators `⚠ Storage`, etc.) — will be replaced incrementally in upcoming versions when working on those areas

### Pack M registered (NEXT)

- [DOCS] **Pack M — Switchable cards + compact view for all sections**: registered in TASK.md. Skill/Agent today only have compact chip view; Marketplace/Plugin/MCP/Hooks have only cards. Pack M adds both views for all with switch in topbar next to the sort dropdown. Default cards view. Implementation in v1.0.96+ (MVP infra+Skill/Agent), v1.0.97+ (compact for the others)

## v1.0.94 — 2026-05-26 — Plugin filter in Hooks + Pack G v2 mutating actions: Add/Remove MCP

Two parallel features from the same user choice.

### Plugin filter in the Hooks section (Pack K extension)

- [FEATURE] **"Plugin:" dropdown** in the filter row of the Hooks section, next to "Event" and "Scope". Plugin list extracted dynamically from visible hooks (e.g., claude-mem · superpowers · watch · ralph-loop · security-guidance) — combinable in AND with other filters
- [FEATURE] **Shown only if >1 plugin**: if the user has hooks from a single plugin, we hide the dropdown (would be useless). Dropdown choice instead of multi-chip because it scales better (5+ plugins would fill 2 rows)
- [FEATURE] `state.filters.hooks.plugin = 'all'` new field in state, default `'all'`
- [STYLE] New class `.hook-filter-select` consistent with `.sort-dropdown` (dark bg + accent2 border on hover)

### Pack G v2 — closing mutating actions: Add/Remove MCP

CLACOROO now covers the **complete MCP lifecycle** without having to use the CLI: add new servers, remove user-added ones, reconnect (v1.0.85–86), clear cache. Only "View tools" (requires JSON-RPC mini-client, separate scope) and "Disable/Enable single server without disabling plugin" (Claude Code CLI doesn't expose it) remain out.

**Backend (`src/main.js`)**:
- [FEATURE] **IPC `mcp:remove`** → `claude mcp remove <name>` with `validMcpName` validation (regex `^[a-zA-Z0-9][a-zA-Z0-9_.-]*$`). Invalidates renderer MCP cache on success
- [FEATURE] **IPC `mcp:add`** → `claude mcp add --transport <t> [--scope <s>] [-e KEY=VAL ...] [-H "Header: val" ...] <name> <target> [-- args...]`. Validation: name regex + transport `http|sse|stdio` + non-empty target + env regex `KEY=VAL` + header with `:`. stdio args passed after `--`
- [SECURITY] All parameters passed as array to `execFile`, no interpolated strings. CLAUDE.md rules respected

**Frontend (`src/renderer/app.js`)**:
- [FEATURE] **"+ MCP" button** in the topbar when in MCP section (replaces "+ Project" as "+ Marketplace" does in Marketplaces). Opens the Add MCP form modal
- [FEATURE] **"Add MCP server" modal** with sectioned form:
  - **Name** (text input, alphanumeric)
  - **Transport** (3 radio button cards: HTTP / SSE / stdio, with description)
  - **URL/Command** (dynamic field: placeholder changes based on transport)
  - **Arguments** (textarea, one line per arg — visible only for stdio)
  - **Env vars** (textarea, format `KEY=VALUE` one per line, optional)
  - **HTTP Headers** (textarea, format `Name: value` one per line, optional)
  - Client-side validation before submit + visible error box
  - Submit calls `mcpAdd({name, transport, target, args, envs, headers, scope:'user'})` + toast + refresh MCP
- [FEATURE] **"🗑 Remove" button** on MCP cards with `scope='user'`: does NOT appear for claude.ai builtin (Drive/Gmail/Calendar) nor for plugin-managed (Cloudflare/Supabase/Neon — managed by their plugins). Confirmation dialog with action detail (`claude mcp remove <id>`)
- [FEATURE] **`confirmAndRemoveMcp(srv)`** helper with confirm dialog + `mcpRemove` call + toast feedback + re-render
- [STYLE] New classes `.add-mcp-form`, `.add-mcp-label/-title/-hint`, `.add-mcp-input`, `.add-mcp-textarea`, `.add-mcp-radios`, `.add-mcp-radio[/.selected]/-label/-desc` (native style radio button cards)
- [REFACTOR] Helpers `makeFormLabel(title, hint)` + `makeFormInput(id, placeholder)` reusable for future forms

## v1.0.93 — 2026-05-26 — Hook dep install: automatic post-install polling (no manual "Refresh" click)

User feedback on the v1.0.92 flow: after launching `bun install` from the "▶ Install bun" button, the user must manually click "↻ Refresh" in the topbar to make the "Missing: bun" badge disappear. Limping UX.

- [FEATURE] **`startDepInstallPoller(tool)`** in the renderer: after `installDepInTerminal` has pre-typed the command, an automatic poller starts that calls `hooks:check-tool` every 5 seconds to check if the tool has appeared in the PATH. When installed → invalidates cache + reloads data + toast `✓ <tool> installed!`. No more manual click
- [FEATURE] **IPC `hooks:check-tool`** + preload bridge `checkHookTool(tool)`: invalidates the single tool entry from the cache (bypass TTL) and returns `{installed, path}`. Lightweight: 1 spawn of `which`/`shell -lc` instead of the entire re-check of all tools
- [FEATURE] **`invalidateOne(tool)`** in `src/lib/hookDeps.js`: invalidates only a single tool's entry, leaving the others intact. Used by the poller to not bust the entire cache on each tick
- [FEATURE] **3 minute timeout** on the polling: if the user decides not to run the install (Ctrl+C in the pty) the poller stops by itself with informative toast "Timeout: click ↻ Refresh if you've completed the install"
- [FEATURE] **Anti-duplicate**: if the user clicks "Install <tool>" multiple times on the same tool, the old poller is cleared before creating a new one. No setInterval accumulation

## v1.0.92 — 2026-05-26 — Fix "Install" button: confirm-dialog returns number, not object

Bug introduced in v1.0.91: click on "Open terminal" in the confirm dialog did nothing. Root cause: `confirm-dialog` IPC handler directly returns `r.response` (number: 0 = Cancel, 1 = Open terminal), but my code in `installDepInTerminal` checked `ok.response !== 1` as if it were a wrapper object → the condition was ALWAYS `true` (`undefined !== 1`) and the function returned immediately.

- [FIX] `installDepInTerminal`: variable renamed from `ok` to `response`, correct condition `if (response !== 1) return;`
- [NOTE] Same pattern in other confirmDialogs of the app: `r.response` returned directly as a number. Only this specific call site was wrong

## v1.0.91 — 2026-05-26 — Hook dep: "▶ Install <tool>" cross-platform button for missing dependencies

Extension of the v1.0.87–90 detector: when a hook card shows `⚠ Missing: bun`, now there's an **"▶ Install bun"** button next to the badge that opens the integrated terminal + pre-types the official installation command for the current platform (macOS/Linux/Windows). Pattern identical to Pack G v2 v1.0.86 reconnect MCP (confirm dialog + pre-typing + no automatic Enter — the user decides whether to proceed).

### Backend

- [FEATURE] **`INSTALL_COMMANDS`** new `{ tool: { darwin, linux, win32 } }` map with OFFICIAL commands for each platform. Sourced from the official docs of each tool:
  - **bun**: `curl -fsSL https://bun.sh/install | bash` (macOS/Linux), `powershell -c "irm bun.sh/install.ps1 | iex"` (Win)
  - **deno**: `curl -fsSL https://deno.land/install.sh | sh`, `irm https://deno.land/install.ps1 | iex`
  - **python3** / **gh** / **jq** / **rg** / **fzf** / **aws**: `brew install` (macOS), `sudo apt install -y` (Linux), `winget install` (Win)
  - **uv**: `curl -LsSf https://astral.sh/uv/install.sh | sh`
  - **wrangler** / **vercel** / **pnpm**: `npm install -g <tool>`
  - **cargo** / **rustc**: `curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  - **gcloud** / **docker**: `null` on all platforms — they require multi-step GUI installers, we only show docs link
- [FEATURE] **`INSTALL_DOCS`** map `tool → official docs URL` (direct link to the tool's installation page, to open in the browser as fallback for GUI-only tools)
- [FEATURE] **`INSTALL_HINTS`** now generated automatically from `INSTALL_COMMANDS + INSTALL_DOCS` for the tooltip (all platforms + docs link on separate lines)
- [FEATURE] **`getInstallCommand(tool, platform)`** helper: returns the command for the current platform or `null` if unavailable
- [FEATURE] **`checkAvailability` enriched**: each tool now includes `installCommand` (for current platform) + `docsUrl`

### Frontend

- [FEATURE] **"▶ Install &lt;tool&gt;" button** next to the `⚠ Missing: X` badge: clicking opens confirm dialog ("Install X in the terminal?") + if OK opens terminal drawer + new tab + pre-types the install command. **No automatic Enter**: the user sees the complete command in the prompt and presses Enter only if confirmed (Pack B v1.0.77 pattern)
- [FEATURE] **"↗ Docs &lt;tool&gt;" button** for tools without a one-liner (e.g., Docker Desktop, gcloud): opens the official docs page in the browser via `shell.openExternal`
- [FEATURE] **`installDepInTerminal(tool, command)`** helper that orchestrates: confirm dialog → check pty capabilities → opens drawer → creates clean tab (no auto-Enter) → pre-types command after 600ms
- [STYLE] New classes `.hook-dep-install-btn` (CLACOROO orange) and `.hook-dep-install-docs` (Anthropic blue) with different hovers

### Security & non-goals

- ✅ **MANDATORY confirm dialog** before any pre-typing — no accidental execution
- ✅ **NO automatic Enter** — the user sees the full command, evaluates it, and presses Enter only if they want to
- ✅ **Commands taken from official sources** of the respective tools (bun.sh, deno.com, rustup.rs, etc.)
- ❌ **NO automatic sudo escalation**: the `apt install` commands on Linux will require the password the user enters in the terminal
- ❌ **NO GUI installers launched by CLACOROO**: for Docker/gcloud we only open the browser on the docs page (user downloads installer)

## v1.0.90 — 2026-05-26 — Hook dep cache: 60s TTL + explicit refresh via "↻ Refresh"

User feedback: I uninstalled Bun but the claude-mem cards don't show "Missing: bun" even after clicking "↻ Refresh". Root cause: the availability cache was in main process memory populated only once at boot. The "↻ Refresh" button only invalidated Claude data (`get-mcp`, stats), NOT the `_availabilityCache` of `hookDeps.js` → installs/uninstalls done with the app open remained invisible until restart.

- [FIX] **60s TTL** on the availability cache (`AVAIL_TTL_MS` in `src/lib/hookDeps.js`): if the cache entry for a tool is older than 60s, it's automatically redone on the next check. Compromise between freshness (quick install/uninstall tests) and cost (re-spawning `which`/`shell -lc` for each tool is ~1-2s, avoided for close calls)
- [FEATURE] **IPC `hooks:refresh-deps`** + preload bridge `refreshHookDeps()`: explicit call that does `clearCache()` on main to force immediate re-check of all tools
- [FEATURE] **Topbar "↻ Refresh" button** now invokes `refreshHookDeps()` BEFORE `loadData()`: the user who just installed/uninstalled a tool clicks the button and sees the change on the card immediately. Button title updated to reflect the new behavior
- [QUICK TEST]
  - Uninstall Bun: `rm -rf ~/.bun` + remove `export PATH` from `~/.zshrc`
  - In CLACOROO click **↻ Refresh** → claude-mem cards (5) now show `⚠ Missing: bun` badge
  - Reinstall Bun: `curl -fsSL https://bun.sh/install | bash`
  - Click **↻ Refresh** again → badges disappear. No restart required

## v1.0.89 — 2026-05-26 — Hook dep detector fix #2: robust 3-level check (PATH + login shell + fs.existsSync)

User feedback: I installed Bun but CLACOROO still shows "Missing: bun" on claude-mem cards. Root cause: Bun installed in `~/.bun/bin/bun` but `~/.bun/bin` is not in the Electron process PATH (inherits launchd's minimal PATH when launched from Finder, and even `npm start` doesn't trigger `.zshrc` reload). `which bun` called from CLACOROO failed, even though in the user's shell `which bun` works perfectly.

- [FIX] **3-level availability check** (`checkAvailabilityOne` in `src/lib/hookDeps.js`):
  1. **`which`/`where`** on Electron process PATH — fast, covers Homebrew/system installations
  2. **`$SHELL -lc 'command -v <tool>'`** — login shell with `-l` reads user's `.zshrc`/`.bashrc` and takes the "real" PATH (includes `~/.bun/bin`, `~/.deno/bin`, etc. added by installers)
  3. **`fs.existsSync`** on `STANDARD_BIN_DIRS` — final fallback on list of known directories: `~/.bun/bin`, `~/.deno/bin`, `~/.cargo/bin`, `~/.local/bin`, `~/.volta/bin`, `~/.pyenv/shims`, `~/.rbenv/shims`, `~/.poetry/bin`, `/opt/homebrew/bin`, `/usr/local/bin`
- [FIX] **`looksLikePath(s)` validation**: some startup hooks (e.g., claude-mem SessionStart that looks for Bun) emit spurious output like "bun not found" on the login shell's stdout, which without validation was taken as "path found". Now I only accept output that starts with `/` (Unix) or `C:\` (Windows)
- [FIX] **`command -v` instead of `which`** inside the login shell: more reliable POSIX builtin, returns ONLY the absolute path on stdout, no noise. `2>/dev/null` to silence STDERR of any previous hooks, `|| echo ""` to force exit code 0
- [TEST] Empirical verification on 7 tools: `bun` now found in `~/.bun/bin/bun`, `deno`/`python3`/`gh`/`jq` found in their respective paths, `wrangler`/`nonexistent` correctly `✗`. No more false positives or false negatives
- [SECURITY] Always `execFile` with args array (no shell interpolation). The tool name is passed as `$1` to the login shell, then referenced via `"$1"` quoted — no injection possible

## v1.0.88 — 2026-05-26 — Hook dep detector fix: whitelist instead of permissive heuristic (no more false positives)

Immediate user feedback on the v1.0.87 release: the detector showed badges "Missing: break, do, done, exit, found, hook, not, plugin, scripts, while, observation, claude-code, session-start, …" — absurd. The permissive tokenizer confused **shell keywords** (`break`/`do`/`done`/`while`/`not`), **command arguments** (`claude-code`/`session-start`/`hook`/`scripts`) and random names with "installable tools".

- [FIX BREAKING] **Detector strategy changed** from "extract every identifier that looks like a tool, then filter UBIQUITOUS" → "look ONLY for tools in the `KNOWN_TOOLS` whitelist (keys of `INSTALL_HINTS`)". Better one false negative (missed warning on exotic tool out of list) than 15 false positives (the v1.0.87 version was unusable)
- [FIX] **Word-boundary regex** around each tool in the whitelist: `(^|[\s;&|\`(<>])tool($|[\s;&|\`)<>])` with safe escape of special characters. Avoids partial matches (`bun` ≠ `bundler`, `python3` ≠ `python3-config`)
- [FIX] **Confirmed real tests**:
  - `claude-mem` (`node bun-runner.js …`) → finds `bun` via special pattern, nothing else
  - `security-guidance` (`python3 hooks/security-warnings.py`) → finds `python3`
  - `ralph-loop` (`bash hooks/stop.sh`) → nothing (correctly)
  - `watch` (`bash hooks/scripts/check-setup.sh`) → nothing
  - `superpowers` (`hooks/run-hook.cmd session-start`) → nothing
- [REFACTOR] Helpers `getKnownTools()` + `escapeRegex()` for clarity. Special `SCRIPT_NAME_TO_TOOL` patterns (bun-runner → bun, deno-runner → deno, python-runner → python3) kept to unmask hidden dependencies in wrapper scripts
- [NOTE] To add a new tool, just add it to `INSTALL_HINTS` with its install command: it's automatically searched

## v1.0.87 — 2026-05-26 — Pack K extension: hook dependency detector (⚠ badge if CLI tool missing)

New detector that analyzes the `command` of hook events of all installed plugins, extracts the declared external CLI tools (e.g., `bun`, `deno`, `python3`, `wrangler`, …) and verifies with `which`/`where` if they are installed in the `PATH`. On hook cards a badge **"⚠ Missing: bun, deno"** appears with tooltip suggesting how to install the missing tools, before the user even opens `claude` and sees errors like "SessionStart:startup hook error · Bun not found".

Original use case (raised by the user): the `claude-mem` plugin requires [Bun](https://bun.sh) but if not installed it emits a non-blocking error at every `claude` boot. CLACOROO now flags it clearly in the hook card + in the details modal, with the exact install command.

### Backend

- [FEATURE] **`src/lib/hookDeps.js`** new module: `detectDepsInCommand(cmd)` tokenizes the shell command (split on whitespace + separators) and extracts tool candidates, filtering the UBIQUITOUS set (`sh`, `bash`, `node`, `npm`, `git`, ...). `INSTALL_HINTS` list with official install command for 19 known tools (bun, deno, python3, uv, wrangler, supabase, vercel, gcloud, aws, gh, rg, jq, fzf, cargo, go, docker, poetry, pipx, pnpm, ruby)
- [FEATURE] **Special `SCRIPT_NAME_TO_TOOL` patterns**: some hooks call `node bun-runner.js` (script that internally looks for `bun` in PATH). Dedicated regex to unmask the hidden dependency — without it, we'd see only `node` (ignored as UBIQUITOUS) and miss the real requirement
- [FEATURE] **`checkAvailability(tools)`** with memory cache: `which <tool>` on Unix, `where <tool>` on Win, via `execFile` (no shell injection — respects CLAUDE.md rule). 1 spawn per tool per session
- [FEATURE] **`collectAllDeps(hookEvents)`**: union of all deps of all handlers of a set of hook events
- [FEATURE] **`readHookEvents` extended**: each handler now includes `detectedDeps: ['bun', 'deno']`
- [FEATURE] **`readAllData` async**: at `get-data` it does the batch check of all tools required by installed hooks + returns `hookDepsAvailability: { bun: {installed:true, path:'/usr/local/bin/bun', installHint:'...'}, deno: {installed:false, ...} }`

### Frontend

- [FEATURE] **`missingDepsForHook(item)`** helper: cross-check between `item.handlers[].detectedDeps` and `state.rawData.hookDepsAvailability`. Returns unique array of missing tools for that card
- [FEATURE] **"⚠ Missing: bun" badge** on hook cards (`.hook-missing-deps-badge`): warning orange color (palette `#fbbf24`), tooltip with multi-line install hint for each missing tool + explanatory note "Install missing tools to avoid `hook startup` errors at `claude` boot"
- [FEATURE] **Hook details modal**: new "CLI Dependencies" row for each handler, with green pill `✓ tool` for installed tools (path = info in tooltip) or orange pill `⚠ tool` for missing ones (tooltip = install command)
- [FEATURE] **"Hooks with missing deps" Dashboard KPI** conditional: appears only if `> 0` (to not be noisy when everything is ok). Clickable → navigates to Hooks section for drill-down. Warning color `#f59e0b`
- [STYLE] New classes `.hook-missing-deps-row`/-badge`, `.hook-handler-deps`/-label`, `.hook-dep-pill.dep-ok`/-miss`

### Non-goals

- ❌ We don't install tools on behalf of the user (would be too invasive and platform-specific)
- ❌ We don't actually parse the shell (would be overkill): regex heuristic sufficient for 95% of real hook commands in Claude Code plugins
- ❌ We don't log ubiquitous tools (`sh`, `node`, `git`, ...): would clutter cards; if truly not installed the hook will fail anyway with explicit error at boot

## v1.0.86 — 2026-05-26 — Pack G v2 fix: HTTP/stdio reconnect button leads to `/mcp` menu of Claude Code + keychain finding

Response to user feedback on Pack G v2 v1.0.85: the "Open claude (OAuth interactive)" button left the user in front of an empty `claude` session without instructions — the OAuth flow in Claude Code triggers ONLY when an MCP tool is called, not at boot. No visible OAuth, useless experience.

- [FIX] **HTTP-OAuth + stdio-wrapper reconnect button** now pre-types the `/mcp` slash command 4 seconds after `claude` boot (time for the banner + hooks + context loading to finish). The user is taken directly to the official MCP menu of Claude Code from where they can auth/reconnect on the specific server. NO automatic Enter: the line stays typed, the user chooses whether to send (can also write more). Pattern identical to skill pre-typing in v1.0.77
- [FEATURE] Informative toast "Opening `claude` and taking you to the `/mcp` menu" appears on click, so the user knows what to expect during the 4s loading
- [LABEL] Buttons renamed from "↗ Open claude (OAuth interactive)" to **"↗ Open /mcp in claude"** + description updated to reflect the new behavior
- [STRUCT] Action schema extended with optional `preDigit` field: the `runMcpReconnectAction` dispatcher sends it via `pty.write(tab.ptyId, preDigit)` after `setTimeout(4000)`. Cross-platform (goes through `node-pty`, already used throughout Pack B)

**Keychain finding (for the Pack G v2.2 TASK)**: with explicit user authorization, verified that Claude Code uses **a single keychain entry** called `"Claude Code-credentials"` (account = system username) containing the whole blob of OAuth credentials (main + probably MCP tokens all together). **There are no separate entries for Drive vs Gmail vs Cloudflare** to delete surgically. Modifying the blob would mean risking invalidating also the main Claude OAuth → "true clear auth for single MCP" not feasible via keychain. Confirmed strategy: act only on the local cache + delegate reconnect to the `/mcp` menu of Claude Code. **The original note remains valid**: for Anthropic API keys we can write to the keychain because CLACOROO owns its dedicated entry (`clacoroo-api-key`), we don't modify entries of other programs

## v1.0.85 — 2026-05-26 — Pack G v2: MCP reconnect from CLACOROO (3 contextual actions per MCP type)

Response to user request: "add task to reconnect MCPs from inside CLACOROO". Discovery completed, MVP implementation of the 3 contextual actions for each `Needs Auth` server. CLACOROO now distinguishes 3 MCP patterns and offers the most suitable action for each, always with a universal "↗ Open in terminal" fallback. **No direct token manipulation** (respecting the "CLACOROO never writes to Claude Code's keychain" constraint) — only acting on the local cache `mcp-needs-auth-cache.json`.

### Discovery (findings)

- **3 MCP types observed** on the real installation:
  1. `claude.ai global` (Drive/Gmail/Calendar) — server-side OAuth, token in claude.ai cloud. Re-authorize from the site
  2. `plugin HTTP/SSE` (Cloudflare/Supabase/Replicate) — client-side OAuth, callback on local port. Triggered during interactive `claude` session
  3. `plugin stdio` (neon via mcp-remote, context7 via npx, claude-mem via sh) — local processes. If they require auth, it's the wrapper that does it (e.g., `mcp-remote` opens OAuth towards remote server)
- **Real tokens off-limits** for CLACOROO: they live in the macOS keychain (`security` CLI in system mode, not scriptable without deep permissions) or server-side claude.ai. Manipulating = risk + policy violation
- **Local cache** `~/.claude/mcp-needs-auth-cache.json` contains ONLY "needs auth" entries with timestamp + id (for claude.ai). It's safe to remove entries: at the next `claude mcp list` Claude Code redoes health-check
- **`claude mcp` CLI** doesn't expose `reconnect`/`auth`. The OAuth flow is triggered automatically in interactive sessions. CLACOROO strategy: **facilitate access to the flow** (open terminal, pre-type command, claude.ai link), not replace it

### Backend (`src/lib/mcp.js` + `src/main.js`)

- [FEATURE] **`detectReconnectType(srv)`**: returns `{ type, typeLabel, description, actions }` for each server, with the 3 types mapped above. Actions have structured `kind`: `open-url` (opens browser), `open-terminal` (integrated drawer + command), `clear-cache` (removes entry from `mcp-needs-auth-cache.json`)
- [FEATURE] **`clearAuthCacheEntry(serverId)`**: removes the entry from the cache (safe operation, doesn't touch real tokens). Automatically invalidates renderer MCP cache for in-place refresh
- [FEATURE] **IPC `mcp:clear-auth-cache`** + preload bridge `mcpClearAuthCache(serverId)`
- [FEATURE] **`get-mcp` enriched**: each server returned now includes the `reconnect` field with automatic type detection

### Frontend (`src/renderer/app.js` + `style.css`)

- [FEATURE] **"Reconnect:" badge under status** on non-connected MCP cards: differentiated color per type (`mcp-rc-type-claude-ai-oauth` blue, `http-oauth` purple, `stdio-wrapper` green). Tooltip = long description of the mechanism
- [FEATURE] **MCP card footer** redesigned for `status !== 'connected'`: list of action buttons (1-2 per server) + contextual description. Buttons `btn-primary` (open URL / open terminal) + `btn-ghost` (clear cache)
- [FEATURE] **`runMcpReconnectAction(srv, act)`** dispatcher: routing on `kind` with toast feedback + automatic re-render for `clear-cache`
- [FEATURE] **`open-terminal` action**: reuses existing `openTerminalWithCommand('claude')` (Pack B v1.0.69) — opens CLACOROO's integrated drawer, new tab, launches `claude` interactive. The user sees the OAuth prompt and completes in the official TUI
- [STYLE] New classes `.mcp-card-reconnect-type` / `.mcp-rc-label` / `.mcp-rc-type` / `.mcp-card-actions` with dedicated palette for the 3 reconnect types

### Non-goals (intentional, NOT to do)

- ❌ **We don't write to Claude Code keychain**: would violate the CLAUDE.md constraint. To delete real tokens the user must use native tools (Keychain Access / `wrangler logout` / etc.) — CLACOROO can only open the flow
- ❌ **We don't intercept OAuth callbacks with a local HTTP server**: would be man-in-the-middle of the Claude Code flow, fragile and out of scope
- ❌ **We don't spawn `claude mcp auth`** (doesn't exist): we launch `claude` interactive in the integrated terminal — Claude Code prompts the OAuth at the first MCP tool call

### Pack G v2 backlog (stays in TASK.md for v1.0.86+)

- Disable/Enable single server without disabling the entire plugin
- View tools (MCP JSON-RPC mini-client `tools/list`)
- Remove user-added server (`claude mcp remove <name>`)
- Add MCP from CLACOROO (form modal → `claude mcp add`)

## v1.0.84 — 2026-05-25 — Sidebar icons: full refactor to Lucide (MIT, self-hosted inline)

Replaced all 10 sidebar icons with the [Lucide](https://lucide.dev/) set (MIT). The old ones were a heterogeneous mix of Heroicons v1 solid (20×20 fill), with two problematic cases reported by the user: MCP looked like "a pair of underwear" (it was a sandwich of arcs), Hooks was an abstract mosaic not recognizable as a hook.

- [STYLE] **All 10 icons replaced** with Lucide stroke style, uniform 24×24 viewBox: `layout-dashboard` (Dashboard), `store` (Marketplace), `puzzle` (Plugin), `sparkles` (Skill), `bot` (Agent), `plug-2` (MCP — 2 vertical pins + body with cable, now recognizable as a plug), `anchor` (Hooks — eye + shaft + U curve, recognizable as hook/anchor), `bar-chart-3` (Stats), `sliders-horizontal` (Config), `settings` (Settings gear)
- [REFACTOR] **Centralized CSS**: `stroke: currentColor`, `stroke-width: 2`, `stroke-linecap: round`, `stroke-linejoin: round`, `fill: none` attributes moved to `.nav-icon` instead of repeated on each `<svg>`. Lucide icons in HTML have only `viewBox` + path
- [STYLE] `.nav-icon` width/height **from 16px to 18px** — Lucide at 24×24 with stroke 2 appear "lighter" than solid Heroicons; +2px brings the visual weight back to the same level
- [SECURITY] No external runtime library, no import. SVGs are inline in HTML (CSP `default-src 'self'` preserved). Bundle unchanged (~10 inline SVG paths add ~3KB gross). Lucide is MIT license compatible with AGPL-3.0
- [NOTE] Self-hosted Lucide set means: no Font Awesome or icon-font CDN, no runtime attribution, freedom to pick individual icons without importing the whole pack
- [FIX] **README logo readable on GitHub dark mode**: the wordmark `CLA` and `ROO` was in `#141413` (Claude black), invisible on github.com's dark theme. Added variant `assets/logo-readme-dark.png` (cream glyph `#faf9f5` + light gray tagline `#a8a299`) rendered from `assets/logo-readme-dark.svg`. README.md and README.it.md now use `<picture>` with `<source media="(prefers-color-scheme: dark)">` to serve the right variant automatically. Both PNGs regenerated at 1080×612 (high resolution for retina displays)
- [DOCS] **README updated with Hooks section**: added "⚓ Hooks (v1.0.83+)" block right after MCP Server in README.md and README.it.md, with description of the dedicated browser feature (event badges, search, filters, sort, details modal, Dashboard KPI). KPI installation count updated from 9 to 10 (includes "hooks · N plugins")

## v1.0.83 — 2026-05-25 — Hooks section (Pack K MVP): dedicated browser for plugin hooks

Added the new **Hooks** section in the sidebar (between MCP and Stats). Aggregates in a single browser all hook events of all installed plugins (`hooks/hooks.json`) with cards for each event+matcher combination, colored badge per event type, search, filter by event and scope, configurable sorting, details modal with JSON copy. Before, these hooks were only visible inside the "Plugin content" modal — now they exist as an autonomous surface to explore them globally and understand what triggers on which event.

- [FEATURE] **Sidebar "Hooks" entry** with dedicated icon, between MCP and Stats. `data-section="hooks"` switchable with click or via Cmd+K spotlight. Updated `sectionTitles`, `render()` dispatcher, Cmd+K section list
- [FEATURE] **`renderHooks()`** (`src/renderer/app.js`): generates flat list `{event, matcher, handlers, pluginId, mkt, scope, fullId, sourcePath}` aggregating from `state.plugins.hookEvents` (both global and local). Responsive card with:
  - **Header**: colored event badge (`HOOK_EVENT_COLORS` palette for the 10 standard Claude Code events + gray fallback) + plugin name + marketplace color dot + scope badge (global/local)
  - **Matcher row** (optional): "matcher" label + regex/string in monospace accent2 `<code>`
  - **Handlers preview**: max 2 lines with `type`, `shell`, `async`, `timeout` badges + command truncated to 140 char (tooltip = full). "+ N more" if more
  - **Footer**: "⌕ Details" + "📁 Open hooks.json" buttons (opens the file with default app via `shell.openPath`)
- [FEATURE] **Search + filters**: full-text search input (searches on event/matcher/pluginId/command), event filter chip (multi-type with the palette colors), scope filter chip (All / Globals / Locals). Filters combinable in AND
- [FEATURE] **Sort dropdown**: 4 modes (`event-asc`/`event-desc`/`plugin-asc`/`plugin-desc`) with persistence `state.hookSort` in `state.json`. `HOOK_SORTERS` helper + `SORT_OPTIONS.hook` consistent with the Pack L pattern
- [FEATURE] **Hook details modal** (`showHookDetailsModal`): shows matcher + scope + full handlers list with scrollable `<pre>` for each command (useful for claude-mem where commands are complex multi-line shells). "⎘ Copy" button in header that copies the complete hook config JSON (event + matcher + hooks array) — ready to paste into a `hooks.json` to reuse it
- [FEATURE] **"Hooks" Dashboard KPI**: clickable card with `num: hookList.length` + sublabel "Hooks · N plugins" (cardinality of plugins providing hooks). Click → navigates to Hooks section. Purple color `#a78bfa` (PreToolUse palette)
- [BACKEND] **`readHookEvents(hooksDir)` extended** (`src/main.js`): now also returns `matchers: [{matcher, handlers: [{type, command, async, timeout, shell}]}]` + `sourcePath` (absolute path of the `hooks.json` file). Legacy fields `matcherCount` + `handlerCount` remain for compat with the existing "Plugin content" modal (v1.0.56)
- [STYLE] New classes `.hook-grid`, `.hook-card`, `.hook-event-badge`, `.hook-matcher-row`, `.hook-handler-row`, `.hook-handler-type/-shell/-async/-timeout`, `.hook-handler-cmd/-more`, `.hook-filter-row/-group/-label/-chip`, `.hook-modal/-modal-plugin/-modal-body`, `.hook-detail-row/-label/-value/-title`, `.hook-handler-block/-meta/-pre`. Visual consistency with existing `.skill-grid` + `.scope-badge`
- [PERSISTENCE] `state.hookSort` restored in `init()` with default `event-asc`. `state.filters.hooks = {search, event, scope}` to maintain search/filter state across re-renders
- [NOTE] Pack K v1.0.83 implements the MVP of the roadmap (sidebar + list + filters + KPI). Optional extensions (slow-hook indicator, estimated trigger counts, overlap warning between plugins) remain in backlog for v1.0.84+

## v1.0.82 — 2026-05-25 — Universal sorting (Pack L): sort dropdown in Plugin / Skill / Agent / MCP

Replicated in all card sections the sort pattern already present in Marketplace since v1.0.55, for UX consistency. Whoever learns the "Sort:" dropdown in one section finds it everywhere, with preference persisted per section.

- [FEATURE] **Plugin section**: new "Sort:" dropdown in countRow with 4 modes — `name-asc` (A→Z default), `name-desc` (Z→A), `installed-desc` (recently added), `installed-asc` (less recently). `state.pluginSort` persisted in `state.json`
- [FEATURE] **Skill section**: sort dropdown with 2 modes — alphabetical A→Z / Z→A. `state.skillSort` persisted
- [FEATURE] **Agent section**: identical to Skill — `state.agentSort` persisted
- [FEATURE] **MCP section**: sort dropdown with 3 modes — alphabetical A→Z / Z→A + status (`connected` first → `needs-auth` → `disconnected` → rest). `state.mcpSort` persisted
- [FEATURE] **Backend `scanCache`** (`src/main.js`): added `installedAt` field (ISO date from `fs.statSync(pluginPath).birthtime`) to each plugin, to support "Recently added" sort on the renderer side without new FS reads
- [REFACTOR] `src/renderer/app.js`: new shared helpers `PLUGIN_SORTERS`, `NAME_SORTERS`, `MCP_SORTERS`, `MCP_STATUS_ORDER`, `SORT_OPTIONS` (Italian labels for each mode) + `renderSortDropdown(currentSort, options, onChange)` that generates the standard `<select>` with the same aesthetics as `mkt-sort-*`. Reduces boilerplate between sections
- [REFACTOR] `renderListSection(items, ...)` accepts new optional `sortConfig` parameter (current + options + onChange) rendered in the header — used by `renderSkills`/`renderAgents`
- [FIX] `applyPluginFilters` indexing: after sort, `state.plugins[i]` no longer corresponded to the order of cards in the grid. Fixed by storing the sorted array in `state._renderedPlugins` and reading it as source of truth in `applyPluginFilters`
- [STYLE] `src/renderer/style.css`: new classes `.sort-dropdown-wrap`, `.sort-dropdown-label`, `.sort-dropdown` (cloned from `.mkt-sort-*` with generic scope). Same height/padding/colors as Marketplace dropdown for visual consistency across the 5 sections
- [PERSISTENCE] `init()` restores `pluginSort/skillSort/agentSort/mcpSort` from `state.json` as it already does with `mktSort` (default for each: `name-asc`)
- [BACKLOG CLOSED] Pack F · "remove per-row ⎘ + global copy in modal" marked as done (was implemented in v1.0.81)

## v1.0.81 — 2026-05-25 — Skill/Agent modal: global copy in header (removed per-row ⎘)

Refactor of the copy button introduced in v1.0.78: the `⎘` on skill/agent cards copied only the chip name itself, already visible at a glance → very low value. Replaced with a single copy button in the top right of the markdown viewer modal (next to the close X, with 16px margin) that copies the **entire content** of the open document.

- [REMOVED] `appendRunButton(chip, item, kind)` + related CSS `.skill-chip-icon-btn`/`.skill-chip-copy` (was the per-row ⎘ button on skill/agent cards)
- [REMOVED] ⎘ button from `renderSkills()` + `renderAgents()` calls (1 line removed for each)
- [FEATURE] **"⎘ Copy" button** in the markdown viewer modal header (`showMarkdownModal`): positioned between title and ×, with `margin-right: 16px` safety gap from the close button. Copies `content` raw (full markdown) via `navigator.clipboard.writeText()` + green confirmation toast "Text copied to clipboard"
- [FEATURE] CSS `.md-copy`: style consistent with design system (surface background + border, hover accent2 blue)
- [IMPROVEMENT] Unblocked use case: sharing entire skills/agents as reference or base for custom instructions. Previously required manually selecting all the modal text

## v1.0.80 — 2026-05-25 — App icon: transparent corners (no longer white)

Solved app icon visual issue: the corners of the 256×256 bounding box (outside the black squircle) were filled with white instead of transparency. Visible in macOS Dock when the app is open + in DMG installer + in Finder thumbnails.

- [FIX] `assets/icon-source.svg` → `build/icon.iconset/*.png` regenerated with `rsvg-convert -b "none"` (explicit transparent background). Previous tool had applied default white fill
- [FIX] `assets/icon.icns` regenerated from correct iconset via `iconutil -c icns`. Includes 10 standard sizes (16, 32, 128, 256, 512 + @2x each), all with alpha=0 corners
- [FIX] `assets/icon.png` (1024×1024, used for Win/Linux build target) regenerated with transparency
- [FIX] `assets/icon-app-256.png` + `assets/logo-readme.png` (README hero) regenerated with transparency
- [IMPROVEMENT] Result: in macOS Dock the icon appears with clean black squircle without white halo when the app is open. In the DMG installer the drag-and-drop icon has transparent corners consistent with the CLACOROO mascot

## v1.0.79 — 2026-05-25 — Zero-touch install: automatic ad-hoc signing + hardened runtime off

Resolved the **"CLACOROO is damaged and can't be opened"** dialog that blocked users downloading the `.dmg` from the public release. Cause: hardened runtime active + no signing → macOS Sequoia marks it as "corrupt" (see previous builds without signing). From v1.0.79 onwards the user only sees the standard Gatekeeper prompt **"Open downloaded app?"** → click "Open" → app works. Zero `sudo` commands, zero manual `codesign`.

- [FEATURE] `build/after-pack.js`: electron-builder hook that applies **ad-hoc signing** (`codesign --force --deep --sign -`) to the freshly packaged `.app` (for each arm64+x64 arch). Satisfies the Gatekeeper signing requirement without needing an Apple Developer ID certificate
- [FIX] `package.json` `"hardenedRuntime": true` → `false`: hardened runtime without "real" notarized signing is the reason macOS declares "damaged". Disabling it allows ad-hoc signing to be accepted as valid signing
- [REFACTOR] Removed `entitlements` + `entitlementsInherit` fields from `package.json` (irrelevant without hardened runtime)
- [DOCS] README.md/README.it.md: updated "macOS Gatekeeper" section — the `sudo xattr` + `sudo codesign` workaround is no longer needed. Optionally just `xattr -cr ~/Downloads/CLACOROO-*.dmg` if the browser added quarantine to the container

## v1.0.78 — 2026-05-25 — Skill/Agent launcher: only ⎘ copy (removed ▶)

Third iteration of the launcher (after v1.0.75 with `claude -p` and v1.0.77 with `claude` interactive + pre-typing). The ▶ has been removed for good: for skills/agents with **global** scope the tab started from HOME, so claude launched without project context — useless. Adding a project picker would have complicated the flow without real advantage over copy. The user opens their own terminal in the right project, launches claude and pastes `/<skill-name>`: CLACOROO eliminates only the friction of "what was the exact name?", without making assumptions about the work context.

- [REMOVED] ▶ button "Open claude in terminal" + helper `openTerminalForSkillOrAgent(item, kind, cmdText)` from v1.0.77
- [IMPROVEMENT] Brighter ⎘ icon: `color` goes from `--text-muted` to `--text` + light warm `rgba(255,246,232,.06)` fill by default + `font-size` 13px (was 11). At rest you clearly see it's interactive, doesn't look disabled
- [REFACTOR] `appendRunButton(chip, item, kind)` now generates a single `<button>` instead of two. The precondition `if (!termState.caps.available) return` has been removed: the copy doesn't depend on pty, it always works via `navigator.clipboard.writeText()`
- [KEPT] Shell selector + `preferredShell` in Settings (remain useful for manual tabs of the terminal drawer)

## v1.0.77 — 2026-05-25 — Skill/Agent launcher: redesign (⎘ copy + ▶ claude interactive + pre-typing)

The v1.0.75 flow with `claude -p "<name>"` was wrong for three reasons: (1) `-p` is one-shot and closes the session after a response, (2) sending only the name as a prompt does NOT invoke the skill — claude reads it as free text, (3) skills in Claude Code activate with `/<name>` inside an **interactive** session, not as CLI argument. Replaced with two buttons per chip:

- [FEATURE] **⎘ "Copy command" button** on each skill/agent card: copies `/<skill-name>` (skill) or `<agent-name>` (agent) to the clipboard via `navigator.clipboard.writeText()`. Allows pasting the command into any external terminal, IDE, or claude session already open in another tab. Green confirmation toast with the copied text
- [FEATURE] **▶ "Open claude in terminal" button** (redesigned): opens drawer + new tab + launches `claude` (interactive, no `-p`) + after 3.5s pre-types `/<skill-name>` or `<agent-name>` WITHOUT pressing Enter. The user sees claude ready with the command already written and decides whether to send or add context. For skills/agents with local scope, the tab starts from `cwd = projectPath` (claude reads the correct project); for global scopes from HOME
- [FEATURE] Helper `openTerminalForSkillOrAgent(item, kind, cmdText)` with calibrated timing: 350ms (shell ready to receive `claude`) + 3500ms (claude has loaded context/skills/prompt). On slower machines the text will arrive during claude loading (no harm done — user can delete and retype)
- [REFACTOR] Helper `appendRunButton(chip, item, kind)` rewritten to generate two `<button>` instead of one. Same pattern in `renderSkills` (chip = `/` + skill) and `renderAgents` (chip = agent name, no `/` because in claude code agents are mentioned by direct name, not slash)
- [REFACTOR] CSS: new base class `.skill-chip-icon-btn` (22×22, hover scale 1.08, 150ms transition) shared between copy/play. Variants `.skill-chip-copy` (hover accent2 blue `#6a9bcc`) and `.skill-chip-run` (hover Anthropic green `#22c55e`)
- [REMOVED] Old v1.0.75 button `claude -p "<name>"` + helper `appendRunButton` single-button version

## v1.0.76 — 2026-05-25 — Donation channels live (GitHub Sponsors + BMAC + PayPal) + sidebar support buttons

Pack I (Sponsorship & Donations) activated: all 3 donation channels are now live and integrated everywhere.

- [FEATURE] **Sidebar footer "Support CLACOROO"** always visible on every page of the app (under the version/update status row): 3 mini-buttons 💖 (GitHub Sponsors) · ☕ (Buy Me a Coffee) · 💳 (PayPal). Click → `shell.openExternal` opens the channel in the system browser. Hover with brand colors of the channel (GitHub pink, BMAC yellow, PayPal blue). Dashed border-top for visual separation from the status row
- [FEATURE] `.github/FUNDING.yml` with the 3 active channels: `github: [Maxymize]` + `buy_me_a_coffee: maxymize` + `custom: ["https://paypal.me/maxymizebusiness"]` → activates the native "❤ Sponsor" button in the GitHub repo sidebar with a 3-option dropdown
- [FEATURE] **README.md + README.it.md header**: new row "💛 Support the project / Supporta il progetto" with 3 side-by-side badges (native colors GitHub/BMAC/PayPal) right under the technical badges (Electron, License, Version)
- [FEATURE] **Dedicated "Support the project / Supporta il progetto" section** in the two READMEs extended with 3 large side-by-side "for-the-badge" badges + "Which channel should you choose?" table explaining when to prefer GitHub Sponsors (recurring dev, GitHub matching 12 months) vs BMAC (creator/micro-donations) vs PayPal (traditional users/IT)
- [REFACTOR] `src/renderer/app.js`: new function `attachSupportButtons()` called in `init()` after `setupNav()`. Channel URLs read from `data-url` attribute in HTML (no hardcode in JS)
- [REFACTOR] `src/renderer/index.html`: new `<div class="sidebar-support">` block inside `.sidebar-footer` with 3 accessible `<button>` elements (title + aria-label for each channel)
- [REFACTOR] `src/renderer/style.css`: new classes `.sidebar-support`, `.sidebar-support-label`, `.sidebar-support-btn` with hover variants per channel (`.ssb-github`, `.ssb-bmac`, `.ssb-paypal`)
- [DOCS] Strategy document `docs/strategia-lancio/doc-tecnico_strategia-lancio-clacoroo.html` already includes the "Complementary monetization Pack" section describing the multi-channel donation strategy (v1.0.65)
- [SECURITY] No CSP changes: the 3 buttons use `data-url` read via `dataset.url` and passed to `window.claudeAPI.openExternal()` (existing IPC). No innerHTML, no eval, no CDN

## v1.0.75 — 2026-05-25 — Skill/Agent launcher ▶ + shell selector

- [FIX] **Version: single source of truth** in Settings. Before, the number was hardcoded as literal string (`'1.0.74'`) and the sidebar footer read `app.getVersion()` from package.json: forgetting to update the literal caused mismatches (e.g., footer "v1.0.72", Settings "v1.0.75"). Now both read `d.appVersion` (returned by `get-data` IPC, source `app.getVersion()` → `package.json`)
- [FEATURE] **▶ "Run in terminal" button** on each Skill and Agent card (Skill Section / Agent Section): one click opens the terminal drawer, creates a new tab and launches `claude -p "<skill-name>"` (skill) or `claude -p "Use the <agent-name> agent"` (agent). For skills/agents with local scope, the tab starts directly from the `cwd` of the tracked project; for global scopes it starts from HOME
- [FEATURE] **Shell selector** in Settings → new "Terminal" group with "Default shell" dropdown: system default (`$SHELL`/`pwsh`/`cmd` per platform) + all shells detected by `pty.listShells()`. On Unix: $SHELL, zsh, bash, fish (Homebrew + system path), sh. On Win: PowerShell 7 (pwsh), Windows PowerShell, cmd. On Linux: like Unix
- [FEATURE] `preferredShell` persistence in `state.json`: the choice survives app restarts. Applied to ALL new terminal tabs (drawer "+" or skill/agent ▶ button or `Cmd+\``). Already-open tabs continue to use the shell they were born with
- [FEATURE] `src/lib/pty.js`: new `listShells()` function that enumerates system candidate shells with `fs.existsSync` + returns them as `[{path,label,kind}]` ordered by platform relevance
- [FEATURE] IPC `pty:capabilities` extended: now includes `availableShells: [...]` and `preferredShell` (read respectively from `PTY.listShells()` and `readState().preferredShell`) — loaded only once at app startup, no extra roundtrip
- [FEATURE] CSS `.skill-chip-run` 22×22 round button with hover Anthropic green `#22c55e` scale 1.08, next to the scope badge — `stopPropagation` prevents also opening the markdown preview when clicking the chip
- [SECURITY] The command passed to the terminal (`claude -p "<name>"`) uses double quotes. The skill/agent name is already validated by the upstream marketplace regex (no spaces, no shell metachar) so no injection. See `CLAUDE.md` SECURITY section
- [REFACTOR] `termCreateTab(opts)` now applies `termState.preferredShell` as fallback if `opts.shell` is not specified — pattern identical to `openTerminalWithCommand()` which already propagated `opts.shell || null`

## v1.0.74 — 2026-05-25 — Anthropic disclaimer + MAXYMIZE brand cleanup

- [DOCS] **Anthropic disclaimer** added at the top of README.md (English) and README.it.md (Italian): CLACOROO is an independent third-party tool, NOT affiliated/sponsored/approved by Anthropic, PBC. Developed autonomously by MAXYMIZE to facilitate the use of the official Claude Code CLI
- [FEATURE] Disclaimer box at the bottom of the app's Settings section (under Info and License): same message + yellow/amber warning-style CSS with accent border-left
- [REFACTOR] Brand name simplified throughout the code: `MAXYMIZE BUSINESS (Maximilian Giurastante)` → `MAXYMIZE` in all files (README, CLAUDE.md, TASK.md, package.json copyright + NSHumanReadableCopyright, SPDX headers of all sources, doc-tecnico_handoff.html, About panel macOS). Contact email `info@maxymizebusiness.com` unchanged
- [DOCS] README hero logo updated: now includes the official app icon (icon_256x256.png with black squircle + mascot) above the CLACOROO pixel-art wordmark, consistent with DMG installer look
- [DOCS] `assets/icon-app-256.png` added + `assets/logo-readme.svg` updated with `<image>` reference to the icon

## v1.0.73 — 2026-05-25 — README + about panel polish

- [FEATURE] **English README.md** (default GitHub) entirely rewritten with all features v1.0.01-v1.0.72 organized by area (Dashboard/Marketplaces/Plugins/Skills/Agents/MCP/Stats/Config/Account+API key/Terminal/Auto-update/UX), sections Security, Brand, Architecture, License AGPL-3.0
- [FEATURE] **README.it.md** complete Italian with same layout + bidirectional cross-link from the heading of both
- [FEATURE] `assets/logo-readme.svg` + PNG: hero logo for README with pixel-art mascot top + CLACOROO BOLD 7×7 wordmark (CO orange) + tagline, consistent with DMG installer
- [FIX] Corrected CLACOROO acronym in CLAUDE.md + README: "CLAude COde Cont**RO**l ROom" → "CLA**ude** CO**de** CO**ntrol** ROO**m**" (4 syllables, not 3)
- [IMPROVEMENT] macOS About panel: removed sentence "The name is the fusion of CLAude-code + COntrol + ROom..." from the credits section (irrelevant info for users)

## v1.0.72 — 2026-05-25 — Custom CLACOROO DMG installer + Press Start 2P sidebar

- [FEATURE] **DMG installer completely redesigned** 720×460 HyperWhisper style: wide window, CLACOROO mascot as signature at the top, "CLACOROO" wordmark BOLD in pixel-art 8-bit (CO brand highlight orange), tagline "Claude Code Control Room", CTA "Drag CLACOROO to the Applications folder →", long CLACOROO orange `#d97757` arrow between the 2 large icons (iconSize 128)
- [FEATURE] Vector SVG background with CLACOROO palette: warm cream gradient + soft glow on the 3 corners (TR orange, BL Anthropic green, TL blue), Claude-style topographic lines, dot grid pattern + scattered decorative pixels
- [FEATURE] **Pixel-art bold 7×7 wordmark** drawn in SVG `<rect>` (C/L/A/O/R glyphs defined as reused `<symbol>`): visually consistent with the pixel-art mascot, typographic bold weight, embed-free (no external font required by librsvg)
- [FEATURE] **Press Start 2P** font (SIL OFL) self-hosted in `src/renderer/fonts/PressStart2P-Regular.ttf` + applied to the app's sidebar wordmark (size 11px) for brand consistency with the DMG logo
- [FEATURE] `build/dmgbuild-settings.py`: complete Python-based configuration for dmgbuild (window 720×520, iconSize 128, icon positions, no toolbar/status/sidebar)
- [FIX] **Bypass of known electron-builder + macOS Sequoia bug** (.DS_Store not written correctly, DMG background ignored): new flow based on `dmgbuild` (Python + `ds_store` lib) that builds the `.DS_Store` deterministically, no AppleScript, no Finder dependency. See electron-builder issue #4170 and #9072
- [FIX] DMG volume renamed from "CLACOROO X.Y.Z" to "Install CLACOROO" to avoid Finder Sequoia window size cache (remembered smaller window size)
- [CHORE] macOS build-time deps: `librsvg` via Homebrew (for `rsvg-convert` SVG→PNG), `dmgbuild` 1.6+ via pip (`pip install dmgbuild`)
- [CHORE] Python build-time workaround: venv 3.12 with `setuptools` (Python 3.14 removed `distutils`, node-gyp doesn't build `node-pty` from source without it)
- [REFACTOR] Full build command: `PYTHON=/tmp/clacoroo-build-venv/bin/python3 npm_config_python=... npx electron-builder --mac dir` (only .app, no internal .dmg) + `dmgbuild -s build/dmgbuild-settings.py -D app=<path> "Install CLACOROO" dist/CLACOROO-X.Y.Z-{arch}.dmg` for each arch

## v1.0.71 — 2026-05-23 — Cleanup Console API duplicate + inline API key buttons

- [REMOVED] "↗ Console API" button from Settings account-actions (duplicate of "↗ Anthropic Console" in the API key panel)
- [IMPROVEMENT] "↗ Anthropic Console" button moved into the same row as Test+Save in the API key form (in the active key branch it sits next to the other action buttons), instead of being on a separate row
- [REFACTOR] Extracted helper `makeConsoleBtn()` reused both in the form (key not configured) and in the actions view (active key)
- [REMOVED] CSS `.apikey-console-link` (ad-hoc margin no longer necessary with unified flex layout)

## v1.0.70 — 2026-05-23 — Claude API key: input + encrypted cross-platform storage

- [FEATURE] New "Claude API key" panel in Settings: input + test + secure save + removal, no more shell editing
- [FEATURE] Cross-platform encrypted storage: macOS Keychain via `security`, Linux libsecret via `secret-tool` (file 600 fallback), Windows DPAPI via PowerShell
- [FEATURE] Official `apiKeyHelper` integration of Claude Code: generates helper script in `~/.claude-control-room/scripts/get-api-key.{sh,cmd}` with chmod 700 and writes the path to `~/.claude/settings.json`
- [FEATURE] "Test connection" button: validates the key via `GET https://api.anthropic.com/v1/models` (200 = OK with model count, 401 = invalid, 403 = no permissions)
- [FEATURE] "Test connection" also on already-saved key via `testStored` (decryption on main side, key never exposed to renderer)
- [FEATURE] Replace + Remove buttons (with confirmation + full cleanup: keychain entry + script + settings.json)
- [FEATURE] UI warning when storage is not encrypted (Linux without libsecret-tools): suggests `sudo apt install libsecret-tools`
- [REMOVED] Old `.zshrc` guide `showApiKeyGuideModal()`: replaced by the standalone panel (eliminated ~80 lines + associated CSS)
- [SECURITY] Key never logged, never shown in cleartext in the renderer (masked display `sk-ant-…xxxx` with last 4 chars), never transmitted over the network by CLACOROO (only `api.anthropic.com` for test)
- [SECURITY] Helper script chmod 700 (read/exec only owner user), Keychain service separate from Claude Code (`com.maxymize.clacoroo.apikey` vs `Claude Code-credentials`)
- [SECURITY] Strict validation regex `/^sk-ant-[A-Za-z0-9_-]{10,}$/` before touching Keychain/DPAPI (anti shell-injection in PowerShell branch)
- [FEATURE] IPC `apikey:reconfigure`: regenerates helper script + writes `apiKeyHelper` in settings.json without requiring re-entering key
- [IMPROVEMENT] Status sidecar `apikey.last4` (chmod 600): `status()` shows the last 4 digits without decrypting the key (avoids PowerShell spawn on Win + Keychain prompt on macOS at every Settings open)
- [IMPROVEMENT] `hasSecretTool()` memoized at module-load (no repeated `which secret-tool` spawns on Linux)
- [IMPROVEMENT] `CLAUDE_CONFIG_DIR` env var honored (aligned with `usage.js`/`mcp.js`): supports users who move Claude Code config out of `~/.claude`
- [FIX] Renderer: `setInline(node, ...)` parameter renamed from `el` to avoid shadowing the global `el()` helper
- [FIX] Renderer: removed dead `process?.platform` branch in Remove dialog (in contextIsolation `process` doesn't exist on the renderer side)
- [FIX] `https.request` test connection: added explicit `req.setTimeout(10000)` (not enough `opts.timeout` to guarantee hard ceiling on TLS handshake)
- [REFACTOR] `makeReplaceBtn` / `makeReconfigureBtn`: extracted helper `renderApiKeyForm(container)` + new IPC; eliminated the repaint hack with fake status

## v1.0.69 — 2026-05-23 — Account panel: Disconnected status + Login terminal button

- [FIX] Account panel: status badge stays "Connected" green even when the OAuth token has expired and refresh failed (401/403 from `/api/oauth/usage`)
- [FEATURE] Dynamic status badge: becomes "● Disconnected" red with pulse when the usage call returns 401/403
- [FEATURE] "↗ Login terminal" button appears in Account when auth is broken: opens the integrated terminal and types+runs `claude auth login`
- [FEATURE] Sidebar account pill: red border + pulsating ⚠ icon when token expired, tooltip "Claude token expired — open Settings to log in again"
- [FEATURE] Helper `openTerminalWithCommand(cmd, opts)` reusable for skill launcher (v1.0.70) and other UI-driven launches
- [REFACTOR] `loadAccountUsage(container, onResult)` accepts a callback with the result to allow the panel to update badge/buttons based on real auth status

## v1.0.68 — 2026-05-23 — Changelog viewer: synthetic format with category badges

- [FEATURE] Colored badges per category in each entry: FEATURE, FIX, IMPROVEMENT, SECURITY, REFACTOR, DOCS, CHORE
- [IMPROVEMENT] Changelog viewer redesigned: one row per item, dropped sections and prose paragraphs
- [REFACTOR] `parseChangelog` rewritten: extracts `[TYPE]` badge from bullet, correctly separates release date and title
- [REFACTOR] `src/renderer/app.js` `openChangelogModal()` simplified: flat render with badge + text, no more section headers
- [DOCS] CHANGELOG.md entirely rewritten in Conventional Commits-style format with `[FEATURE]/[FIX]/...` badges

## v1.0.67 — 2026-05-22 — Pack B foundation: Integrated terminal (drawer + multi-tab + live cwd)

- [FEATURE] Integrated terminal: fixed bottom multi-tab drawer with xterm.js + node-pty
- [FEATURE] terminalDrawer persistence in `state.json` (open/height/tabs/activeTabId, automatic restore at restart)
- [FEATURE] Status dot per tab: green idle / orange busy (pulse) / red dead
- [FEATURE] Tab label = short cwd (`~`, `~/Sviluppo`, `~/…/clacoroo`) with live 3s polling via lsof (macOS) / `/proc/<pid>/cwd` (Linux)
- [FEATURE] "▣ Terminal" button in topbar + global shortcut `Cmd+\`` open/close, `Cmd+T` new tab
- [FEATURE] Drag handle 6px resizable drawer, height range 140–800px
- [FEATURE] pty IPC: `pty:capabilities|spawn|input|resize|kill|list|cwd` + push events `pty:data` and `pty:exit`
- [FEATURE] Automatic cleanup of shell sessions on `app.before-quit` (`PTY.killAll()`)
- [SECURITY] cwd validation (must exist) / cols (2–1000) / rows (2–500) / shell before pty spawn
- [SECURITY] Spawn only via `node-pty` (array args, no shell string) → zero injection risk
- [CHORE] Added runtime deps: `node-pty` 1.1.0 (darwin+win prebuilds), `@xterm/xterm` 6.0.0, `@xterm/addon-fit`, `@xterm/addon-web-links`
- [CHORE] `scripts/fix-node-pty-perms.js` postinstall hook: chmod +x `spawn-helper` (npm tarballs don't preserve executable bit on macOS)
- [CHORE] `package.json` `asarUnpack: ['node_modules/node-pty/**/*']` for unpacked native module in production

## v1.0.66 — 2026-05-22 — Cleanup MIT residuals + personal strategy gitignore

- [DOCS] `CLAUDE.md` line 4: "Open source MIT" → "Open source AGPL-3.0-or-later, copyright © 2026 MAXYMIZE"
- [DOCS] `docs/doc-tecnico_handoff.html`: license KPI `MIT` → `AGPL-3.0+`, file-tree LICENSE comment updated
- [CHORE] `.gitignore`: added `docs/strategia-lancio/` (personal strategic material not publishable)

## v1.0.65 — 2026-05-22 — License switch from MIT to AGPL-3.0-or-later

- [REFACTOR] Project license switch from MIT to AGPL-3.0-or-later (protection against closed commercial forks)
- [FEATURE] SPDX-License-Identifier header in `src/main.js`, `src/preload.js`, `src/renderer/app.js`
- [FEATURE] About dialog: new "License" row in Settings → Info with "License text" button → gnu.org/licenses/agpl-3.0
- [DOCS] `LICENSE`: official verbatim AGPL-3.0 text (661 lines) for automatic GitHub Licensee SPDX match
- [DOCS] `README.md`: License badge `AGPL v3+`, "License" section rewritten with explanation in Italian (can/must/cannot) + dual licensing note
- [DOCS] `package.json`: `"license": "AGPL-3.0-or-later"` (modern future-proof SPDX), copyright + `NSHumanReadableCopyright` aligned to MAXYMIZE

## v1.0.64 — 2026-05-22 — Fix stale update cache after app update + Gatekeeper note

- [FIX] Footer still showed "Update available" after actually updating the app: cache `lastUpdateResult` wasn't invalidated if `cached.current !== app.getVersion()`
- [FIX] Comparison `cached.current` vs real version before returning cached cooldown — if different, forces a fresh check
- [DOCS] README: new "Unsigned build — Gatekeeper workaround" section with `xattr -cr` + `codesign --sign -` commands
- [DOCS] Documented why the workaround is needed (hardened runtime + identity:null) until Apple Developer ID + notarization is applied

## v1.0.63 — 2026-05-22 — End-to-end full soft auto-update release test

- [CHORE] Tag-only version bump to generate public release with `.dmg` arm64+x64 as asset
- [CHORE] Complete end-to-end test: detect update → click UPDATE → real `.dmg` download → install in `/Applications`

## v1.0.62 — 2026-05-22 — Sidebar footer: current version + Update indicator

- [FEATURE] Sidebar footer dynamically shows `v1.0.xx` read from `app.getVersion()` via `appVersion` in the `get-data` IPC
- [FEATURE] Update status indicator in the footer: green = up to date, orange + pulse = new release available
- [FEATURE] Inline orange "UPDATE" button next to the version number when there's an update (opens release page in browser)
- [IMPROVEMENT] Replaced plugin count with version in the footer (UX decision: version is more important info)

## v1.0.61 — 2026-05-22 — Modal flash definitively eliminated

- [FIX] Removed 4 explicit `close()` calls in click handlers that open a new modal (prevented `swapModalOverlay` from working)
- [FIX] Added class `.md-overlay-instant` to disable fade-in animation during modal → modal swap (no flash of underlying page)

## v1.0.60 — 2026-05-22 — No more flash between consecutive modals

- [FIX] New helper `swapModalOverlay(newOverlay)` that appends the new overlay BEFORE removing the old one (atomic in single browser paint)
- [REFACTOR] Swap pattern applied to all 5 modals (Plugin / Marketplace add / Marketplace content / Markdown / API key guide)
- [REFACTOR] Removed guards `if (document.querySelector('.md-overlay')) return;` now redundant

## v1.0.59 — 2026-05-22 — Cross-platform: editor URL handler on Windows/Linux

- [FIX] Windows path normalization: `toEditorUriPath()` converts `C:\Users\foo\...` to `/C:/Users/foo/...` for vscode/cursor/antigravity URL handler
- [IMPROVEMENT] Platform-aware error message: OS-specific hint (macOS: `/Applications`, Win: installer URL protocol, Linux: `xdg-mime`)
- [DOCS] Added "CROSS-PLATFORM ALWAYS-ON" rule at the top of TASK.md as development principle

## v1.0.58 — 2026-05-22 — External editor: added Antigravity

- [FEATURE] Added Antigravity (Google) as fourth option of the editor selector in Settings
- [FEATURE] URL scheme `antigravity://file/...` registered on the app side

## v1.0.57 — 2026-05-22 — Configurable external editor selector

- [FEATURE] New "External editor" group in Settings with select VS Code · Cursor · System (OS default)
- [FEATURE] Preference persisted in `state.json` as `preferredEditor`
- [IMPROVEMENT] Was hardcoded VS Code before, now user choice

## v1.0.56 — 2026-05-22 — Plugin modal: detailed hooks + open source + skip section

- [FEATURE] List of hook events in the plugin modal with matcher/handler count for each (Setup, SessionStart, UserPromptSubmit, etc.)
- [FEATURE] "📁 Open in Finder" + "📝 Open in editor" buttons also in the "Plugin content" modal
- [IMPROVEMENT] Click on skill/agent in the plugin modal opens the markdown viewer directly (one step instead of three)

## v1.0.55 — 2026-05-22 — Marketplace sorting (5 modes)

- [FEATURE] New "Sort:" selector in Marketplace section with 5 modes (default, recently added/less recently added, recently updated/less recently updated)
- [FEATURE] Sorting preference persisted in `state.json` (`mktSort`)
- [FEATURE] Reading `birthtime`/`ctime`/`mtime` of marketplace directory for "Recently added"

## v1.0.54 — 2026-05-22 — Marketplace card: count always X/Y if not all installed

- [FIX] Marketplace with 0 installed out of N available showed only "N" (ambiguous). Now a single rule: all installed → "N", empty marketplace → "0", partial → "X/Y"

## v1.0.53 — 2026-05-22 — Marketplace card: distinction installed vs available

- [FEATURE] Marketplace card shows installed vs available plugins (reads real `marketplace.json`, not just `installed_plugins.json`)
- [FEATURE] State `mktList[i]` enriched with `available` (total declared) and `installed` (present)
- [IMPROVEMENT] Differentiated tooltip: "See and install plugins" if missing, "See installed plugins" if complete
- [IMPROVEMENT] Marketplace sort by `available` desc, then `installed` desc

## v1.0.52 — 2026-05-22 — Pack H step 2: Install plugin from marketplace

- [FEATURE] "Plugins of marketplace" modal shows all plugins (installed + available) via new `getMarketplaceDetail` IPC
- [FEATURE] "Install" button on non-installed plugins with token cost preview + confirmation before execution
- [FEATURE] Execution `claude plugins install <name>@<marketplace>` via array execFile (secure)
- [FEATURE] Auto-refresh post-install + desktop notification + activity log
- [FEATURE] "Details" button on already-installed plugins opens the Plugin content modal (drill-down)

## v1.0.51 — 2026-05-22 — Pack H step 1: Add Marketplace from panel

- [FEATURE] "+ Marketplace" button in the topbar of the Marketplace section (contextual)
- [FEATURE] "Add marketplace" modal with source input + explanatory helper (GitHub shorthand / git URL / local path)
- [FEATURE] Execution `claude plugins marketplace add <source>` via array execFile
- [FEATURE] Activity log records every addition
- [SECURITY] Validation regex `validMarketplaceSource()` before the CLI (no shell injection)

## v1.0.50 — 2026-05-22 — Polish "N plugin" badge on Marketplace card

- [IMPROVEMENT] Gray border of the "N plugin" badge always visible (was invisible in normal state)
- [IMPROVEMENT] Number/label proportion rebalanced: number 22px (was 28), label 13px (was 11) — more readable
- [IMPROVEMENT] Hover: "plugin" label tinted orange together with the number

## v1.0.49 — 2026-05-22 — Sidebar: hierarchical order Marketplace before Plugin

- [IMPROVEMENT] Reversed Marketplace ↔ Plugin order to reflect logical hierarchy (Marketplaces contain Plugins contain Skills/Agents/MCP)
- [IMPROVEMENT] Updated `Cmd+1..9` accelerators and command palette entries for the new order

## v1.0.48 — 2026-05-22 — Cleanup "See N plugin" strip + clickable number

- [IMPROVEMENT] Removed yellow full-width "See N plugin" strip from Marketplace cards (more consistent aesthetics)
- [FEATURE] "N plugin" number on card now directly clickable with orange hover + glow
- [FEATURE] Immediate tooltip on the number ("See plugin list") with `data-tt` system

## v1.0.47 — 2026-05-22 — Polish plugin card UI + consistent marketplace

- [IMPROVEMENT] Plugin card footer (toggle + buttons + Update/Remove) always at the base even with short description
- [IMPROVEMENT] Eye icon redesigned (was an ambiguous oval, now reads as an eye)
- [IMPROVEMENT] Immediate `data-tt` tooltips on icon buttons (no more 2s wait for native tooltip)
- [REFACTOR] Marketplace card: removed "PLUGIN (N)" accordion toggle, replaced with "👁 See N plugin" button that opens modal consistent with Plugin content

## v1.0.46 — 2026-05-22 — Plugin card: SVG icons + Plugin content modal

- [FEATURE] New eye button (SVG icon) next to Finder/editor: opens "Plugin content" modal
- [FEATURE] Modal shows header, numeric summary (skills/agents/MCP/hook/tok), clickable list of skills and agents
- [FEATURE] Click on skill in modal → switch to Skills section with pre-applied filter; click on agent → switch to Agents
- [FEATURE] "↗ Go to MCP" button for plugins that export MCP servers
- [FEATURE] "N skill / N agent / MCP / Hook" clickable badges: open the same modal
- [IMPROVEMENT] Explanatory tooltip on the "tok" badge (meaning of always-on tokens)
- [REFACTOR] Emojis 📁 📝 replaced with inline SVG icons (folder + code)

## v1.0.45 — 2026-05-22 — Per-project Stats: design + filter

- [IMPROVEMENT] Stats > Per-project: KPI-style design (Inter 18px bold value + uppercase label) instead of oval pills
- [FEATURE] Ghost project filter (0 sessions + 0 messages + 0 tokens) to hide transient directories
- [DOCS] Clarified legend: "sessions" count = resumable `.jsonl` files, not full history total

## v1.0.44 — 2026-05-22 — Histogram tooltip: clamp inside window

- [FIX] "Daily tokens" tooltip in Stats > Models no longer exits the window: flips to the left of the cursor if there's no space on the right, clamps on all sides

## v1.0.43 — 2026-05-22 — Explanatory note for Model percentages

- [DOCS] Stats > Models: note above the list clarifies that percentages represent the distribution of your own usage (sum 100%), not quota/limit

## v1.0.42 — 2026-05-22 — Fix Token per model percentages

- [FIX] Token per model in Stats: Opus 4.7 showed 24622% instead of 57.3% (incoherent denominator input+output vs numerator total types)
- [FIX] Total recalculated locally with all types (input+output+cache_read+cache_create), sum of 6 models = 100%

## v1.0.41 — 2026-05-22 — No Config reload flicker

- [IMPROVEMENT] Toggle/select/slider change in Config no longer triggers page reload with 1-2s lag
- [IMPROVEMENT] Config opens instantly if data is cached (no "Loading configuration…" spinner)
- [REFACTOR] UI updated optimistically on click; when filesystem watch detects our own modification we skip re-render

## v1.0.40 — 2026-05-22 — Cleanup Settings + fix Voice toggle

- [FIX] Voice toggle: now writes `voice.enabled` (nested) as per official schema, instead of `voiceEnabled` top-level (Claude Code ignored it)
- [FIX] Response language: options changed from ISO codes (`en`/`it`) to capitalized names (`English`, `Italian`, etc.) accepted by the schema
- [FEATURE] Claude Code theme: added missing options (`dark-daltonized`, `light-daltonized`, `dark-ansi`, `light-ansi`)
- [IMPROVEMENT] Settings → Info compacted to a single row (name + platform + version + Changelog button)
- [REFACTOR] Removed duplicate "Statistics" section from Settings (already in Dashboard and Stats)
- [REFACTOR] Emojis 📁 📋 ⤓ ⤒ replaced with SVG icons consistent with sidebar

## v1.0.39 — 2026-05-22 — Session/week quotas cross-platform

- [FEATURE] Session/week quotas now also work on Windows and Linux: reads OAuth token from fallback file `~/.claude/.credentials.json`
- [IMPROVEMENT] Error messages distinguish cause per platform (Keychain/file/Credential Manager)

## v1.0.38 — 2026-05-22 — Dashboard reorganization + Config standalone

- [IMPROVEMENT] Dashboard reorganized: at the top "Context estimate" and "Claude Quotas" (info that changes more often), then "Statistics" installation KPIs, then "Claude Code Usage" KPIs
- [FEATURE] "Config" section promoted to autonomous sidebar entry with icon + `Cmd+8` accelerator (removed from Stats tab)
- [IMPROVEMENT] Immediate tooltip above each dot of the Effort slider with extended name

## v1.0.37 — 2026-05-22 — Fix quota percentages (1400% display)

- [FIX] Quota percentages now match the Claude VS Code plugin (were 100× too big, e.g., 1400% instead of 14%)
- [FIX] Anthropic API returns `utilization` already on 0–100 scale, not as float 0–1; removed wrong multiplication
- [IMPROVEMENT] Safety clamp [0, 100] against API transients

## v1.0.36 — 2026-05-22 — Critical OAuth quota fixes

- [FIX] Mandatory header `anthropic-beta: oauth-2025-04-20` added (main cause of 401 in v1.0.35)
- [FIX] Correct keychain parsing: payload nested under `claudeAiOauth.accessToken`, not flat
- [FEATURE] Automatic token refresh via `POST platform.claude.com/v1/oauth/token` if token expiring (within 5min) or on 401
- [SECURITY] Token renewed ONLY in process memory: CLACOROO never rewrites the Claude Code keychain

## v1.0.35 — 2026-05-22 — Session/week quotas visible

- [FEATURE] Session and week quotas visible in CLACOROO: 3 bars (Session 5h · Weekly 7d · Weekly Sonnet) with percentage + time to reset
- [FEATURE] Visible in the Settings "Claude Account" panel and new "Claude Quotas" section of the Dashboard
- [FEATURE] Bar color based on threshold: blue up to 80%, orange 80–95%, red above
- [FEATURE] "Manage usage on claude.ai →" button
- [FEATURE] Reading via `GET /api/oauth/usage` with OAuth token from macOS Keychain
- [IMPROVEMENT] 60s cache + optimistic render for zero flicker

## v1.0.34 — 2026-05-22 — Logout: custom tooltip instead of orange box

- [IMPROVEMENT] Styled tooltip on Logout button hover (card + arrow + list of affected instances) instead of the fixed orange box
- [REFACTOR] Cleaner Account panel aesthetics

## v1.0.33 — 2026-05-22 — Explicit global Logout warning

- [FEATURE] Orange box "⚠ Logout disconnects EVERYWHERE (CLACOROO + CLI + IDE)" already visible before the click
- [IMPROVEMENT] Confirmation dialog rewritten with shared macOS Keychain detail
- [IMPROVEMENT] "Yes, global logout" button instead of the generic "Logout"

## v1.0.32 — 2026-05-22 — Effort level 5-dot slider

- [FEATURE] "Effort level" as a 5-dot blue slider in VS Code Claude plugin style (low → max), click sets the level
- [FEATURE] Dynamic label next to the title ("Effort (xhigh)") shows the current level
- [FIX] "↗ claude.ai" link in the Account panel: now points to `https://claude.ai/settings/billing` (was nonexistent URL on claude.com)

## v1.0.31 — 2026-05-22 — API key mode guide (no save)

- [FEATURE] "ℹ API key mode" button in the Account panel: step-by-step guide for those who want to use pay-per-use API key
- [SECURITY] CLACOROO does NOT save, read or transmit the key: the guide shows how to set it in `.zshrc`/`.bashrc` and copies commands to clipboard

## v1.0.30 — 2026-05-22 — Effort level in Config tab

- [FEATURE] Config tab: "Effort level" selector (low/medium/high/xhigh/max) modifies `effortLevel` of `settings.json` instantly

## v1.0.29 — 2026-05-22 — Account pill in sidebar + quick access buttons

- [FEATURE] Account pill always visible in sidebar (plan badge + email, under Recent, above Status), click opens Settings
- [FEATURE] Account panel: "↗ claude.ai" (subscription) + "↗ Console API" (billing, API keys, usage) buttons

## v1.0.28 — 2026-05-22 — "Estimated API value" KPI in USD

- [FEATURE] New "Estimated API value" KPI in Stats and Dashboard: USD if you paid pay-per-use (Max plan savings estimate)
- [FEATURE] Calculation based on public Anthropic prices (Opus, Sonnet, Haiku with proportional cache read/write)
- [FEATURE] Range All / 30d / 7d (sub-ranges estimated by message proportion)

## v1.0.27 — 2026-05-21 — Claude Account panel in Settings

- [FEATURE] New "Claude Account" panel: plan (colored Max/Pro/Team badge), email, org, org ID, auth method, API provider
- [FEATURE] "Refresh" and "Logout" buttons with explicit confirmation
- [IMPROVEMENT] 5-minute cache to avoid re-launching `claude auth status` at every section open

## v1.0.26 — 2026-05-21 — KPI card: soft glow instead of colored line

- [IMPROVEMENT] KPI card: removed top colored line, replaced with soft glow that wraps the card and intensifies on hover
- [IMPROVEMENT] Card border tinted with accent color but desaturated for dark palette consistency

## v1.0.25 — 2026-05-21 — Compact KPI cards + Dashboard spacing

- [IMPROVEMENT] More compact KPI cards: reduced padding, number 26px (was 32), grid min-width 140px (was 160)
- [IMPROVEMENT] Dashboard: extra space between "Marketplace" and "MCP server" for readability

## v1.0.24 — 2026-05-21 — MCP server section in Dashboard

- [FEATURE] New "MCP server" section under "Marketplace" in Dashboard with clickable chips (colored dot for status)
- [REFACTOR] MCP section: removed clickable links on URLs (MCP endpoints aren't web pages), only copy button remains

## v1.0.23 — 2026-05-21 — Context estimate: new MCP server segment

- [FEATURE] "Context estimate" bar includes new MCP servers segment (cyan color) next to Skills/System prompt/Agents/Memory/Free
- [FEATURE] Estimate ~400 tokens per connected MCP server (observed median on official plugins)
- [FEATURE] Real-time update when you enable/disable plugins with MCP servers
- [REFACTOR] MCP cache invalidated automatically on every plugin change

## v1.0.22 — 2026-05-21 — Polish MCP section

- [IMPROVEMENT] MCP filters: vertical divider between type (claude.ai / plugin) and status
- [FEATURE] Copy to clipboard button on each MCP card for URL/command
- [FEATURE] Clickable HTTP/SSE URLs: open in system browser (useful for OAuth of "Needs Auth" servers)

## v1.0.21 — 2026-05-21 — Pack G: MCP server section

- [FEATURE] New "MCP" section in sidebar: lists all configured MCP servers with Connected/Needs Auth/Error status
- [FEATURE] Marketplace-style card for each server (name, origin, transport, URL/command, status badge)
- [FEATURE] Filters by status and type (claude.ai / from plugins)
- [FEATURE] "Refresh live status" button relaunches official health-check
- [FEATURE] "MCP connected" KPI in Dashboard (X/Y)

## v1.0.20 — 2026-05-21 — Context estimate: smooth segment animation

- [FIX] "Context estimate" bar no longer disappears when you enable/disable plugins: segments animate to the new value (was a white flash for ~1s)
- [REFACTOR] In-place value update without rebuilding the DOM, CSS transition on width

## v1.0.19 — 2026-05-21 — Context estimate in Plugin page + live update

- [FEATURE] "Context estimate" bar also at the top of the Plugin page
- [FEATURE] All bars update dynamically on plugin enable/disable/update/remove
- [REFACTOR] Statistics cache invalidated both post-plugin-action and on external modification of `settings.json`

## v1.0.18 — 2026-05-21 — Claude Code Usage KPIs in Dashboard

- [FEATURE] Dashboard enriched with 9 "Claude Code Usage" KPIs (Sessions, Messages, Tokens, Active days, Most active day, Streak, Peak hour, Favorite model)
- [FEATURE] "Context estimate" bar in Dashboard with compact horizontal legend
- [REFACTOR] Statistics shared between Dashboard and Stats (no double I/O)

## v1.0.17 — 2026-05-21 — Favorite model KPI: extended name

- [IMPROVEMENT] "Favorite model" shows extended name (`Opus 4.7`, `Sonnet 4.6`) instead of abbreviated
- [IMPROVEMENT] Extended KPI label "Favorite Model" on two lines (was truncated)

## v1.0.16 — 2026-05-21 — Fix Sessions KPI: real .jsonl count

- [FIX] "Sessions" KPI counts real `.jsonl` files in `~/.claude/projects/` (was underestimated by aggregated cache)
- [IMPROVEMENT] 30d/7d filters apply real count by file modification date (aligned with `claude /stats`)

## v1.0.15 — 2026-05-21 — Data alignment with `claude /stats`

- [FIX] "Total tokens": sum only input+output (was ~400× higher including cache_read which is free)
- [FEATURE] All / 30d / 7d filters also apply to KPIs (not just to heatmap)
- [FEATURE] New "Most active day" KPI (date with most messages in range)
- [IMPROVEMENT] "Active days" shows ratio `active/total` when range 30d/7d (e.g., "18/30")
- [IMPROVEMENT] "Favorite model" for 30d/7d range recalculated from the period, not all-time

## v1.0.14 — 2026-05-21 — Claude Desktop style heatmap + 8 KPIs

- [FEATURE] Heatmap redesigned in Claude Desktop style: 52 weeks × 7 days (entire year), month labels, detailed tooltip
- [FEATURE] 8 KPIs above heatmap (Sessions, Messages, Tokens, Active days, Streak, Peak hour, Favorite model)
- [FEATURE] "All / 30d / 7d" filters for heatmap period
- [FIX] Realistic context estimate: for skill/agent counts only YAML frontmatter (was 417%, now < 100%)
- [DOCS] Clarifying note: "For skill/agent it counts only the frontmatter — the body is only loaded when invoked"

## v1.0.13 — 2026-05-21 — GitHub style heatmap + Context estimate

- [FEATURE] Activity heatmap in GitHub contribution graph style (13 weeks × 7 days, month labels, intensity legend)
- [FEATURE] New "Context estimate" in `claude /context` style: horizontal System prompt/Memory/Skills/Agents bar, fill on 200k
- [FEATURE] Daily token histogram with per-model tooltip (top 3)
- [FEATURE] Per-project tab: added message count and clarifying note
- [FIX] Always Thinking/Voice toggle in the Config tab no longer resets after 1s (cache invalidated on settings.json change)

## v1.0.12 — 2026-05-21 — Stats section (4 tabs)

- [FEATURE] New "Stats" section with 4 tabs: Overview (KPI + 90-day heatmap), Models (token bars + histogram), Per-project (project list with sessions and tokens), Config (visual settings.json editor)
- [FEATURE] GitHub contribution graph style heatmap with CLACOROO palette
- [IMPROVEMENT] Server-side 60s caching + client-side for zero re-I/O on tab change
- [REFACTOR] Project path decoded by reading `cwd` of JSONL files (more reliable than ambiguous dir decode)

## v1.0.11 — 2026-05-21 — Local/global scope: tracked projects

- [FEATURE] Project tracking: CLACOROO also shows plugins/skills/agents installed in the `.claude/` local of each tracked project
- [FEATURE] "+ Project" button in topbar to add project
- [FEATURE] "Tracked projects" Settings section to manage list
- [FEATURE] "global" (blue) / "local: project-name" (green) badge on each plugin/skill/agent
- [FEATURE] Auto-refresh on modification of projects' `.claude/plugins/installed_plugins.json`

## v1.0.10 — 2026-05-21 — Cmd+K command palette + Changelog viewer + Sidebar recents

- [FEATURE] Global command palette: `Cmd+K` to search/open plugin/skill/agent/marketplace + quick actions
- [FEATURE] Integrated changelog viewer: "📋 Changelog" button in Settings with colored cards per version
- [FEATURE] Sidebar enriched with "Recent" section (last actions performed, click to jump to context)

## v1.0.09 — 2026-05-21 — Soft auto-update via GitHub Releases API

- [FEATURE] Automatic update check at startup + every 24h via GitHub Releases API
- [FEATURE] Topbar banner when new version comes out with "Open download page" button
- [FEATURE] Settings → Updates section with manual check and auto-check toggle
- [FEATURE] Option "Remind me later" or "Skip this version" (persistent state)
- [DOCS] Soft update: no in-app download/install, only notification + link to `.dmg`

## v1.0.08 — 2026-05-21 — Redesigned mascot + clean about panel

- [IMPROVEMENT] Redesigned mascot: rounder head, 4 well-defined paws, big eyes with highlights
- [IMPROVEMENT] Antenna in warm gray, visible on dark background
- [IMPROVEMENT] Under the CLACOROO logo the extended version "CLAude-code COntrol ROom" appears
- [IMPROVEMENT] Clean About panel with updated copyright
- [CHORE] App icon regenerated with the new mascot

## v1.0.07 — 2026-05-21 — Security hardening + native desktop UX

- [SECURITY] Explicit `sandbox: true` in `BrowserWindow.webPreferences`
- [SECURITY] `setWindowOpenHandler` blocks popups, redirects `https?:` to `shell.openExternal`
- [SECURITY] `webContents.on('will-navigate')` blocks external navigations
- [SECURITY] `app.requestSingleInstanceLock()` + `second-instance` handler (early return)
- [FEATURE] Native macOS application menu with access to all sections
- [FEATURE] Keyboard shortcuts: `Cmd+R` refresh, `Cmd+Q` quit, `Cmd+,` Settings, `Cmd+1..6` switch section
- [FEATURE] About panel with version info and repository link
- [FEATURE] Native macOS notifications on enable/disable/update/uninstall plugin (only if app not in focus)
- [FEATURE] `windowBounds` + `lastSection` persistence in `~/.claude-control-room/state.json`

## v1.0.06 — 2026-05-21 — Anthropic-inspired typography

- [FEATURE] Inter variable (SIL OFL) self-hosted for UI/brand/KPI
- [FEATURE] Source Serif 4 variable (SIL OFL) self-hosted for markdown body
- [FIX] Custom Dock icon and app name also in development mode
- [SECURITY] CSP extended with explicit `font-src 'self'`
- [DOCS] LICENSE + NOTICE for bundled fonts (required by SIL OFL)

## v1.0.05 — 2026-05-20 — Seven local feature ideas (goal mode)

- [FEATURE] "Open in Finder" / "Open in editor" buttons on each plugin card
- [FEATURE] Activity log `~/.claude-control-room/activity-log.json` with Dashboard sub-section
- [FEATURE] Plugin Validator (`claude plugins validate <path>`) in Settings
- [FEATURE] First-run onboarding tour with 5 steps + Restart button in Settings
- [FEATURE] Skill/agent health check: ⚠ badge on missing/malformed frontmatter + Dashboard KPI
- [FEATURE] Export/import `.clacoroo` snapshot (marketplaces + plugin + blocklist)
- [FEATURE] Inline SKILL.md/agent.md viewer (DOM-based markdown modal)
- [FIX] `enabledPlugins` of `~/.claude/settings.json` is the source of truth (not `blocklist.json`)
- [FIX] `fs.watchFile` (polling) replaces `fs.watch` for cross-platform reliability
- [REFACTOR] Extracted `src/lib/markdown.js`, `state.js`, `snapshot.js`

## v1.0.04 — 2026-05-20 — Cross-platform packaging (.dmg/.exe/.AppImage)

- [FEATURE] Distributable package macOS (.dmg arm64 + x64), Windows (.exe NSIS + portable), Linux (.AppImage + .deb + .rpm)
- [FEATURE] Custom app icon with CLACOROO mascot
- [FEATURE] macOS hardened runtime + native dark mode support
- [FEATURE] Windows NSIS: `oneClick: false`, `allowToChangeInstallationDirectory: true`, `asInvoker` (no admin)
- [FEATURE] Linux desktop entry with Development/Utility category

## v1.0.02 — 2026-05-19 — CLACOROO rebrand + Claude visual identity

- [FEATURE] Rebrand to CLACOROO with visual identity inspired by Claude (Anthropic)
- [FEATURE] Warm orange palette + Claude warm neutrals (`#d97757` accent)
- [FEATURE] Pixel-art mascot (SVG `<rect>` only) integrated in sidebar and loading screen
- [FEATURE] "CLACOROO" logo with orange "CO" (Code/Control overlap)
- [FEATURE] `mascotBob` animation in loading screen
- [DOCS] README rewritten in Italian with etymology + brand section

## v1.0.01 — 2026-05-19 — First release: foundation

- [FEATURE] Visual management of plugins, marketplaces, skills and agents of Claude Code
- [FEATURE] Dashboard with summary KPIs (active/disabled plugins, marketplaces, total skills/agents)
- [FEATURE] Plugin enable/disable toggle, update and uninstall via CLI `claude plugins`
- [FEATURE] Marketplace, Skill, Agent section: searchable browser
- [FEATURE] Settings: detected paths, statistics, manual configuration of `claude` binary
- [FEATURE] Auto-refresh when config files change externally
- [FEATURE] Toast notification for action feedback
- [SECURITY] Secure architecture: `contextBridge` + `contextIsolation: true` + `nodeIntegration: false`
- [SECURITY] `execFile` with array args (zero shell injection)
- [SECURITY] Regex validation on `pluginId` and `marketplaceName` before the CLI
- [DOCS] Technical handoff document (`docs/doc-tecnico_handoff.html`)
