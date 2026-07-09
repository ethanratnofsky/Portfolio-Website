# Strava Match Importer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the field report be fed from Strava — a re-runnable importer that reads the user's annotated "Soccer" activities, parses them into draft `Match` records, and opens a review pull request — while adding first-class support for substitute/guest appearances.

**Architecture:** Two phases. **Phase A** (data model + rendering) makes matches representable without a rostered team: `teamId` becomes optional, a `guest` block carries inline label/league/format/level, a `sub` flag drives a SUB chip, and the season ledger derives its rows from actual matches instead of a hand-maintained roster. **Phase B** (importer) is a Node script run by a scheduled/dispatchable GitHub Actions workflow: it refreshes a Strava token, lists soccer activities, runs a pure tolerant parser (dictionary-matched teams/leagues, result derived from score, missing goals/assists = 0, `N+` = minimum), 3-way-merges against what it last imported (so later score corrections surface as PR diffs and hand-edits are respected), writes `src/data/matches.json`, and opens a PR. Matches move from a TS array to a JSON file so the importer writes data, never rewrites code.

**Tech Stack:** Astro 5 (static), TypeScript strict, Node 25 (built-in `node --test` + type stripping — no test-framework dependency), GitHub Actions, Strava REST API v3, `peter-evans/create-pull-request`. No new runtime dependencies.

## Global Constraints

- Static site on GitHub Pages; the importer is a **CI/build-time** tool that opens a PR — it never runs in the browser and exposes no tokens client-side.
- All field-report numbers stay **derived from `Match[]`** — no stored totals; the importer only ever writes raw match records.
- Money data is honest: a missing goals/assists count means **0** (the user never writes "0G"); an explicit `N+` means the `goalsIsMinimum` (†) flag. The importer must never invent a count it did not read.
- Result (`W`/`D`/`L`) is **derived from the score** by the importer; a contradicting `W`/`L`/`D` letter in the post is a flag, not an override.
- Leagues are a **blessed closed set**: `NYC Footy`, `Volo`, `NYC Soccer`. An unrecognized league is **flagged, never auto-created**.
- Teams are matched against a **dictionary** (order-, whitespace-, case-insensitive). An unrecognized team is flagged; a `(sub)` marker makes a match a guest appearance that needs **no roster entry**.
- The importer is a **review pipeline**: it only writes valid, buildable data; anything it cannot resolve into valid data (unknown team on a non-sub match, unknown league, no season covering the date) is reported in the PR body, not written.
- De-dup key is the **Strava activity id**; re-runs update rather than duplicate.
- "GitHub" is never abbreviated. Mono label registers render ALL-CAPS. En dashes (`–`) in records, middle dots (`·`) as separators.
- Verify with `node --test`, `npx astro check`, and `npx astro build` (all must pass). Format touched files with `npx prettier --write --plugin=prettier-plugin-astro <files>` (never the repo-wide glob — it reformats unrelated files).

---

## File Structure

- `src/data/matches.json` — **new**; the raw match array (migrated out of `soccer.ts`).
- `src/data/soccer.ts` — types (`LEAGUES`, `League`, `Team`, `Season` + date bounds, `Match` + optional `teamId`/`guest`/`sub`/`stravaId`), `TEAMS`, `SEASONS`; imports `matches.json` as `MATCHES`.
- `src/data/soccer-derive.ts` — add `matchTeam()`, `seasonTeamRows()`, `teamCount()`, `leagueLabel()`; `teamLines()` re-expressed via `seasonTeamRows()`.
- `src/data/soccer-derive.test.ts` — **new**; unit tests for derivations.
- `scripts/strava/parse.ts` — **new**; pure `parseActivity()` (no I/O).
- `scripts/strava/parse.test.ts` — **new**; the parser's test suite (the core of the plan).
- `scripts/strava/client.ts` — **new**; Strava REST wrappers (token refresh, list, detail).
- `scripts/strava/merge.ts` — **new**; pure 3-way merge of parsed drafts vs existing matches + snapshot.
- `scripts/strava/merge.test.ts` — **new**; merge unit tests.
- `scripts/strava/import.ts` — **new**; orchestrator entrypoint (I/O: read files, call client, merge, write files, print summary).
- `scripts/strava/auth.mjs` — **new**; one-time local OAuth helper to mint the refresh token.
- `src/data/.strava-snapshot.json` — **new**; per-activity snapshot of last-imported values (de-dup + change detection).
- `.github/workflows/strava-import.yml` — **new**; scheduled + manual workflow that runs the importer and opens a PR.
- `src/components/field-report/{SeasonLedger,MatchLog}.astro`, `src/components/field-report/field-report.ts`, `src/components/palette/PaletteMount.astro` — rendering updates for guest/sub matches.
- `docs/strava-import.md` — **new**; one-time setup runbook.

---

## PHASE A — Data model + guest/sub rendering

### Task 1: Test harness

**Files:**
- Modify: `package.json` (add `test` script)
- Create: `src/data/soccer-derive.test.ts`

**Interfaces:**
- Produces: the `npm test` command (`node --test`) that discovers `*.test.ts` under `src/` and `scripts/`.

- [ ] **Step 1: Add the test script.** In `package.json` `scripts`, add after `"check"`:

```json
"test": "node --test --experimental-strip-types \"src/**/*.test.ts\" \"scripts/**/*.test.ts\"",
```

- [ ] **Step 2: Write a failing test** against an existing derivation, `src/data/soccer-derive.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { allTime, record } from "./soccer-derive.ts";

test("all-time aggregates match the shipped register", () => {
    const at = allTime();
    assert.equal(at.played, 24);
    assert.equal(record(at), "14–3–7");
    assert.equal(at.goals, 25);
    assert.equal(at.assists, 7);
    assert.equal(at.seasons, 4);
});
```

- [ ] **Step 3: Run it.** Run: `npm test`
Expected: PASS (`tests 1`, `pass 1`). This proves the harness discovers and strips TS. If it fails to import `.ts`, confirm Node ≥ 22.6 (`node --version`; repo uses 25.x).

- [ ] **Step 4: Commit.**

```bash
git add package.json src/data/soccer-derive.test.ts
git commit -m "test: add node --test harness with a derivations smoke test"
```

### Task 2: Migrate matches to JSON + extend the data model

**Files:**
- Create: `src/data/matches.json`
- Modify: `src/data/soccer.ts`

**Interfaces:**
- Produces:
```ts
export const LEAGUES: readonly ["NYC Footy", "Volo", "NYC Soccer"];
export type League = (typeof LEAGUES)[number];
export interface Season { id; label; months; status; start: string; end?: string; teamIds: string[]; }
export interface Match {
    date: string; seasonId: string;
    result: "W" | "D" | "L"; score: [number, number];
    goals: number; goalsIsMinimum?: boolean; assists: number; note?: string;
    stravaId?: number; sub?: boolean;
    teamId?: string;
    guest?: { team?: string; league?: League; format?: string; level?: string };
}
export const MATCHES: Match[];  // imported from matches.json
```
- `Season.start`/`end` are ISO dates the importer uses to assign a match's `seasonId` by date.

- [ ] **Step 1:** Move the current 24-element `MATCHES` array into `src/data/matches.json` as a plain JSON array (drop the `as const`, quote all keys, no comments). Example (first + a minimum-goals entry shown; migrate all 24 verbatim, preserving order):

