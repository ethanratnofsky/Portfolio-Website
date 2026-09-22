# Per-team-season date ranges

**Date:** 2026-09-22
**Status:** approved, pending implementation plan

## Problem

Five Fall 2026 matches were imported into `summer-2026`, and ABCDE FC was recorded
twice as a phantom guest.

The direct cause is one line. `summer-2026` carries `status: "in-play"` with no
`end`, and `seasonForDate` (`scripts/strava/dates.ts:17`) reads:

```ts
if (d >= s.start && (!s.end || d <= s.end)) return s.id;
```

An open-ended in-play season matches every date after its start, forever. Every
September activity landed in Summer 2026. Team resolution is scoped to that
season (`scripts/strava/parse.ts`), so:

- Charlie Cheers FC and Salmon Roe United resolved to their _summer_ entries —
  silently, because those entries exist and the name matched.
- ABCDE FC has no summer entry (it sat out), so it fell through to a guest row —
  with only a non-blocking `ℹ` note in the import PR.

The deeper cause is the model. `Season.start`/`end` describe one global,
non-overlapping window, but real league sessions overlap and each team's run
starts and ends on its own date. The repo already contains two matches whose
stored `seasonId` contradicts `seasonForDate`, both hand-corrected:

| Match | Date | Stored | `seasonForDate` says |
| --- | --- | --- | --- |
| `formerly-fate` | 2025-12-08 | `winter-2025-26` | `fall-2025` |
| Real Sosobad (guest) | 2026-06-14 | `spring-2026` | `summer-2026` |

`matchesBySeasonThenDate()` in `soccer-derive.ts` exists solely to work around
the same overlap in the goals chart. The date→season function has been wrong
whenever sessions overlap; the open-ended season is what finally made it
visible.

## Approach

Move the authoritative dates onto the team-season, where they belong, and
invert the importer's resolution order.

Considered and rejected:

- **Rolling horizon** — require `end` on every season, including in-play, as a
  provisional date pushed out or sealed by hand. Cheap and reuses the existing
  blocking path, but keeps one global window and so keeps mis-filing matches
  whenever two sessions overlap.
- **Detection only** — leave the importer alone, add CI invariants. Catches
  mistakes after they land in `main` rather than at the import PR.

## Design

### 1. `Team` gains its own run

```ts
export interface Team {
    // …existing fields…
    /** ISO date this team-season's run opens (inclusive). */
    start: string;
    /** ISO date it closes (inclusive); omit while the run is still going. */
    end?: string;
}
```

Each team-season is already its own `TEAMS` entry, so this needs no new
structure.

### 2. `Season` loses authored `start`/`end`

They become derived — min `start` / max `end` over the season's `teamIds`, via a
new `seasonRange(seasonId)` helper in `soccer-derive.ts`. One source of truth,
so the two can never drift apart again. `label`, `months`, `status` and
`teamIds` are unchanged.

A season whose teams are all still running has no derived end. That is correct
and no longer dangerous: it is now scoped per team, and the next season's entry
for the same club supersedes it by name.

### 3. The importer resolves team first, then season

Today: date → season → filter teams by season → match name against that subset.
The date→season step is the broken one, and it runs first.

New: **name + date → team entry → season.** Candidates are `TEAMS` entries whose
name matches the title _and_ whose `[start, end]` covers the match date.

| Candidates | Outcome |
| --- | --- |
| exactly 1 | `teamId`, and `seasonId` from that entry |
| 2 or more | league tie-break on the title (existing logic); still ambiguous → guest + flag |
| 0, but the name matches an entry **outside** its range | **⚠︎ blocking** |
| 0 name matches at all | guest; season from date over derived ranges |

The blocking case is the guardrail. Its message names the mismatch:

> ⚠︎ 2026-09-13 "ABCDE FC - NYC Footy": ABCDE FC is rostered in spring-2026
> (2026-04-05 – 2026-06-21) but this match is 2026-09-13 — add a new team-season
> entry for ABCDE FC, or mark the post `(sub)` if it was a guest appearance.

