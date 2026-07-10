# Strava data reconciliation — real teams/seasons, per-season participations

## Context

The importer (PR #10, branch `strava/import`, now branched to `strava/reconcile`)
brought in 54 real matches, but as guests + the design-handoff team model. This
plan replaces the placeholder team/season model with the owner's real structure,
reassigns every match, deletes the 24 placeholder matches, and hardens the
importer so future re-runs can't clobber the curated data.

Work happens on branch `strava/reconcile` (based off `strava/import`, so it
already contains the 54 imported games + 24 placeholders + snapshot). Base commit:
`c8fc9a2`.

### The model decision (already made with the owner)

A team's league/tier/format/venue can differ by season (Charlie Cheers FC is
NYC Footy in Summer but Volo in Winter/Spring). So **each team-season is its own
`TEAMS` entry**, sharing a display `name` where the club is the same. This needs
no derive/rendering change — `matchTeam()`/`seasonTeamRows()` already resolve
per-`teamId` and group by it, and seasons partition the ledger, so three
"Charlie Cheers FC" entries in three seasons render correctly.

### Current state (base c8fc9a2)

- `src/data/matches.json`: 78 matches — 54 with `stravaId` (imported), 24 without
  (placeholders to delete).
- `src/data/soccer.ts`: placeholder `TEAMS` (charlie-cheers, fa-blast, salmon-roe)
  and `SEASONS` (fall-2025 … summer-2026 with invented date ranges).
- `src/data/soccer-derive.ts`, `src/components/field-report/*`: consume the model
  via `matchTeam`/`seasonTeamRows`/`matchTeamLog`/`teamById`/`seasonById` — must
  keep working unchanged.
- `scripts/strava/{parse,merge,import}.ts`: the importer.

## Global Constraints (bind every task; copy into reviewer prompts)

1. After the full change, `npx astro check` = 0 errors, `npm test` all pass,
   `npx astro build` succeeds.
2. The site model is match-derived: every `Match.teamId` must exist in `TEAMS`,
   every `Match.seasonId` in `SEASONS`. No dangling ids (`teamById`/`seasonById`
   throw otherwise).
3. All 54 imported matches (those with `stravaId`) are preserved with their
   `stravaId`, `date`, `result`, `score`, `goals`, `goalsIsMinimum`, `assists`
   UNCHANGED — only `teamId`/`seasonId`/`guest`/`sub` may be (re)assigned.
4. All 24 placeholder matches (no `stravaId`) are DELETED.
5. `soccer-derive.ts` and `src/components/field-report/*` are NOT modified (the
   model change is additive: a new `seasonId` field on `Team` and a widened
   `division` union). If a change there seems necessary, stop and flag it.
6. `matches.json` must stay in the committed format: 4-space indent, then
   `npx prettier --write src/data/matches.json` so the diff is clean.
7. The importer must never silently clobber curated identity on re-import
   (Task 2).

---

## Task 1: Rebuild the data model + reassign all matches + delete placeholders

**Files:** `src/data/soccer.ts`, `src/data/matches.json`. Nothing else.

### 1a. `soccer.ts` schema

- Add a `Division` type: `"P1" | "P2" | "P3" | "P4" | "P5" | "P2/P3" | "P3/P4"`
  (some teams span two adjacent tiers). Use it for `Team.division`.
- Add `seasonId: string` to `Team` (each entry is one season's participation;
  used by the importer to know which season a team belongs to). Document it.
- Keep `Team` otherwise the same: `id, name, seasonId, league, division?, format, venue`.

### 1b. `soccer.ts` — replace `TEAMS` with these 12 entries (exact)