```json
[
  { "date": "2025-09-14", "seasonId": "fall-2025", "teamId": "charlie-cheers", "result": "W", "score": [3, 1], "goals": 1, "assists": 0 },
  { "date": "2025-12-07", "seasonId": "winter-2025-26", "teamId": "salmon-roe", "result": "W", "score": [5, 3], "goals": 2, "goalsIsMinimum": true, "assists": 1 }
]
```

- [ ] **Step 2:** In `src/data/soccer.ts`, replace `export type League = "NYC Footy" | "Volo";` with the list-derived type and add `"NYC Soccer"`:

```ts
export const LEAGUES = ["NYC Footy", "Volo", "NYC Soccer"] as const;
export type League = (typeof LEAGUES)[number];
```

- [ ] **Step 3:** Extend `Season` with machine date bounds (add to the interface and every season object). Interface:

```ts
export interface Season {
    id: string;
    label: string;
    months: string;
    status: "in-play" | "sealed";
    /** ISO date the season opens (inclusive) — used to assign imported matches. */
    start: string;
    /** ISO date the season closes (inclusive); omit while in-play. */
    end?: string;
    teamIds: string[];
}
```

Add bounds to the four seasons (dates chosen to bracket the existing matches, no overlap):

```ts
{ id: "fall-2025",      /* … */ start: "2025-09-01", end: "2025-11-15", /* … */ },
{ id: "winter-2025-26", /* … */ start: "2025-11-16", end: "2026-02-28", /* … */ },
{ id: "spring-2026",    /* … */ start: "2026-03-01", end: "2026-05-31", /* … */ },
{ id: "summer-2026",    /* … */ start: "2026-06-01", /* in-play: no end */ /* … */ },
```

- [ ] **Step 4:** Extend `Match` (optional guest/sub/strava fields; make `teamId` optional):

```ts
export interface Match {
    date: string;
    seasonId: string;
    result: "W" | "D" | "L";
    score: [number, number];
    goals: number;
    goalsIsMinimum?: boolean;
    assists: number;
    note?: string;
    /** Strava activity id — de-dup key for imported matches; omit for hand entry. */
    stravaId?: number;
    /** Explicit "(sub)" marker → SUB chip. */
    sub?: boolean;
    /** Rostered team; when present, team details come from TEAMS. */
    teamId?: string;
    /** Inline details for a guest/one-off appearance (used when teamId is absent). */
    guest?: {
        team?: string;
        league?: League;
        format?: string;
        level?: string;
    };
}
```

- [ ] **Step 5:** Replace the inline `MATCHES` array with a typed JSON import:

```ts
import matchesData from "./matches.json" with { type: "json" };
// `with { type: "json" }` is required so the Node importer (which imports this
// file) can load the JSON; Vite/Astro accept it too. Cast through unknown —
// JSON infers score as number[]/result as string, not the tuple/union.
export const MATCHES: Match[] = matchesData as unknown as Match[];
```

- [ ] **Step 6: Verify.** Run: `npx astro check` → Expected: 0 errors. Run: `npm test` → Expected: the Task 1 test still passes (aggregates unchanged by the migration).

- [ ] **Step 7: Commit.**

```bash
git add src/data/matches.json src/data/soccer.ts
git commit -m "refactor: matches to JSON; add league list, season date bounds, guest/sub match fields"
```

### Task 3: `matchTeam()` resolver

**Files:**
- Modify: `src/data/soccer-derive.ts`
- Modify: `src/data/soccer-derive.test.ts`

**Interfaces:**
- Consumes: `Match`, `TEAMS`, `teamById` (existing).
- Produces:
```ts
export interface MatchTeam {
    name: string;                       // team name, guest label, or "[Unknown team]"
    league: League | null;
    division?: string;                  // P-tier (rostered) or guest level
    format?: string;                    // "7v7" etc.
    venue?: "outdoor" | "indoor";
    isGuest: boolean;                   // teamId absent
    sub: boolean;                       // m.sub === true
    groupKey: string;                   // ledger grouping key (never merges distinct unknown teams)
}
export function matchTeam(m: Match, index?: number): MatchTeam;
```

- [ ] **Step 1: Write failing tests** in `soccer-derive.test.ts`:

```ts
import { matchTeam } from "./soccer-derive.ts";
import type { Match } from "./soccer.ts";

test("matchTeam resolves a rostered team from teamId", () => {
    const m = { teamId: "charlie-cheers" } as Match;
    const mt = matchTeam(m);
    assert.equal(mt.name, "Charlie Cheers FC");
    assert.equal(mt.league, "NYC Footy");
    assert.equal(mt.division, "P4");
    assert.equal(mt.format, "7v7");
    assert.equal(mt.isGuest, false);
    assert.equal(mt.groupKey, "charlie-cheers");
});

test("matchTeam falls back to guest label, then [Unknown team]", () => {
    const labelled = matchTeam({ guest: { team: "Real Sosobad", league: "NYC Soccer", level: "Div 2" } } as Match);
    assert.equal(labelled.name, "Real Sosobad");
    assert.equal(labelled.league, "NYC Soccer");
    assert.equal(labelled.division, "Div 2");
    assert.equal(labelled.isGuest, true);

    const unknown = matchTeam({ guest: { league: "NYC Soccer" } } as Match, 7);
    assert.equal(unknown.name, "[Unknown team]");
    assert.equal(unknown.groupKey, "guest:7"); // per-match, so two unknowns never merge
});

test("matchTeam reports the sub flag", () => {
    assert.equal(matchTeam({ teamId: "charlie-cheers", sub: true } as Match).sub, true);
    assert.equal(matchTeam({ teamId: "charlie-cheers" } as Match).sub, false);
});
```

- [ ] **Step 2: Run** `npm test` → Expected: FAIL (`matchTeam` is not exported).

- [ ] **Step 3: Implement** in `soccer-derive.ts`:

```ts
export interface MatchTeam {
    name: string;
    league: League | null;
    division?: string;
    format?: string;
    venue?: "outdoor" | "indoor";
    isGuest: boolean;
    sub: boolean;
    groupKey: string;
}

/** Resolve a match's display team, whether rostered (teamId) or a guest/inline
    appearance. `index` disambiguates unknown-team guests so they never merge. */
export function matchTeam(m: Match, index = 0): MatchTeam {
    const sub = m.sub === true;
    if (m.teamId) {
        const t = teamById(m.teamId);
        return {
            name: t.name,
            league: t.league,
            division: t.division,
            format: t.format,
            venue: t.venue,
            isGuest: false,
            sub,
            groupKey: t.id,
        };
    }
    const g = m.guest ?? {};
    const label = g.team?.trim();
    return {
        name: label || "[Unknown team]",
        league: g.league ?? null,
        division: g.level,
        format: g.format,
        venue: undefined,
        isGuest: true,
        sub,
        groupKey: label ? `guest:${label.toLowerCase()}` : `guest:${index}`,
    };
}
```

Add `League` to the existing `import type { … } from "./soccer";` line.

- [ ] **Step 4: Run** `npm test` → Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/data/soccer-derive.ts src/data/soccer-derive.test.ts
git commit -m "feat: matchTeam() resolver for rostered and guest appearances"
```

### Task 4: Derive season ledger rows from matches

**Files:**
- Modify: `src/data/soccer-derive.ts`
- Modify: `src/data/soccer-derive.test.ts`
- Modify: `src/components/field-report/SeasonLedger.astro`

**Interfaces:**
- Consumes: `matchesFor`, `matchTeam`, `aggregate` (internal), `Agg`.
- Produces:
```ts
export function seasonTeamRows(seasonId: string): { team: MatchTeam; agg: Agg }[];
export function teamCount(seasonId: string): number;
export function teamLines(seasonId: string): { team: Team; agg: Agg }[]; // kept for callers; see note
```
- `seasonTeamRows` groups the season's matches by `matchTeam().groupKey`, ordered by first-match date, aggregating each group. `teamCount` = number of distinct groups. This replaces the old `teamLines` (which iterated `Season.teamIds`) as the render source.

- [ ] **Step 1: Write failing tests:**

```ts
import { seasonTeamRows, teamCount } from "./soccer-derive.ts";