It fires on the _first_ match a team plays past its recorded run — 2026-09-01
for Charlie Cheers — instead of silently absorbing a whole season.

For a genuine guest (no name match at all), the season still comes from the
date, now over derived ranges. Zero or two-or-more seasons covering that date
blocks rather than guessing. Since derived ranges overlap where reality
overlaps, this asks a human exactly when the answer is genuinely ambiguous.

`import.ts` currently passes a pre-derived `seasonId` into `parseActivity`; it
will pass the match `date` instead, and read `seasonId` back off the resolved
team.

### 4. Invariants

New tests in `soccer-derive.test.ts`, alongside the existing guest-name check:

1. Every rostered match's date falls inside its team entry's `[start, end]`.
   This is the one that catches the bug at hand.
2. No two entries sharing a **team name** have overlapping ranges — the
   precondition name+date resolution depends on.
3. Every team entry's `seasonId` resolves, and the entry appears in that
   season's `teamIds`.

## Data changes

### Team IDs become year-qualified

Scheme: `<club-slug>-<seasonId>`. The ID contains the season it belongs to, so
it is self-documenting and cannot collide when a club plays the same season in a
later year. All 15 entries follow it; the rename rewrites `teamId` across
`matches.json`, both `SEASONS.teamIds` lists, and two test references.

### The full roster

Ranges marked _inferred_ come from the first and last recorded match; the rest
are authoritative. The table is ordered by season, then by start date, for
readability only — each season's `teamIds` keeps its existing authored order,
since that drives ledger row order in `seasonTeamRows()`.

| id | name | season | league | div | format | venue | start | end |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `fa-orange-julius-fall-2025` | FA Orange Julius | fall-2025 | NYC Footy | P3 | 5v5 | indoor | 2025-10-06 | 2025-12-01 |
| `fa-rapinoe-grigio-fall-2025` | FA Rapinoe Grigio | fall-2025 | NYC Footy | P3 | 5v5 | indoor | 2025-10-06 | 2025-12-01 |
| `fa-pretty-in-pink-fall-2025` | FA Pretty in Pink | fall-2025 | NYC Footy | P4 | 7v7 | indoor | 2025-11-16 | 2025-12-14 _(inferred)_ |
| `formerly-fate-winter-2025-26` | Formerly Fate | winter-2025-26 | NYC Footy | P3 | 5v5 | indoor | 2025-12-08 | 2026-02-02 _(inferred)_ |
| `fa-goalmates-winter-2025-26` | FA Goalmates | winter-2025-26 | NYC Footy | P3 | 5v5 | indoor | 2026-01-05 | 2026-03-09 |
| `charlie-cheers-winter-2025-26` | Charlie Cheers FC | winter-2025-26 | Volo | — | 7v7 | indoor | 2026-01-14 | 2026-02-25 |
| `abcde-fc-spring-2026` | ABCDE FC | spring-2026 | NYC Footy | P3 | 7v7 | outdoor | 2026-04-05 | 2026-06-21 |
| `fa-seven-wonders-spring-2026` | FA Seven Wonders of the Goal | spring-2026 | NYC Footy | P3/P4 | 7v7 | outdoor | 2026-04-06 | 2026-06-15 |
| `charlie-cheers-spring-2026` | Charlie Cheers FC | spring-2026 | Volo | — | 7v7 | outdoor | 2026-04-07 | 2026-05-26 |
| `charlie-cheers-summer-2026` | Charlie Cheers FC | summer-2026 | NYC Footy | P2/P3 | 6v6 | outdoor | 2026-06-17 | 2026-08-19 |
| `fa-blast-summer-2026` | FA Blast from the Pass | summer-2026 | NYC Footy | P3 | 7v7 | outdoor | 2026-06-28 | 2026-08-30 |
| `salmon-roe-summer-2026` | Salmon Roe United | summer-2026 | NYC Footy | P3 | 7v7 | outdoor | 2026-06-29 | 2026-08-31 |
| `charlie-cheers-fall-2026` | Charlie Cheers FC | fall-2026 | NYC Footy | P2/P3 | 7v7 | outdoor | 2026-09-01 | 2026-11-10 |
| `abcde-fc-fall-2026` | ABCDE FC | fall-2026 | NYC Footy | P3 | 7v7 | outdoor | 2026-09-13 | 2026-11-22 |
| `salmon-roe-fall-2026` | Salmon Roe United | fall-2026 | NYC Footy | P4 | 7v7 | outdoor | 2026-09-14 | 2026-11-30 |