| id | name | seasonId | league | division | format | venue |
|---|---|---|---|---|---|---|
| fa-orange-julius | FA Orange Julius | fall-2025 | NYC Footy | P3 | 5v5 | indoor |
| fa-rapinoe-grigio | FA Rapinoe Grigio | fall-2025 | NYC Footy | P3 | 5v5 | indoor |
| fa-pretty-in-pink | FA Pretty in Pink | fall-2025 | NYC Footy | P4 | 7v7 | indoor |
| charlie-cheers-winter | Charlie Cheers FC | winter-2025-26 | Volo | *(omit)* | 7v7 | indoor |
| formerly-fate | Formerly Fate | winter-2025-26 | NYC Footy | P3 | 5v5 | indoor |
| fa-goalmates | FA Goalmates | winter-2025-26 | NYC Footy | P3 | 5v5 | indoor |
| charlie-cheers-spring | Charlie Cheers FC | spring-2026 | Volo | *(omit)* | 7v7 | outdoor |
| abcde-fc | ABCDE FC | spring-2026 | NYC Footy | P3 | 7v7 | outdoor |
| fa-seven-wonders | FA Seven Wonders of the Goal | spring-2026 | NYC Footy | P3/P4 | 7v7 | outdoor |
| charlie-cheers-summer | Charlie Cheers FC | summer-2026 | NYC Footy | P2/P3 | 6v6 | outdoor |
| salmon-roe | Salmon Roe United | summer-2026 | NYC Footy | P3 | 7v7 | outdoor |
| fa-blast | FA Blast from the Past | summer-2026 | NYC Footy | P3 | 7v7 | outdoor |

- Volo teams (charlie-cheers-winter/spring): OMIT `division` entirely (Volo has no tiers).
- On `salmon-roe`, add a code comment: `// formerly posted on Strava as "FA Goal Oriented"`.

### 1c. `soccer.ts` — replace `SEASONS` with these 4 (exact)

| id | label | months | status | start | end | teamIds (in this order) |
|---|---|---|---|---|---|---|
| fall-2025 | Fall 2025 | OCT — DEC | sealed | 2025-10-01 | 2025-12-15 | fa-orange-julius, fa-rapinoe-grigio, fa-pretty-in-pink |
| winter-2025-26 | Winter 2025 – 26 | DEC — MAR | sealed | 2025-12-16 | 2026-03-31 | charlie-cheers-winter, formerly-fate, fa-goalmates |
| spring-2026 | Spring 2026 | APR — JUN | sealed | 2026-04-01 | 2026-06-13 | charlie-cheers-spring, abcde-fc, fa-seven-wonders |
| summer-2026 | Summer 2026 | JUN — AUG | in-play | 2026-06-14 | *(omit — in-play)* | charlie-cheers-summer, salmon-roe, fa-blast |

`teamIds` is display order only (the ledger derives rows from matches; `teamIds`
just ranks them). Real Sosobad is a guest, so it's not in any `teamIds` — it
renders after the rostered rows in Summer.

Also: remove/replace the stale `TODO(ethan): the three sealed seasons … are
PLACEHOLDERS` comment block — the sealed seasons are now real. Keep the
`import matchesData … MATCHES` block.

### 1d. `matches.json` — reassign the 54 imported matches, delete the 24 placeholders

Best done with a one-off Node transform (deterministic, less error-prone than 54
hand-edits): read `src/data/matches.json`, drop every entry without a `stravaId`
(the 24 placeholders), and remap the rest by the current team identity:

- guest.team `"FA Orange Julius"` → teamId `fa-orange-julius`, seasonId `fall-2025`
- guest.team `"FA Rapinoe Grigio"` → `fa-rapinoe-grigio`, `fall-2025`
- guest.team `"FA Pretty in Pink"` → `fa-pretty-in-pink`, `fall-2025`
- guest.team `"Formerly Fate"` → `formerly-fate`, `winter-2025-26`
- guest.team `"FA Goalmates"` → `fa-goalmates`, `winter-2025-26`
- guest.team `"ABCDE FC"` → `abcde-fc`, `spring-2026`
- guest.team `"FA Seven Wonders of the Goal"` → `fa-seven-wonders`, `spring-2026`
- guest.team `"FA Goal Oriented"` → `salmon-roe`, `summer-2026`
- teamId `"fa-blast"` → `fa-blast`, `summer-2026`
- teamId `"salmon-roe"` (the 2026-07-06 game) → `salmon-roe`, `summer-2026`
- teamId `"charlie-cheers"` → BY DATE: date < `2026-04-01` → `charlie-cheers-winter`,
  `winter-2025-26`; `2026-04-01` ≤ date ≤ `2026-06-13` → `charlie-cheers-spring`,
  `spring-2026`; date ≥ `2026-06-14` → `charlie-cheers-summer`, `summer-2026`
- guest.team `"Real Sosobad"` (2026-06-14, has `sub: true`) → KEEP as a guest
  (do NOT give it a teamId). Set `guest = { team: "Real Sosobad", league: "NYC Footy",
  format: "7v7", level: "P3" }`, keep `sub: true`, seasonId `summer-2026`.