test("seasonTeamRows derives Summer 2026 team rows from matches", () => {
    const rows = seasonTeamRows("summer-2026");
    assert.deepEqual(rows.map((r) => r.team.name), [
        "Charlie Cheers FC", "FA Blast from the Past", "Salmon Roe United",
    ]);
    assert.equal(teamCount("summer-2026"), 3);
    const charlie = rows[0];
    assert.equal(charlie.agg.played, 3);
    assert.equal(charlie.agg.goals, 2);
    assert.equal(charlie.agg.assists, 1);
});
```

- [ ] **Step 2: Run** `npm test` → Expected: FAIL (not exported).

- [ ] **Step 3: Implement.** In `soccer-derive.ts`, add (and re-express `teamLines` so existing callers keep working during migration):

```ts
export function seasonTeamRows(
    seasonId: string,
): { team: MatchTeam; agg: Agg }[] {
    const matches = matchesFor(seasonId); // already date-ascending
    const order: string[] = [];
    const groups = new Map<string, Match[]>();
    matches.forEach((m, i) => {
        const key = matchTeam(m, i).groupKey;
        if (!groups.has(key)) {
            groups.set(key, []);
            order.push(key);
        }
        groups.get(key)!.push(m);
    });
    return order.map((key) => {
        const ms = groups.get(key)!;
        // Resolve display from the first match of the group.
        const team = matchTeam(ms[0], matches.indexOf(ms[0]));
        return { team, agg: aggregate(ms) };
    });
}

export function teamCount(seasonId: string): number {
    return seasonTeamRows(seasonId).length;
}
```

> Leave the existing `teamLines` function exactly as it is — its one remaining
> caller (`PaletteMount`) still uses it until Task 5, which updates that caller
> and then deletes `teamLines`. Do not modify `teamLines` in this task.

- [ ] **Step 4: Run** `npm test` → Expected: PASS.

- [ ] **Step 5: Update `SeasonLedger.astro`** to render from `seasonTeamRows`, adding the SUB chip and guest level/format. Replace the frontmatter's `teamLines` usage and the meta/team-row markup:

Frontmatter — replace `lines: teamLines(season.id)` with `rows: seasonTeamRows(season.id)`, and derive the team count from matches:

```ts
import { seasonTeamRows, teamCount, seasonAgg, record, goalsSuffix } from "../../data/soccer-derive";
// …
const n = teamCount(season.id);
// in the mapped object:
rows: seasonTeamRows(season.id),
meta: [
    season.months,
    `${n} TEAM${n === 1 ? "" : "S"}`,
    `${agg.played} MATCH${agg.played === 1 ? "" : "ES"}${inPlay ? " SO FAR" : ""}`,
    ...(inPlay ? [] : ["SEALED"]),
].join(" · "),
```

Team-row markup — iterate `rows` and render from `MatchTeam` (SUB chip when `team.sub`, division chip from `team.division`, `[Unknown team]` falls out of `team.name`):

```astro
{rows.map(({ team, agg }) => (
    <div class="lg-row">
        <span class="lg-team">{team.name}</span>
        <span class="lg-chips">
            {team.sub && <span class="lg-chip lg-chip-sub">SUB</span>}
            {team.league && (
                <span class="lg-chip lg-chip-league">{team.league.toUpperCase()}</span>
            )}
            {team.division && <span class="lg-chip lg-chip-div">{team.division}</span>}
            {team.format && (
                <span class="lg-chip lg-chip-format">
                    {team.format.toUpperCase()}{team.venue ? ` · ${team.venue.toUpperCase()}` : ""}
                </span>
            )}
        </span>
        <span class="lg-num lg-p"><span class="visually-hidden">played </span>{agg.played}</span>
        <span class="lg-num lg-wdl"><span class="visually-hidden">won–drawn–lost </span>{record(agg)}</span>
        <span class="lg-num lg-g"><span class="visually-hidden">goals </span>{agg.goals}{goalsSuffix("team", agg) && <span class="lg-dagger">†</span>}</span>
        <span class="lg-num lg-a"><span class="visually-hidden">assists </span>{agg.assists > 0 ? agg.assists : <span class="lg-nil">—</span>}</span>
    </div>
))}
```

Add the SUB chip style near `.lg-chip-div`:

```css
.lg-chip-sub {
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    color: var(--accent);
}
```

- [ ] **Step 6: Verify.** Run: `npx astro check` (0 errors), `npm test` (pass), and confirm the ledger still renders the four seasons by starting the dev server and checking `#field-report` (see the project's preview workflow). Expected: identical rows to before (no guest matches in the shipped data yet).

- [ ] **Step 7: Commit.**

```bash
git add src/data/soccer-derive.ts src/data/soccer-derive.test.ts src/components/field-report/SeasonLedger.astro
git commit -m "feat: derive ledger rows from matches; render SUB/guest chips"
```

### Task 5: Guest/sub rendering in match log, filters, and palette

**Files:**
- Modify: `src/components/field-report/MatchLog.astro`
- Modify: `src/components/field-report/PaletteMount.astro` (`src/components/palette/PaletteMount.astro`)
- Modify: `src/data/soccer-derive.ts` (delete bridge `teamLines`, add `leagueLabel` if needed)

**Interfaces:**
- Consumes: `matchTeam`, `logDate`, `sortedMatches`.
- Produces: match-log rows keyed by `matchTeam().groupKey` for the TEAM filter; palette field lines from `seasonTeamRows`.

- [ ] **Step 1: Update `MatchLog.astro` frontmatter** to resolve each row's team via `matchTeam` and build the log string inline (replacing `logFormat(team)` which assumed a rostered `Team`):

```ts
import { currentSeason, logDate, matchTeam, matchesFor } from "../../data/soccer-derive";
// rows newest-first:
const rows = matchesFor().reverse().map((m, i) => ({ m, team: matchTeam(m, i) }));
```

Add a helper in `soccer-derive.ts` that formats a `MatchTeam` into the log string (replaces `logFormat(team: Team)`):

```ts
/** Match-log league string from a resolved MatchTeam:
    "NYC FOOTY · P4 · 7V7 OUT" / "VOLO · 6V6 INDOOR" / "NYC SOCCER · DIV 2 · 7V7". */
export function matchTeamLog(mt: MatchTeam): string {
    const parts: string[] = [];
    if (mt.league) parts.push(mt.league.toUpperCase());
    if (mt.division) parts.push(mt.division.toUpperCase());
    const fmt = [
        mt.format?.toUpperCase(),
        mt.venue === "outdoor" ? "OUT" : mt.venue?.toUpperCase(),
    ].filter(Boolean).join(" ");
    if (fmt) parts.push(fmt);
    return parts.join(" · ");
}
```

- [ ] **Step 2: Update the row markup** — team name from `team.name`, log string from `matchTeamLog(team)`, `data-team={team.groupKey}`, and a SUB chip inline with the team name:

```astro
<td role="cell" class="ml-team">
    {team.name}{team.sub && <span class="ml-sub">SUB</span>}
    <span class="ml-league-inline">{matchTeamLog(team)}</span>
</td>
<td role="cell" class="ml-league">{matchTeamLog(team)}</td>
```