Charlie Cheers FC goes 6v6 → 7v7 and Salmon Roe United drops P3 → P4 in Fall
2026. FA Blast from the Pass played Summer only and gets no Fall entry.

### Seasons

`summer-2026` flips to `sealed`. New `fall-2026`: label "Fall 2026", months
"SEP — NOV", `status: "in-play"`, `teamIds` in start-date order
(`charlie-cheers-fall-2026`, `abcde-fc-fall-2026`, `salmon-roe-fall-2026`).

Derived ranges that result:

| season | derived range |
| --- | --- |
| fall-2025 | 2025-10-06 – 2025-12-14 |
| winter-2025-26 | 2025-12-08 – 2026-03-09 |
| spring-2026 | 2026-04-05 – 2026-06-21 |
| summer-2026 | 2026-06-17 – 2026-08-31 |
| fall-2026 | 2026-09-01 – 2026-11-30 |

Two pairs overlap, matching reality: fall-2025 / winter-2025-26 share Dec 8–14,
and spring-2026 / summer-2026 share Jun 17–21. No existing guest sits in either
window, so nothing in the current data is ambiguous.

The Real Sosobad guest (2026-06-14) now falls inside `spring-2026`'s derived
range and no other — so the hand-correction becomes _derivable_. The model
reproduces it instead of contradicting it.

### The five misfiled matches

| date | was | becomes |
| --- | --- | --- |
| 2026-09-01 | `charlie-cheers-summer` / summer-2026 | `charlie-cheers-fall-2026` / fall-2026 |
| 2026-09-13 | guest "ABCDE FC" / summer-2026 | `abcde-fc-fall-2026` / fall-2026 |
| 2026-09-14 | `salmon-roe` / summer-2026 | `salmon-roe-fall-2026` / fall-2026 |
| 2026-09-15 | `charlie-cheers-summer` / summer-2026 | `charlie-cheers-fall-2026` / fall-2026 |
| 2026-09-20 | guest "ABCDE FC" / summer-2026 | `abcde-fc-fall-2026` / fall-2026 |

Neither ABCDE FC row carries `sub: true` — they were guests only because
resolution failed — so both become rostered and drop their `guest` object.

`mergeImports` preserves curated `teamId`/`seasonId`/`guest`/`sub` on re-import
(`scripts/strava/merge.ts`), refreshing only Strava-derived stats, so these
corrections survive future imports.

## Testing

- Baseline is 63 passing tests (`npm test`); all must still pass.
- `parse.test.ts`: the season-scoped resolution tests are rewritten against
  date-scoped resolution — same intent, new input shape. Add coverage for the
  new blocking case (name matches an entry outside its range) and for a guest
  date covered by zero or by two seasons.
- `dates.test.ts`: `seasonForDate` now takes derived ranges and reports
  ambiguity rather than returning the first match.
- `soccer-derive.test.ts`: the three new invariants, plus a `seasonRange` unit
  test.
- The pinned `Spring 2026 record is 15–1–7` test and the Spring `seasonTeamRows`
  test guard the ID rename — a mis-rewritten `teamId` breaks them.
- Verify the built Field Report section renders: Fall 2026 as the in-play season
  with three teams, Summer 2026 sealed.

## Out of scope

- The deferred minors noted in project memory (the TEAM filter showing repeated
  "Charlie Cheers FC" labels; the dead `Match.note` field).
- Backfilling authoritative start/end for the two _inferred_ ranges.