When assigning a `teamId`, DELETE the `guest` object from that match (it's now a
rostered participation). Keep `sub` only where it already is (Real Sosobad).
Leave `stravaId`/`date`/`result`/`score`/`goals`/`goalsIsMinimum`/`assists` intact.

Write with `JSON.stringify(matches, null, 4) + "\n"`, then
`npx prettier --write src/data/matches.json`.

**Expected result (verify all):**
- 54 matches total, 0 without `stravaId`.
- Per-team counts: fa-orange-julius 3, fa-rapinoe-grigio 2, fa-pretty-in-pink 3,
  charlie-cheers-winter 5, formerly-fate 5, fa-goalmates 5, charlie-cheers-spring 8,
  abcde-fc 7, fa-seven-wonders 7, charlie-cheers-summer 4, salmon-roe 2, fa-blast 2,
  and 1 guest (Real Sosobad). (Sum 54.)
- Per-season counts: fall-2025 8, winter-2025-26 15, spring-2026 22, summer-2026 9.
- Every `teamId` ∈ TEAMS; every `seasonId` ∈ SEASONS.
- `fa-seven-wonders`'s 2026-06-01 match has seasonId `spring-2026` (moved off summer).

### Verify
`npx astro check` (0 errors), `npm test` (all pass), `npx astro build` (succeeds).
Optionally print all-time W/D/L to sanity-check the derivations run.

---

## Task 2: Harden the importer against clobbering curated data

The reconciled matches are curated (hand-assigned team/season). A future importer
re-run must refresh stats but never silently overwrite that curation, and must not
mis-attach a new game to one of several same-named team entries.

**Files:** `scripts/strava/merge.ts`, `scripts/strava/parse.ts` (+ their tests).

### 2a. `merge.ts` — preserve identity on update

Today the update path does `matches[idx] = { ...repo, ...d }`, which would
overwrite a curated `teamId`/`seasonId`/`guest`/`sub` with whatever the importer
re-derives. Change the update to refresh ONLY the observable fields from the draft
— `date`, `result`, `score`, `goals`, `assists`, and `goalsIsMinimum` (respecting
its optional presence) — while PRESERVING `repo.teamId`, `repo.seasonId`,
`repo.guest`, `repo.sub`. The snapshot update and the skip/conflict logic are
unchanged.

**Tests (add):** an existing repo match with a hand-assigned `teamId` + `seasonId`
and a Strava draft for the same `stravaId` whose score changed AND whose draft
re-derived a *different* `teamId` (e.g. a guest) → after merge, the match keeps the
repo's `teamId`/`seasonId` and takes the draft's new score/goals. Keep all existing
merge tests passing.

### 2b. `parse.ts` — don't guess among same-named team entries

With per-season teams, several `TEAMS` entries share a display name (three
"Charlie Cheers FC"). Today `input.teams.find(...)` returns the FIRST — so a new
"Charlie Cheers FC" post would silently attach to the wrong season. Change team
resolution: find ALL teams whose normalized name is contained in the title. If
exactly one → use it (unchanged behavior). If MORE than one → do NOT pick; treat
it as an unresolved team → record as a guest (non-blocking) with an informational
flag like `` `Title matches multiple team entries (${names}); recorded as a guest — assign the season by hand.` ``. This keeps single-name teams behaving exactly as before.

Keep the existing near-miss typo fold, free-agent guest recording, pickup skip,
and all blocking rules intact. The multi-match check applies to exact
normalized-substring name matches (before/instead of falling through to the
near-miss fold when the ambiguity is among exact matches).

**Tests (add):** a fixture with two teams sharing the name "Charlie Cheers FC"
(different ids) + a title "Charlie Cheers FC - Volo" → `teamId === undefined`,
recorded as a guest, non-blocking, with the multi-match flag. A single-name team
still resolves to its `teamId` (existing tests must pass unchanged).

### Verify
`npm test` (all pass, pristine).

---

## Out of scope (do NOT do here)
- No changes to `soccer-derive.ts` or `src/components/**`.
- No alias-matching or date-based season disambiguation in the parser (the
  merge-identity-preserve + multi-match-guard cover the real risks; date
  disambiguation was considered and deliberately dropped as unnecessary).
- Do not merge PR #10 or open/close PRs — the controller handles branch/PR flow.