with `data-team={team.groupKey}` on the `<tr>` (was `team.id`), and add:

```css
.ml-sub {
    margin-left: 8px;
    font-family: var(--font-mono);
    font-size: 8px;
    letter-spacing: 0.12em;
    color: var(--accent);
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    padding: 2px 5px;
    vertical-align: middle;
}
```

- [ ] **Step 3: Update the TEAM filter options.** They must list the distinct groups actually present (rostered + guest), not just `TEAMS`. Replace the TEAM `FilterChip` options:

```ts
const teamOptions = [...new Map(rows.map(({ team }) => [team.groupKey, team.name])).entries()]
    .map(([value, label]) => ({ value, label: label.toUpperCase() }));
// options={[{ value: "all", label: "ALL" }, ...teamOptions]}
```

The row `data-team` already carries `groupKey`, so `field-report.ts`'s existing `state.team === row.dataset.team` filter works unchanged.

- [ ] **Step 4: Update `PaletteMount.astro`** — replace `teamLines(season.id)` with `seasonTeamRows(season.id)` and read `.team.name`:

```ts
import { allTime, currentSeason, goalsSuffix, record, seasonTeamRows } from "../../data/soccer-derive";
import type { Agg } from "../../data/soccer-derive";
// …
lines: season
    ? seasonTeamRows(season.id).map(({ team, agg }) => ({
          name: team.name,
          stat: statLine(agg, goalsSuffix("team", agg)),
      }))
    : [],
```

- [ ] **Step 5: Delete `logFormat`** (replaced by `matchTeamLog`) and the bridge `teamLines` from `soccer-derive.ts`. Grep to confirm no remaining callers: `grep -rn "logFormat\|teamLines" src` → Expected: no matches. Update `soccer-derive.test.ts` — replace any `logFormat` test with a `matchTeamLog` test:

```ts
import { matchTeamLog, matchTeam } from "./soccer-derive.ts";
test("matchTeamLog formats rostered and guest teams", () => {
    assert.equal(matchTeamLog(matchTeam({ teamId: "charlie-cheers" } as any)), "NYC FOOTY · P4 · 7V7 OUT");
    assert.equal(matchTeamLog(matchTeam({ teamId: "salmon-roe" } as any)), "VOLO · 6V6 INDOOR");
    assert.equal(
        matchTeamLog(matchTeam({ guest: { league: "NYC Soccer", level: "Div 2", format: "7v7" } } as any)),
        "NYC SOCCER · DIV 2 · 7V7",
    );
});
```

- [ ] **Step 6: Verify.** Run: `npm test`, `npx astro check`, `npx astro build` — all pass. Preview `#field-report`, open the MATCHES view, confirm rows and the TEAM filter still work.

- [ ] **Step 7: Commit.**

```bash
git add src/components/field-report/MatchLog.astro src/components/palette/PaletteMount.astro src/data/soccer-derive.ts src/data/soccer-derive.test.ts
git commit -m "feat: guest/sub matches in match log, TEAM filter, and palette"
```

---

## PHASE B — Strava importer

### Task 6: The tolerant parser (`parseActivity`)

**Files:**
- Create: `scripts/strava/parse.ts`
- Create: `scripts/strava/parse.test.ts`

**Interfaces:**
- Consumes: nothing from the app at runtime — teams/leagues are injected (pure).
- Produces:
```ts
export interface KnownTeam { id: string; name: string; league: string; }
export interface ParseInput {
    title: string; description: string;
    teams: KnownTeam[]; leagues: readonly string[];
}
export interface ParsedMatch {
    isMatch: boolean;                     // false → not a game (skip)
    teamId?: string;                      // matched rostered team
    guest?: { team?: string; league?: string; format?: string };
    sub: boolean;
    league?: string;                      // resolved league (from team or inline)
    result?: "W" | "D" | "L";             // derived from score
    score?: [number, number];
    goals: number; goalsIsMinimum: boolean; assists: number;
    flags: string[];                      // human-readable issues for the PR
    blocking: boolean;                    // true → cannot become valid data, report only
}
export function parseActivity(input: ParseInput): ParsedMatch;
export function normalize(s: string): string;
```
- Rules: it is a match iff title+description contain a `W/D/L` token or a `N–N` score. Result is derived from score; a contradicting letter adds a flag. Missing goals/assists → 0; `N+` → minimum. Team matched by normalized dictionary substring; `(sub)`/`sub`/`substitute` sets `sub` and (with an unmatched team) a guest label. Unknown league → flag + `blocking` (unless it's a blessed league). Unknown team on a **non-sub** match → flag + `blocking`; on a sub match → guest label, non-blocking.

- [ ] **Step 1: Write the test suite** `scripts/strava/parse.test.ts` (this is the core deliverable — cover every rule):

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseActivity, normalize } from "./parse.ts";

const TEAMS = [
    { id: "charlie-cheers", name: "Charlie Cheers FC", league: "NYC Footy" },
    { id: "fa-blast", name: "FA Blast from the Past", league: "NYC Footy" },
    { id: "salmon-roe", name: "Salmon Roe United", league: "Volo" },
];
const LEAGUES = ["NYC Footy", "Volo", "NYC Soccer"];
const parse = (title: string, description: string) =>
    parseActivity({ title, description, teams: TEAMS, leagues: LEAGUES });

test("normalize is case/whitespace/punctuation insensitive", () => {
    assert.equal(normalize("FA Blast  From the Past!"), normalize("fa blast from the past"));
});

test("a non-match Soccer activity is skipped", () => {
    assert.equal(parse("Sunday kickabout", "just messing around").isMatch, false);
});

test("parses the canonical post, deriving result from score", () => {
    const r = parse("FA Blast From the Past - NYC Footy", "W 4-1\n\n1 G");
    assert.equal(r.isMatch, true);
    assert.equal(r.teamId, "fa-blast");
    assert.equal(r.league, "NYC Footy");
    assert.deepEqual(r.score, [4, 1]);
    assert.equal(r.result, "W");
    assert.equal(r.goals, 1);
    assert.equal(r.assists, 0);        // omitted → 0
    assert.equal(r.blocking, false);
    assert.equal(r.flags.length, 0);
});

test("order/case independent: league first, lowercase", () => {
    const r = parse("nyc footy — charlie cheers fc", "l 1-2");
    assert.equal(r.teamId, "charlie-cheers");
    assert.equal(r.result, "L");
});

test("draw derived from equal score", () => {
    assert.equal(parse("Salmon Roe United", "2-2").result, "D");
});

test("W/L letter contradicting the score flags, score wins", () => {
    const r = parse("Charlie Cheers FC", "W 1-3");
    assert.equal(r.result, "L");
    assert.ok(r.flags.some((f) => /result/i.test(f)));
});

test("N+ sets the minimum flag; plain N is exact", () => {
    assert.equal(parse("Salmon Roe United", "W 6-3\n2+ G").goalsIsMinimum, true);
    assert.equal(parse("Salmon Roe United", "W 6-3\n2 G").goalsIsMinimum, false);
});

test("assists parsed independently", () => {
    const r = parse("Charlie Cheers FC", "W 4-2\n1 G\n1 A");
    assert.equal(r.goals, 1);
    assert.equal(r.assists, 1);
});

test("(sub) sets sub and keeps an unknown team as a guest label (non-blocking)", () => {
    const r = parse("Real Sosobad (sub) - NYC Soccer", "W 3-2\n1 G");
    assert.equal(r.sub, true);
    assert.equal(r.teamId, undefined);
    assert.equal(r.guest?.team, "Real Sosobad");
    assert.equal(r.league, "NYC Soccer");
    assert.equal(r.blocking, false);
});

