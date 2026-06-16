# Boy Jail — Project Status (2026-06-14)

Status snapshot of what has shipped and what remains. Use this alongside the prior session handoff at `/tmp/boy-jail-handoff-2026-06-13.md` and the V2 plan memory `project_v2_plan.md`.

## Repo

- Path: `/Users/kylehart/Documents/Projects/PProject-1`
- Branch: `main` (everything in this session lives on `main`, fast-forward only)
- Sandbox: `amplify-boyjail-kylehart-sandbox-428c0d27c3` in `ap-southeast-2`

## Completed

### V1 (pre-session)
Complete multiplayer loop: Cognito auth, jail create/join via invite code, React Konva canvas, drag-to-move boys, real-time subscriptions, toasts, activity feed sidebar, presence avatars. See `git log` for the full v1 history.

### V2 — Batch 1 (Security) — **all four done this session**

1. **Server-side jail-scoping.** Per-jail Cognito groups (`jail-<id>`) created by a new `startJail` Lambda; users added to groups on jail-create / invite-redemption. All per-jail models gated on `allow.groupDefinedIn('jailGroup')`. Outsiders hitting a jail URL get a clean access-denied screen.
2. **Display names propagated everywhere.** New `addedByName` / `actorName` fields on Boy and Event. `useCurrentUser` hook centralises the email-prefix derivation. Falls back to UUID for old records.
3. **Presence TTL.** DynamoDB TTL enabled on Presence table (5-minute window). Heartbeats include the `ttl` epoch second.
4. **Server-side `addedBy`.** New `addBoy` Lambda calls AppSync via IAM (so real-time subscriptions still fire); it derives `addedBy` from `event.identity.sub` and validates `identity.groups` includes the jail's group.

### V2 — Batch 1 follow-up
- **Access-denied UI** on the jail page (task #9) — replaces the old "Loading…" stall.

### V2 — Batch 2 #5 — Boy editing
- Pencil icon on `BoyCard`, full edit form for name/emoji/crime/severity/sentenceRoom.
- Event emitted only when **crime or severity** changes; rendered as "updated <boy>" in the activity feed (schema action is `'edit'`, the human label is "updated" per user preference).
- Dark-text inputs styled consistently with `AddBoyModal`.

## Still to do

### V2 — Batch 2 (Polish) — remaining
- **#6 Capacity counters on rooms.** Float "3/8" on each room; red flash on rejected drops.
- **#7 Avatar uploads.** Amplify Storage + S3, per-boy custom images. Optional AI avatars.
- **#8 Mobile support.** Portrait canvas fit, long-press to drag, tap to open card.
- **#9 Invite code polish.** Copy button, `/join/<code>` share link, optional QR modal.

### V2 — Batch 3 (Fun) — not started
- **#10 Sentence countdowns + auto-release events.**
- **#11 Random events / disasters** (riot in cafeteria → all to solitary).
- **#12 Reactions on activity events.**

### V2 — Batch 4 (Scale prep) — not started
- **#13 Event pagination** (list 50 + "load more").
- **#14 Denormalize boy name/emoji onto Event** so deleted-boy feed entries still render.
- **#15 Drop redundant Presence polling** (subscription + 10s poll are doing the same job).
- **#16 Memoize Boy positions** (`useMemo` on `getBoyPosition`).
- **#17 Heartbeat 15s → 30s** (half the cost, same UX).
- **#18 Delete cascade for jails** (Lambda or custom resolver).
- **#19 Per-user rate limiting** on Boy creation.

### Open UX / known-limitation items (not in original plan)
- Activity feed `khart4706 updated 😒 Big Brian` doesn't say *what* was updated. Could be enriched with a `details` field later if useful.
- Canvas viewport sizing is "still a bit funny" per the user (from the original V1 handoff). Deferred polish.
- Old events (from before #2) still show UUIDs because they were written before display-name fields existed. New records render the friendly name.

## Reference memories
- `project_v2_plan` — full prioritised V2 plan.
- `project_progress` — running build progress (update after the next big change).
- `project_jail_visibility` — future public-read-only jail mode; keep auth flexible.
- `feedback_command_reasons` — always explain why before any shell command.
- `feedback_explain_changes` — always lead with the *why* on code edits.

## Suggested skills for the next session
- **`/canvas`** — for capacity counters (Konva work on the room overlay).
- **`/schema`** — if avatar uploads land (new Storage resource + schema change).
- **`/cognito`** — minor, only if invite-code polish needs auth changes.
- **`/security`** — quick re-run before public launch now that Batch 1 is shipped.
- **`/deploy`** — after the next coherent batch lands.

## What to start with
Likely candidates in priority order:
1. **Batch 2 #6 (capacity counters)** — small, contained, visibly fixes the silent-snap-back UX gap.
2. **Batch 2 #9 (invite code polish)** — small, user-facing, low risk.
3. **Batch 2 #7 (avatars)** — biggest visual upgrade but more work (Storage setup, upload flow, image rendering on canvas).

No blockers. Sandbox deployed and healthy.

## Sensitive info
None. Display names are email prefixes by design (already public to jail members).