test("unknown team on a NON-sub match is blocking", () => {
    const r = parse("Some Random FC - NYC Footy", "W 2-0");
    assert.equal(r.blocking, true);
    assert.ok(r.flags.some((f) => /team/i.test(f)));
});

test("unknown league is blocking and never auto-accepted", () => {
    const r = parse("Charlie Cheers FC - Beer League", "W 2-0");
    assert.equal(r.blocking, true);
    assert.ok(r.flags.some((f) => /league/i.test(f)));
});

test("omitted team on a sub match → guest with no label", () => {
    const r = parse("(sub) - NYC Soccer", "W 1-0");
    assert.equal(r.sub, true);
    assert.equal(r.guest?.team, undefined);
    assert.equal(r.blocking, false);
});

test("an obvious format token is captured for guests", () => {
    const r = parse("Real Sosobad (sub) - NYC Soccer 7v7", "W 3-2");
    assert.equal(r.guest?.format, "7v7");
});
```

- [ ] **Step 2: Run** `npm test` → Expected: FAIL (module missing).

- [ ] **Step 3: Implement** `scripts/strava/parse.ts`:

```ts
export interface KnownTeam { id: string; name: string; league: string; }
export interface ParseInput {
    title: string;
    description: string;
    teams: KnownTeam[];
    leagues: readonly string[];
}
export interface ParsedMatch {
    isMatch: boolean;
    teamId?: string;
    guest?: { team?: string; league?: string; format?: string };
    sub: boolean;
    league?: string;
    result?: "W" | "D" | "L";
    score?: [number, number];
    goals: number;
    goalsIsMinimum: boolean;
    assists: number;
    flags: string[];
    blocking: boolean;
}

export function normalize(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const SUB_RE = /\(?\bsub(stitute)?\b\)?/i;
const SCORE_RE = /(\d+)\s*[-–—]\s*(\d+)/;
const RESULT_RE = /\b([WDL])\b/i;
const FORMAT_RE = /\b(\d{1,2}\s*v\s*\d{1,2})\b/i;
const GOALS_RE = /(\d+)\s*(\+)?\s*g\b/i;
const ASSISTS_RE = /(\d+)\s*(\+)?\s*a\b/i;

export function parseActivity(input: ParseInput): ParsedMatch {
    const flags: string[] = [];
    const rawTitle = input.title ?? "";
    const rawDesc = input.description ?? "";
    const hay = `${rawTitle}\n${rawDesc}`;

    // 1. Is it a match? Needs a score or a W/D/L token in the description.
    const score = SCORE_RE.exec(rawDesc);
    const resultLetter = RESULT_RE.exec(rawDesc);
    const isMatch = Boolean(score || resultLetter);
    const base: ParsedMatch = {
        isMatch, sub: false, goals: 0, goalsIsMinimum: false, assists: 0,
        flags, blocking: false,
    };
    if (!isMatch) return base;

    // 2. Sub marker (strip before team matching so it can't corrupt the name).
    base.sub = SUB_RE.test(rawTitle);
    const cleanTitle = rawTitle.replace(SUB_RE, " ");
    const normTitle = normalize(cleanTitle);

    // 3. Team — normalized dictionary substring match.
    const team = input.teams.find((t) => normTitle.includes(normalize(t.name)));
    // 4. League — blessed dictionary substring match.
    const league = input.leagues.find((l) => normTitle.includes(normalize(l)));

    // 5. Format token (optional).
    const fmt = FORMAT_RE.exec(hay);
    const format = fmt ? fmt[1].replace(/\s+/g, "").toLowerCase() : undefined;

    // 6. Score → result (source of truth); contradicting letter flags.
    if (score) {
        const forGoals = Number(score[1]);
        const against = Number(score[2]);
        base.score = [forGoals, against];
        base.result = forGoals > against ? "W" : forGoals < against ? "L" : "D";
        if (resultLetter) {
            const letter = resultLetter[1].toUpperCase() as "W" | "D" | "L";
            if (letter !== base.result) {
                flags.push(`Result letter "${letter}" disagrees with score ${forGoals}–${against}; used ${base.result}.`);
            }
        }
    } else {
        // W/D/L present but no score — can't complete the record.
        base.result = resultLetter![1].toUpperCase() as "W" | "D" | "L";
        flags.push("No score found; fill it in.");
        base.blocking = true;
    }

    // 7. Goals / assists.
    const g = GOALS_RE.exec(hay);
    if (g) { base.goals = Number(g[1]); base.goalsIsMinimum = Boolean(g[2]); }
    const a = ASSISTS_RE.exec(hay);
    if (a) base.assists = Number(a[1]);

    // 8. Resolve team vs guest.
    if (team) {
        base.teamId = team.id;
        base.league = team.league;
        if (league && normalize(league) !== normalize(team.league)) {
            flags.push(`Post league "${league}" differs from ${team.name}'s league ${team.league}; kept ${team.league}.`);
        }
    } else {
        // No rostered team. Take the title text before the league as the label.
        const label = guestLabel(cleanTitle, league);
        base.guest = { team: label, format };
        if (league) {
            base.league = league;
            base.guest.league = league;
        } else {
            flags.push("Unrecognized league — add it to the blessed list or correct the post.");
            base.blocking = true;
        }
        if (!base.sub) {
            flags.push(`Unrecognized team${label ? ` "${label}"` : ""} on a non-sub match — define the team or mark it (sub).`);
            base.blocking = true;
        }
    }
    return base;
}

/** Best-effort inline label: the title minus a trailing "- <league>" tail. */
function guestLabel(cleanTitle: string, league?: string): string | undefined {
    let s = cleanTitle;
    if (league) {
        const idx = normalize(s).indexOf(normalize(league));
        if (idx >= 0) {
            // cut the raw title at the league's approximate position
            const before = s.slice(0, s.toLowerCase().indexOf(league.toLowerCase().slice(0, 3)));
            if (before.trim()) s = before;
        }
    }
    s = s.replace(/[-–—|·]+\s*$/g, "").trim();
    return s || undefined;
}
```

- [ ] **Step 4: Run** `npm test` → Expected: PASS (all parser cases green). Iterate the implementation until green; do not change the tests to match a wrong implementation.

- [ ] **Step 5: Commit.**

```bash
git add scripts/strava/parse.ts scripts/strava/parse.test.ts
git commit -m "feat: tolerant Strava activity parser with full test suite"
```

### Task 7: Strava REST client

**Files:**
- Create: `scripts/strava/client.ts`

**Interfaces:**
- Produces:
```ts
export interface StravaActivity { id: number; name: string; description: string; sport_type: string; start_date: string; }
export interface StravaCreds { clientId: string; clientSecret: string; refreshToken: string; }
export function refreshAccessToken(c: StravaCreds, fetchFn?: typeof fetch): Promise<string>;
export function listActivitiesSince(token: string, afterEpoch: number, fetchFn?: typeof fetch): Promise<Array<{ id: number; sport_type: string; start_date: string }>>;
export function getActivity(token: string, id: number, fetchFn?: typeof fetch): Promise<StravaActivity>;
```
- `fetchFn` is injectable so the importer's tests can mock the network. Endpoints: `POST https://www.strava.com/oauth/token` (grant_type=refresh_token); `GET https://www.strava.com/api/v3/athlete/activities?after=<epoch>&per_page=100` (summary — no description); `GET /api/v3/activities/<id>` (detail — has description). Scope required: `activity:read_all`.

- [ ] **Step 1: Implement** `scripts/strava/client.ts`:

```ts
export interface StravaActivity {
    id: number; name: string; description: string;
    sport_type: string; start_date: string;
}
export interface StravaCreds {
    clientId: string; clientSecret: string; refreshToken: string;
}

const BASE = "https://www.strava.com";

export async function refreshAccessToken(
    c: StravaCreds, fetchFn: typeof fetch = fetch,
): Promise<string> {
    const res = await fetchFn(`${BASE}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: c.clientId,
            client_secret: c.clientSecret,
            grant_type: "refresh_token",
            refresh_token: c.refreshToken,
        }),
    });
    if (!res.ok) throw new Error(`Strava token refresh failed: ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { access_token: string };
    return json.access_token;
}

export async function listActivitiesSince(
    token: string, afterEpoch: number, fetchFn: typeof fetch = fetch,
): Promise<Array<{ id: number; sport_type: string; start_date: string }>> {
    const out: Array<{ id: number; sport_type: string; start_date: string }> = [];
    for (let page = 1; page <= 10; page++) {
        const url = `${BASE}/api/v3/athlete/activities?after=${afterEpoch}&per_page=100&page=${page}`;
        const res = await fetchFn(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`Strava list failed: ${res.status} ${await res.text()}`);
        const batch = (await res.json()) as Array<{ id: number; sport_type: string; start_date: string }>;
        out.push(...batch);
        if (batch.length < 100) break;
    }
    return out;
}

export async function getActivity(
    token: string, id: number, fetchFn: typeof fetch = fetch,
): Promise<StravaActivity> {
    const res = await fetchFn(`${BASE}/api/v3/activities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Strava activity ${id} failed: ${res.status} ${await res.text()}`);
    return (await res.json()) as StravaActivity;
}
```

- [ ] **Step 2: Verify it type-checks.** Run: `npx tsc --noEmit --strict scripts/strava/client.ts` → Expected: no output (clean). (No unit test — it is a thin transport layer exercised via the importer's mocked tests in Task 8.)

- [ ] **Step 3: Commit.**

```bash
git add scripts/strava/client.ts
git commit -m "feat: Strava REST client (token refresh, list, activity detail)"
```

### Task 8: Merge logic (dedup + corrections)

**Files:**
- Create: `scripts/strava/merge.ts`
- Create: `scripts/strava/merge.test.ts`

**Interfaces:**
- Consumes: `Match` (structurally — redefine a minimal local type to keep the script app-independent), `ParsedMatch`.
- Produces:
```ts
export interface Snapshot { [stravaId: string]: { score: [number, number]; goals: number; assists: number; goalsIsMinimum: boolean }; }
export interface DraftMatch { /* the app Match shape, with stravaId set */ [k: string]: unknown; }
export interface MergeResult {
    matches: DraftMatch[];          // full new matches array to write
    snapshot: Snapshot;             // new snapshot to write
    added: string[];                // summary lines
    updated: string[];
    conflicts: string[];
    skipped: string[];
}
export function mergeImports(existing: DraftMatch[], snapshot: Snapshot, drafts: DraftMatch[]): MergeResult;
```
- Rules per draft (keyed by `stravaId`): **new** id → append to matches + snapshot, note "added". **Known** id: compare Strava-now vs snapshot (did Strava change?) and repo-now vs snapshot (did the human edit?). Strava unchanged → skip. Strava changed & repo unchanged → update the record + snapshot, note "updated: <diff>". Strava changed & repo changed the same field differently → leave repo record, note "conflict" (human resolves in PR). Repo edited, Strava unchanged → keep repo, skip.

- [ ] **Step 1: Write failing tests** `scripts/strava/merge.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeImports } from "./merge.ts";

const draft = (over = {}) => ({
    stravaId: 1, date: "2026-07-06", seasonId: "summer-2026", teamId: "charlie-cheers",
    result: "W", score: [4, 2], goals: 1, goalsIsMinimum: false, assists: 1, ...over,
});
const snap = (over = {}) => ({ "1": { score: [4, 2], goals: 1, assists: 1, goalsIsMinimum: false, ...over } });

test("new activity is added", () => {
    const r = mergeImports([], {}, [draft()]);
    assert.equal(r.matches.length, 1);
    assert.equal(r.added.length, 1);
    assert.equal(r.snapshot["1"].goals, 1);
});

test("known + unchanged on Strava is skipped", () => {
    const r = mergeImports([draft()], snap(), [draft()]);
    assert.equal(r.updated.length, 0);
    assert.equal(r.skipped.length, 1);
});

test("Strava correction with an unedited repo updates and diffs", () => {
    const r = mergeImports([draft()], snap(), [draft({ score: [3, 2], result: "W" })]);
    assert.equal(r.updated.length, 1);
    assert.match(r.updated[0], /4–2.*3–2|score/);
    assert.deepEqual(r.matches[0].score, [3, 2]);
    assert.deepEqual(r.snapshot["1"].score, [3, 2]);
});

test("repo hand-edit is respected when Strava is unchanged", () => {
    const edited = draft({ note: "great game" });
    const r = mergeImports([edited], snap(), [draft()]);
    assert.equal(r.matches[0].note, "great game");
    assert.equal(r.updated.length, 0);
});

test("Strava changed AND repo changed the same field → conflict, repo kept", () => {
    const repoEdited = draft({ score: [5, 2] });
    const stravaChanged = draft({ score: [3, 2] });
    const r = mergeImports([repoEdited], snap(), [stravaChanged]);
    assert.equal(r.conflicts.length, 1);
    assert.deepEqual(r.matches[0].score, [5, 2]); // repo wins; human resolves
});
```

- [ ] **Step 2: Run** `npm test` → Expected: FAIL.

- [ ] **Step 3: Implement** `scripts/strava/merge.ts`:

```ts
export interface SnapEntry { score: [number, number]; goals: number; assists: number; goalsIsMinimum: boolean; }
export interface Snapshot { [stravaId: string]: SnapEntry; }
export type DraftMatch = Record<string, any> & { stravaId?: number; score: [number, number]; goals: number; assists: number; goalsIsMinimum?: boolean; };
export interface MergeResult {
    matches: DraftMatch[]; snapshot: Snapshot;
    added: string[]; updated: string[]; conflicts: string[]; skipped: string[];
}

const snapOf = (m: DraftMatch): SnapEntry => ({
    score: m.score, goals: m.goals, assists: m.assists, goalsIsMinimum: Boolean(m.goalsIsMinimum),
});
const sameSnap = (a: SnapEntry, b: SnapEntry) =>
    a.score[0] === b.score[0] && a.score[1] === b.score[1] &&
    a.goals === b.goals && a.assists === b.assists && a.goalsIsMinimum === b.goalsIsMinimum;
const label = (m: DraftMatch) => `${m.date} ${m.teamId ?? m.guest?.team ?? "[Unknown team]"}`;

export function mergeImports(existing: DraftMatch[], snapshot: Snapshot, drafts: DraftMatch[]): MergeResult {
    const byId = new Map<number, number>(); // stravaId → index in matches
    const matches = existing.map((m, i) => {
        if (typeof m.stravaId === "number") byId.set(m.stravaId, i);
        return m;
    });
    const snap: Snapshot = { ...snapshot };
    const res: MergeResult = { matches, snapshot: snap, added: [], updated: [], conflicts: [], skipped: [] };

    for (const d of drafts) {
        const id = d.stravaId!;
        const key = String(id);
        if (!byId.has(id)) {
            matches.push(d);
            snap[key] = snapOf(d);
            res.added.push(`added ${label(d)} ${d.score[0]}–${d.score[1]}`);
            continue;
        }
        const idx = byId.get(id)!;
        const repo = matches[idx];
        const prev = snap[key];
        const stravaNow = snapOf(d);
        const stravaChanged = !prev || !sameSnap(prev, stravaNow);
        const repoChanged = prev ? !sameSnap(prev, snapOf(repo)) : false;
        if (!stravaChanged) { res.skipped.push(`unchanged ${label(repo)}`); continue; }
        if (repoChanged) {
            res.conflicts.push(`conflict ${label(repo)}: repo ${repo.score[0]}–${repo.score[1]} vs Strava ${d.score[0]}–${d.score[1]} (kept repo)`);
            continue;
        }
        matches[idx] = { ...repo, ...d };
        snap[key] = stravaNow;
        res.updated.push(`updated ${label(d)}: ${prev.score[0]}–${prev.score[1]} → ${d.score[0]}–${d.score[1]}`);
    }
    return res;
}
```

- [ ] **Step 4: Run** `npm test` → Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add scripts/strava/merge.ts scripts/strava/merge.test.ts
git commit -m "feat: 3-way merge for Strava imports (dedup, corrections, conflicts)"
```

### Task 9: Importer orchestrator

**Files:**
- Create: `scripts/strava/import.ts`
- Create: `src/data/.strava-snapshot.json` (seed `{}`)

**Interfaces:**
- Consumes: `parse`, `client`, `merge`, plus `TEAMS`/`SEASONS`/`LEAGUES` from `src/data/soccer.ts` and `matches.json`.
- Produces: rewrites `src/data/matches.json` (sorted by date asc, stable JSON), rewrites `src/data/.strava-snapshot.json`, and writes a markdown summary to `stdout` and to `$GITHUB_STEP_SUMMARY` / `import-summary.md`. Reads creds from `process.env.STRAVA_CLIENT_ID/SECRET/REFRESH_TOKEN`. Window: activities since the earliest in-play season's `start` (so in-season corrections are always re-scanned); a `--all` flag scans from the earliest season.

- [ ] **Step 1: Implement** `scripts/strava/import.ts`:

```ts
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { refreshAccessToken, listActivitiesSince, getActivity } from "./client.ts";
import { parseActivity } from "./parse.ts";
import { mergeImports, type DraftMatch, type Snapshot } from "./merge.ts";
import { TEAMS, SEASONS, LEAGUES } from "../../src/data/soccer.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const MATCHES_PATH = `${ROOT}src/data/matches.json`;
const SNAP_PATH = `${ROOT}src/data/.strava-snapshot.json`;

function seasonForDate(iso: string): string | null {
    const d = iso.slice(0, 10);
    for (const s of SEASONS) {
        if (d >= s.start && (!s.end || d <= s.end)) return s.id;
    }
    return null;
}

async function main() {
    const all = process.argv.includes("--all");
    const creds = {
        clientId: process.env.STRAVA_CLIENT_ID!,
        clientSecret: process.env.STRAVA_CLIENT_SECRET!,
        refreshToken: process.env.STRAVA_REFRESH_TOKEN!,
    };
    if (!creds.clientId || !creds.clientSecret || !creds.refreshToken) {
        throw new Error("Missing STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET / STRAVA_REFRESH_TOKEN");
    }

    const seasons = [...SEASONS].sort((a, b) => a.start.localeCompare(b.start));
    const inPlay = seasons.find((s) => s.status === "in-play");
    const since = all ? seasons[0].start : (inPlay?.start ?? seasons[0].start);
    const afterEpoch = Math.floor(new Date(since).getTime() / 1000);

    const token = await refreshAccessToken(creds);
    const list = await listActivitiesSince(token, afterEpoch);
    const soccer = list.filter((a) => a.sport_type === "Soccer");

    const teams = TEAMS.map((t) => ({ id: t.id, name: t.name, league: t.league }));
    const drafts: DraftMatch[] = [];
    const reports: string[] = [];

    for (const a of soccer) {
        const detail = await getActivity(token, a.id);
        const parsed = parseActivity({
            title: detail.name, description: detail.description ?? "",
            teams, leagues: LEAGUES,
        });
        if (!parsed.isMatch) continue;

        const seasonId = seasonForDate(detail.start_date);
        if (!seasonId) {
            reports.push(`⚠︎ ${detail.start_date.slice(0, 10)} "${detail.name}": no season covers this date — add/extend a season.`);
            continue;
        }
        if (parsed.blocking) {
            reports.push(`⚠︎ ${detail.start_date.slice(0, 10)} "${detail.name}": ${parsed.flags.join(" ")}`);
            continue;
        }
        const m: DraftMatch = {
            stravaId: a.id,
            date: detail.start_date.slice(0, 10),
            seasonId,
            result: parsed.result!,
            score: parsed.score!,
            goals: parsed.goals,
            assists: parsed.assists,
        };
        if (parsed.goalsIsMinimum) m.goalsIsMinimum = true;
        if (parsed.sub) m.sub = true;
        if (parsed.teamId) m.teamId = parsed.teamId;
        else m.guest = { ...parsed.guest, league: parsed.league };
        if (parsed.flags.length) reports.push(`ℹ ${m.date} "${detail.name}": ${parsed.flags.join(" ")}`);
        drafts.push(m);
    }

    const existing = JSON.parse(readFileSync(MATCHES_PATH, "utf8")) as DraftMatch[];
    const snapshot = JSON.parse(readFileSync(SNAP_PATH, "utf8")) as Snapshot;
    const merged = mergeImports(existing, snapshot, drafts);

    merged.matches.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    writeFileSync(MATCHES_PATH, JSON.stringify(merged.matches, null, 2) + "\n");
    writeFileSync(SNAP_PATH, JSON.stringify(merged.snapshot, null, 2) + "\n");

    const summary = [
        `## Strava import`,
        ``,
        `- Added: ${merged.added.length}`,
        `- Updated: ${merged.updated.length}`,
        `- Conflicts: ${merged.conflicts.length}`,
        `- Skipped (unchanged): ${merged.skipped.length}`,
        ...(merged.added.length ? [``, `### Added`, ...merged.added.map((s) => `- ${s}`)] : []),
        ...(merged.updated.length ? [``, `### Updated`, ...merged.updated.map((s) => `- ${s}`)] : []),
        ...(merged.conflicts.length ? [``, `### Conflicts (resolve by hand)`, ...merged.conflicts.map((s) => `- ${s}`)] : []),
        ...(reports.length ? [``, `### Needs attention`, ...reports.map((s) => `- ${s}`)] : []),
        ``,
        `_Change count: ${merged.added.length + merged.updated.length}_`,
    ].join("\n");
    writeFileSync(`${ROOT}import-summary.md`, summary + "\n");
    console.log(summary);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Seed the snapshot.** Create `src/data/.strava-snapshot.json` containing `{}` (the shipped hand-entered matches have no `stravaId`, so they're never touched by merge).

- [ ] **Step 3: Smoke-test with a mocked client.** Create a throwaway `scripts/strava/import.smoke.test.ts` that imports `mergeImports` + `parseActivity` and asserts an end-to-end parse→merge on a fixture activity produces one "added" line; run `npm test`; then delete the smoke test (it duplicates unit coverage — keep the suite lean). Do **not** commit the throwaway.

- [ ] **Step 4: Verify env-guard.** Run: `node --experimental-strip-types scripts/strava/import.ts` with no env vars → Expected: exits non-zero with the "Missing STRAVA_…" message (proves the guard). 

- [ ] **Step 5: Commit.**

```bash
git add scripts/strava/import.ts src/data/.strava-snapshot.json
git commit -m "feat: Strava import orchestrator (fetch, parse, season-assign, merge, summary)"
```

### Task 10: One-time OAuth helper + setup runbook

**Files:**
- Create: `scripts/strava/auth.mjs`
- Create: `docs/strava-import.md`

**Interfaces:**
- Produces: a local script that exchanges an authorization `code` for a refresh token, printed for the user to paste into GitHub secrets.

- [ ] **Step 1: Implement** `scripts/strava/auth.mjs`:

```js
// One-time: mint a Strava refresh token for the importer.
// Usage:
//   1. Create an API app at https://www.strava.com/settings/api (callback domain: localhost)
//   2. Open (replace CLIENT_ID):
//      https://www.strava.com/oauth/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:read_all
//   3. Approve; copy the `code` query param from the redirected URL.
//   4. Run: STRAVA_CLIENT_ID=.. STRAVA_CLIENT_SECRET=.. node scripts/strava/auth.mjs <code>
const [code] = process.argv.slice(2);
if (!code) { console.error("Usage: node scripts/strava/auth.mjs <authorization_code>"); process.exit(1); }
const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
    }),
});
if (!res.ok) { console.error(await res.text()); process.exit(1); }
const json = await res.json();
console.log("\nAdd these as GitHub Actions repository secrets:\n");
console.log("STRAVA_CLIENT_ID     =", process.env.STRAVA_CLIENT_ID);
console.log("STRAVA_CLIENT_SECRET = <your client secret>");
console.log("STRAVA_REFRESH_TOKEN =", json.refresh_token);
```

- [ ] **Step 2: Write** `docs/strava-import.md` documenting: creating the Strava API app; the authorize URL; running `auth.mjs`; adding the three secrets under **Settings → Secrets and variables → Actions**; that the workflow runs weekly and on demand and opens a PR; the post conventions (`(sub)`, `N+` for minimum, put team + league in the title, result/score/goals/assists in the description; write goals only when scored); and how to add a new team/league/season when the PR flags one. Include the exact conventions table.

- [ ] **Step 3: Commit.**

```bash
git add scripts/strava/auth.mjs docs/strava-import.md
git commit -m "docs: Strava importer OAuth helper and setup runbook"
```

### Task 11: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/strava-import.yml`

**Interfaces:**
- Consumes: `import.ts`, the three secrets, `peter-evans/create-pull-request@v6`.
- Produces: a scheduled + manually-dispatchable job that runs the importer and opens/updates a PR when `matches.json`/snapshot change.

- [ ] **Step 1: Implement** `.github/workflows/strava-import.yml`:

```yaml
name: Strava import
on:
  schedule:
    - cron: "0 12 * * 1" # Mondays 12:00 UTC
  workflow_dispatch:
    inputs:
      all:
        description: "Rescan all seasons (not just the current one)"
        type: boolean
        default: false
permissions:
  contents: write
  pull-requests: write
jobs:
  import:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - name: Run importer
        env:
          STRAVA_CLIENT_ID: ${{ secrets.STRAVA_CLIENT_ID }}
          STRAVA_CLIENT_SECRET: ${{ secrets.STRAVA_CLIENT_SECRET }}
          STRAVA_REFRESH_TOKEN: ${{ secrets.STRAVA_REFRESH_TOKEN }}
        run: node --experimental-strip-types scripts/strava/import.ts ${{ inputs.all && '--all' || '' }}
      - name: Append summary
        if: always()
        run: cat import-summary.md >> "$GITHUB_STEP_SUMMARY" || true
      - name: Open pull request
        uses: peter-evans/create-pull-request@v6
        with:
          branch: strava/import
          title: "Strava import — new match data"
          body-path: import-summary.md
          commit-message: "data: import matches from Strava"
          add-paths: |
            src/data/matches.json
            src/data/.strava-snapshot.json
          delete-branch: true
```

> `node-version: "22"` — first LTS with stable `--experimental-strip-types`; matches the repo's local 25.x behavior. If the importer emits no file changes, `create-pull-request` is a no-op (no PR, no error).

- [ ] **Step 2: Verify YAML + import path locally.** Run: `node --experimental-strip-types --check scripts/strava/import.ts` → Expected: no output. Confirm `import-summary.md` is git-ignored is **not** needed (it lives at repo root and is only produced in CI; add it to `.gitignore` to avoid accidental local commits):

```bash
printf "\n# Strava importer scratch\nimport-summary.md\n" >> .gitignore
```

- [ ] **Step 3: Commit.**

```bash
git add .github/workflows/strava-import.yml .gitignore
git commit -m "ci: weekly + manual Strava import workflow opening a review PR"
```

### Task 12: Full verification + docs cross-links

**Files:**
- Modify: `src/data/soccer.ts` (header comment), `docs/strava-import.md` (link from the data file)

- [ ] **Step 1:** Add to `matches.json`'s consuming comment in `soccer.ts` a one-liner: `// Matches live in matches.json; append by hand or let the Strava importer (docs/strava-import.md) open a PR.`
- [ ] **Step 2: Full gate.** Run in order: `npm test` (all suites pass), `npx astro check` (0 errors), `npx astro build` (Complete!). Expected: all green.
- [ ] **Step 3: Format touched files.** Run: `npx prettier --write --plugin=prettier-plugin-astro "src/components/field-report/*.astro" "src/components/palette/PaletteMount.astro"` and `npx prettier --write "scripts/strava/*.ts" "src/data/*.ts"`.
- [ ] **Step 4: Preview check.** Start the dev server; hand-add one guest match to `matches.json` (e.g. `{ "date": "2026-07-06", "seasonId": "summer-2026", "sub": true, "guest": { "team": "Real Sosobad", "league": "NYC Soccer", "level": "Div 2" }, "result": "W", "score": [3, 2], "goals": 1, "assists": 0 }`); confirm it appears in the ledger and match log with a SUB chip, counts in the tiles, and the TEAM filter lists it; then remove the test entry.
- [ ] **Step 5: Commit.**

```bash
git add -A
git commit -m "chore: verify importer end to end; link runbook from data file"
```

---

## Self-Review

**Spec coverage:** Strava read (T7) · "Soccer" + result/score filter (T6 `isMatch`, T9) · tolerant dictionary parse, order/case independent (T6) · result from score (T6) · missing G/A = 0, `N+` minimum (T6) · blessed leagues, unknown flagged never created (T2 `LEAGUES`, T6) · substitute/guest with optional teamId + inline label/league/format/level + SUB chip + `[Unknown team]` (T2–T5) · counts toward totals (T4 derive-from-matches; aggregates already sum all matches) · dedup by activity id + corrections as diffs + respect hand-edits + conflict flag (T8) · review PR, valid-data-only, blocking reported not written (T9, T11) · one-time OAuth + secrets (T10) · scheduled + manual (T11). Covered.

**Placeholder scan:** No "TBD"/"handle edge cases"/"similar to". The T4 bridge `teamLines` is explicitly flagged as temporary and deleted in T5 Step 5.

**Type consistency:** `matchTeam(): MatchTeam` with `groupKey` used by `seasonTeamRows` (T3→T4) and `MatchLog` `data-team` (T5). `ParsedMatch` fields (T6) map 1:1 to `DraftMatch` construction (T9). `Snapshot`/`SnapEntry` identical across T8/T9. `matchTeamLog(MatchTeam)` replaces `logFormat(Team)` and its old test (T5 Step 5).
