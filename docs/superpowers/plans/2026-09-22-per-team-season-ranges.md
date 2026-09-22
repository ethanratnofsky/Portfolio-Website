# Per-Team-Season Date Ranges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every team-season its own start/end dates, derive season ranges from them, and invert the Strava importer to resolve name+date → team → season, so a new season is caught on its first match instead of being silently absorbed by an open-ended in-play season.

**Architecture:** `Team` gains `start`/`end`; `Season` loses its authored `start`/`end` in favour of a range derived from its teams (`seasonRange()` in `soccer-derive.ts`). The parser scopes team resolution by date rather than by a pre-derived season, reads `seasonId` back off the resolved entry, and blocks when a title names a rostered team whose run doesn't cover the match date. Three build-time invariants lock the data.

**Tech Stack:** TypeScript, Astro 5, `node --test --experimental-strip-types`, Prettier (4-space, per `.prettierrc`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-09-22-per-team-season-ranges-design.md`. Read it first.
- Run the full suite with `npm test`. Baseline before any change: **63 passing**.
- Never reduce coverage: no test is deleted, only rewritten in place when its input shape changes.
- Team ID scheme is `<club-slug>-<seasonId>` for all 15 entries, no exceptions.
- All dates are ISO `YYYY-MM-DD` strings; compare them lexicographically, never via `new Date()`.
- `matches.json` is written by the importer with `JSON.stringify(x, null, 4)`; keep 4-space indent and a trailing newline.
- Never push, never open a PR, never merge. Work stays on branch `fix/per-team-season-ranges`.
- Do not touch `.strava-snapshot.json` — it records Strava-derived stats only, and none of those change.

---

### Task 1: Team-season date ranges + year-qualified IDs

Adds `start`/`end` to every team-season, renames all 12 existing IDs to
`<club-slug>-<seasonId>`, and locks the name-overlap precondition with an
invariant. No behaviour changes yet — nothing reads the new fields.

**Files:**

- Modify: `src/data/soccer.ts` (Team interface, TEAMS, SEASONS.teamIds)
- Modify: `src/data/matches.json` (teamId on 71 rostered rows)
- Modify: `src/data/soccer-derive.test.ts` (3 references to `salmon-roe`)

**Interfaces:**

- Consumes: nothing.
- Produces: `Team.start: string`, `Team.end?: string`. Renamed IDs used by every
  later task: `fa-orange-julius-fall-2025`, `fa-rapinoe-grigio-fall-2025`,
  `fa-pretty-in-pink-fall-2025`, `charlie-cheers-winter-2025-26`,
  `formerly-fate-winter-2025-26`, `fa-goalmates-winter-2025-26`,
  `charlie-cheers-spring-2026`, `abcde-fc-spring-2026`,
  `fa-seven-wonders-spring-2026`, `charlie-cheers-summer-2026`,
  `salmon-roe-summer-2026`, `fa-blast-summer-2026`.

- [ ] **Step 1: Write the failing invariant test**

Append to `src/data/soccer-derive.test.ts`:

```ts
// Name+date team resolution (scripts/strava/parse.ts) assumes a club never
// plays two of its own team-seasons at once: the display name plus the match
// date must identify exactly one entry. Overlapping runs under one name would
// make that assumption false and silently reintroduce ambiguity.
test("no two team entries sharing a name have overlapping runs", () => {
    const byName = new Map<string, typeof TEAMS>();
    for (const t of TEAMS) {
        const key = t.name.toLowerCase();
        byName.set(key, [...(byName.get(key) ?? []), t]);
    }
    const offenders: string[] = [];
    for (const [, entries] of byName) {
        const sorted = [...entries].sort((a, b) =>
            a.start.localeCompare(b.start)
        );
        for (let i = 1; i < sorted.length; i++) {
            const prev = sorted[i - 1];
            const cur = sorted[i];
            // An open-ended previous run overlaps anything that follows it.
            if (!prev.end || prev.end >= cur.start) {
                offenders.push(
                    `${prev.id} (${prev.start}–${prev.end ?? "open"}) overlaps ${cur.id} (${cur.start}–)`
                );
            }
        }
    }
    assert.deepEqual(offenders, []);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test 2>&1 | grep -A5 "overlapping runs"`
Expected: FAIL — `Property 'start' does not exist on type 'Team'` (or a runtime
`undefined` comparison). The field doesn't exist yet.

- [ ] **Step 3: Add start/end to the Team interface**

In `src/data/soccer.ts`, replace the `venue` line's closing brace region so the
interface ends:

```ts
    /** e.g. "7v7" | "8v8" | "6v6" */
    format: string;
    venue: "outdoor" | "indoor";
    /** ISO date this team-season's run opens (inclusive). Authoritative where
        known; a few early entries are inferred from first/last recorded match
        (noted per entry). */
    start: string;
    /** ISO date the run closes (inclusive); omit while it's still going. */
    end?: string;
}
```

- [ ] **Step 4: Replace the TEAMS array wholesale**

In `src/data/soccer.ts`, replace the entire `export const TEAMS: Team[] = [ … ];`
block with:

```ts
export const TEAMS: Team[] = [
    {
        id: "fa-orange-julius-fall-2025",
        name: "FA Orange Julius",
        seasonId: "fall-2025",
        league: "NYC Footy",
        division: "P3",
        format: "5v5",
        venue: "indoor",
        start: "2025-10-06",
        end: "2025-12-01",
    },
    {
        id: "fa-rapinoe-grigio-fall-2025",
        name: "FA Rapinoe Grigio",
        seasonId: "fall-2025",
        league: "NYC Footy",
        division: "P3",
        format: "5v5",
        venue: "indoor",
        start: "2025-10-06",
        end: "2025-12-01",
    },
    {
        id: "fa-pretty-in-pink-fall-2025",
        name: "FA Pretty in Pink",
        seasonId: "fall-2025",
        league: "NYC Footy",
        division: "P4",
        format: "7v7",
        venue: "indoor",
        // Inferred from first/last recorded match.
        start: "2025-11-16",
        end: "2025-12-14",
    },
    {
        id: "charlie-cheers-winter-2025-26",
        name: "Charlie Cheers FC",
        seasonId: "winter-2025-26",
        league: "Volo",
        format: "7v7",
        venue: "indoor",
        start: "2026-01-14",
        end: "2026-02-25",
    },
    {
        id: "formerly-fate-winter-2025-26",
        name: "Formerly Fate",
        seasonId: "winter-2025-26",
        league: "NYC Footy",
        division: "P3",
        format: "5v5",
        venue: "indoor",
        // Inferred from first/last recorded match.
        start: "2025-12-08",
        end: "2026-02-02",
    },
    {
        id: "fa-goalmates-winter-2025-26",
        name: "FA Goalmates",
        seasonId: "winter-2025-26",
        league: "NYC Footy",
        division: "P3",
        format: "5v5",
        venue: "indoor",
        start: "2026-01-05",
        end: "2026-03-09",
    },
    {
        id: "charlie-cheers-spring-2026",
        name: "Charlie Cheers FC",
        seasonId: "spring-2026",
        league: "Volo",
        format: "7v7",
        venue: "outdoor",
        start: "2026-04-07",
        end: "2026-05-26",
    },
    {
        id: "abcde-fc-spring-2026",
        name: "ABCDE FC",
        seasonId: "spring-2026",
        league: "NYC Footy",
        division: "P3",
        format: "7v7",
        venue: "outdoor",
        start: "2026-04-05",
        end: "2026-06-21",
    },
    {
        id: "fa-seven-wonders-spring-2026",
        name: "FA Seven Wonders of the Goal",
        seasonId: "spring-2026",
        league: "NYC Footy",
        division: "P3/P4",
        format: "7v7",
        venue: "outdoor",
        start: "2026-04-06",
        end: "2026-06-15",
    },
    {
        id: "charlie-cheers-summer-2026",
        name: "Charlie Cheers FC",
        seasonId: "summer-2026",
        league: "NYC Footy",
        division: "P2/P3",
        format: "6v6",
        venue: "outdoor",
        start: "2026-06-17",
        end: "2026-08-19",
    },
    {
        id: "salmon-roe-summer-2026",
        // formerly posted on Strava as "FA Goal Oriented"
        name: "Salmon Roe United",
        seasonId: "summer-2026",
        league: "NYC Footy",
        division: "P3",
        format: "7v7",
        venue: "outdoor",
        start: "2026-06-29",
        end: "2026-08-31",
    },
    {
        id: "fa-blast-summer-2026",
        name: "FA Blast from the Pass",
        seasonId: "summer-2026",
        league: "NYC Footy",
        division: "P3",
        format: "7v7",
        venue: "outdoor",
        start: "2026-06-28",
        end: "2026-08-30",
    },
];
```

- [ ] **Step 5: Update SEASONS.teamIds to the new IDs**

In `src/data/soccer.ts`, change only the four `teamIds` arrays (leave `start`,
`end`, `label`, `months`, `status` alone for now — Task 3 removes the dates):

```ts
        teamIds: [
            "fa-orange-julius-fall-2025",
            "fa-rapinoe-grigio-fall-2025",
            "fa-pretty-in-pink-fall-2025",
        ],
```

```ts
        teamIds: [
            "charlie-cheers-winter-2025-26",
            "formerly-fate-winter-2025-26",
            "fa-goalmates-winter-2025-26",
        ],
```

```ts
        teamIds: [
            "charlie-cheers-spring-2026",
            "abcde-fc-spring-2026",
            "fa-seven-wonders-spring-2026",
        ],
```

```ts
        teamIds: [
            "charlie-cheers-summer-2026",
            "salmon-roe-summer-2026",
            "fa-blast-summer-2026",
        ],
```

Order within each array is unchanged from the original — it drives ledger row
order in `seasonTeamRows()`.

- [ ] **Step 6: Rewrite teamId across matches.json**

The old IDs are prefixes of the new ones, so a naive substring replace would
double-apply. Use an exact whole-value map:

```bash
cd /Users/ethanratnofsky/Projects/Portfolio-Website && python3 - <<'PY'
import json, pathlib
RENAME = {
    "fa-orange-julius": "fa-orange-julius-fall-2025",
    "fa-rapinoe-grigio": "fa-rapinoe-grigio-fall-2025",
    "fa-pretty-in-pink": "fa-pretty-in-pink-fall-2025",
    "charlie-cheers-winter": "charlie-cheers-winter-2025-26",
    "formerly-fate": "formerly-fate-winter-2025-26",
    "fa-goalmates": "fa-goalmates-winter-2025-26",
    "charlie-cheers-spring": "charlie-cheers-spring-2026",
    "abcde-fc": "abcde-fc-spring-2026",
    "fa-seven-wonders": "fa-seven-wonders-spring-2026",
    "charlie-cheers-summer": "charlie-cheers-summer-2026",
    "salmon-roe": "salmon-roe-summer-2026",
    "fa-blast": "fa-blast-summer-2026",
}
p = pathlib.Path("src/data/matches.json")
ms = json.loads(p.read_text())
n = 0
for m in ms:
    tid = m.get("teamId")
    if tid is None:
        continue
    assert tid in RENAME, f"unmapped teamId {tid!r}"
    m["teamId"] = RENAME[tid]
    n += 1
p.write_text(json.dumps(ms, indent=4) + "\n")
print(f"renamed {n} teamId values across {len(ms)} matches")
PY
```

Expected: `renamed 70 teamId values across 73 matches` (three rows are guests
with no `teamId`: Real Sosobad, and ABCDE FC twice).

- [ ] **Step 7: Update the three real-ID references in soccer-derive.test.ts**

```bash
cd /Users/ethanratnofsky/Projects/Portfolio-Website && sed -i '' 's/"salmon-roe"/"salmon-roe-summer-2026"/g' src/data/soccer-derive.test.ts && grep -n "salmon-roe" src/data/soccer-derive.test.ts
```

Expected: three lines, all reading `salmon-roe-summer-2026`. Do **not** run this
against `scripts/strava/parse.test.ts` — its `salmon-roe` is a local fixture, not
a reference to `TEAMS`.

- [ ] **Step 8: Run the full suite**

Run: `npm test 2>&1 | tail -10`
Expected: PASS, **64 tests** (63 baseline + the new overlap invariant). If the
pinned `Spring 2026 record is 15–1–7` or the Spring `seasonTeamRows` test fails,
a `teamId` was rewritten wrongly in Step 6 — fix before continuing.

- [ ] **Step 9: Commit**

```bash
cd /Users/ethanratnofsky/Projects/Portfolio-Website && npx prettier --write src/data/soccer.ts src/data/soccer-derive.test.ts src/data/matches.json && git add src/data/soccer.ts src/data/soccer-derive.test.ts src/data/matches.json && git commit -m "data(soccer): give each team-season its own run + year-qualified ids

Each TEAMS entry now carries the start/end of its own run, and every id
follows <club-slug>-<seasonId> so a club playing the same season in a
later year can't collide. Ranges are authoritative except FA Pretty in
Pink and Formerly Fate, inferred from first/last recorded match and
commented as such.

Invariant added: no two entries sharing a team name have overlapping
runs — the precondition name+date resolution will depend on.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Fall 2026 data, driven by the date-in-range invariant

The invariant written here fails on exactly the five misfiled matches, then the
Fall 2026 data makes it pass. This is the user-visible fix.

**Files:**

- Modify: `src/data/soccer-derive.test.ts` (new invariant)
- Modify: `src/data/soccer.ts` (3 team entries, 1 season, seal summer)
- Modify: `src/data/matches.json` (5 match rows)

**Interfaces:**

- Consumes: `Team.start`/`Team.end` from Task 1.
- Produces: team IDs `charlie-cheers-fall-2026`, `abcde-fc-fall-2026`,
  `salmon-roe-fall-2026`; season id `fall-2026` (the only `in-play` season).

- [ ] **Step 1: Write the failing invariant test**

Append to `src/data/soccer-derive.test.ts`:

```ts
// The bug this model fixes: an open-ended in-play season let seasonForDate
// absorb every later date, so five Fall 2026 matches were filed under
// summer-2026 against their teams' summer entries. A rostered match played
// outside its own team-season's run is always a mis-assignment.
test("every rostered match falls inside its team-season's run", () => {
    const offenders = MATCHES.filter((m) => {
        if (!m.teamId) return false;
        const t = TEAMS.find((t) => t.id === m.teamId);
        if (!t) return true;
        return m.date < t.start || (t.end !== undefined && m.date > t.end);
    }).map((m) => `${m.date} ${m.teamId}`);
    assert.deepEqual(offenders, []);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test 2>&1 | grep -A12 "inside its team-season"`
Expected: FAIL, listing exactly three entries:

```
'2026-09-01 charlie-cheers-summer-2026',
'2026-09-14 salmon-roe-summer-2026',
'2026-09-15 charlie-cheers-summer-2026'
```

The two ABCDE FC rows are absent because the invariant skips guests — Step 5
converts them to rostered, which brings them under it.

- [ ] **Step 3: Add the three Fall 2026 team entries**

Append inside the `TEAMS` array in `src/data/soccer.ts`, after
`fa-blast-summer-2026`:

```ts
    {
        id: "charlie-cheers-fall-2026",
        name: "Charlie Cheers FC",
        seasonId: "fall-2026",
        league: "NYC Footy",
        division: "P2/P3",
        format: "7v7",
        venue: "outdoor",
        start: "2026-09-01",
        end: "2026-11-10",
    },
    {
        id: "abcde-fc-fall-2026",
        name: "ABCDE FC",
        seasonId: "fall-2026",
        league: "NYC Footy",
        division: "P3",
        format: "7v7",
        venue: "outdoor",
        start: "2026-09-13",
        end: "2026-11-22",
    },
    {
        id: "salmon-roe-fall-2026",
        name: "Salmon Roe United",
        seasonId: "fall-2026",
        league: "NYC Footy",
        division: "P4",
        format: "7v7",
        venue: "outdoor",
        start: "2026-09-14",
        end: "2026-11-30",
    },
```

Note Charlie Cheers moves 6v6 → 7v7 and Salmon Roe drops P3 → P4 for Fall.

- [ ] **Step 4: Seal Summer 2026 and add the Fall 2026 season**

In `src/data/soccer.ts`, change the `summer-2026` entry's `status` from
`"in-play"` to `"sealed"`, and append a new season after it:

```ts
    {
        id: "fall-2026",
        label: "Fall 2026",
        months: "SEP — NOV",
        status: "in-play",
        start: "2026-09-01",
        teamIds: [
            "charlie-cheers-fall-2026",
            "abcde-fc-fall-2026",
            "salmon-roe-fall-2026",
        ],
    },
```

`start` is carried here only so the file still typechecks; Task 3 deletes
`start`/`end` from every season.

- [ ] **Step 5: Reassign the five misfiled matches**

```bash
cd /Users/ethanratnofsky/Projects/Portfolio-Website && python3 - <<'PY'
import json, pathlib
# stravaId → (teamId, seasonId). The two ABCDE FC rows were only guests
# because season-scoped resolution found no summer entry for them; neither
# carries sub: true, so both become rostered and drop their guest object.
FIX = {
    19998218835: ("charlie-cheers-fall-2026", "fall-2026"),
    20165124400: ("abcde-fc-fall-2026", "fall-2026"),
    20178464289: ("salmon-roe-fall-2026", "fall-2026"),
    20192987983: ("charlie-cheers-fall-2026", "fall-2026"),
    20262136422: ("abcde-fc-fall-2026", "fall-2026"),
}
p = pathlib.Path("src/data/matches.json")
ms = json.loads(p.read_text())
seen = set()
for m in ms:
    sid = m.get("stravaId")
    if sid not in FIX:
        continue
    assert not m.get("sub"), f"{sid} is marked sub — do not convert to rostered"
    team, season = FIX[sid]
    m["teamId"] = team
    m["seasonId"] = season
    m.pop("guest", None)
    seen.add(sid)
    print(f"{m['date']} -> {team} / {season}")
assert seen == set(FIX), f"missing: {set(FIX) - seen}"
p.write_text(json.dumps(ms, indent=4) + "\n")
PY
```

Expected output, five lines:

```
2026-09-01 -> charlie-cheers-fall-2026 / fall-2026
2026-09-13 -> abcde-fc-fall-2026 / fall-2026
2026-09-14 -> salmon-roe-fall-2026 / fall-2026
2026-09-15 -> charlie-cheers-fall-2026 / fall-2026
2026-09-20 -> abcde-fc-fall-2026 / fall-2026
```

- [ ] **Step 6: Run the full suite**

Run: `npm test 2>&1 | tail -10`
Expected: PASS, **65 tests**. `allTime().seasons` now reads 5, which the
"all-time aggregates" test asserts against `SEASONS.length` — it stays green
because it compares derived to derived.

- [ ] **Step 7: Commit**

```bash
cd /Users/ethanratnofsky/Projects/Portfolio-Website && npx prettier --write src/data/soccer.ts src/data/soccer-derive.test.ts src/data/matches.json && git add src/data/soccer.ts src/data/soccer-derive.test.ts src/data/matches.json && git commit -m "data(soccer): open Fall 2026, seal Summer 2026, fix 5 misfiled matches

Fall 2026 started per-team — Charlie Cheers FC Sep 1, ABCDE FC Sep 13,
Salmon Roe United Sep 14 — but summer-2026 was in-play with no end, so
seasonForDate filed every September match under Summer. Charlie Cheers
and Salmon Roe resolved to their summer entries; ABCDE FC had no summer
entry and fell through to a phantom guest row twice.

Charlie Cheers moves 6v6 to 7v7 and Salmon Roe drops P3 to P4 for Fall.
FA Blast from the Pass played Summer only and gets no Fall entry.

Invariant added: every rostered match falls inside its team-season's
run. It fails on exactly these five matches before the fix.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Derive season ranges from teams

**Files:**

- Modify: `src/data/soccer-derive.ts` (add `seasonRange`, `seasonRanges`)
- Modify: `src/data/soccer.ts` (drop `Season.start`/`end`)
- Modify: `scripts/strava/dates.ts` (`seasonForDate` → `seasonsForDate`)
- Modify: `scripts/strava/dates.test.ts`
- Modify: `src/data/soccer-derive.test.ts`
- Modify: `scripts/strava/import.ts` (wire up derived ranges)

**Interfaces:**

- Consumes: `Team.start`/`end` (Task 1), `fall-2026` (Task 2).
- Produces:
    - `interface SeasonRange { id: string; start: string; end?: string }` —
      declared once, in `soccer-derive.ts`; `dates.ts` imports it as a type
    - `seasonRange(seasonId: string): SeasonRange | undefined`
    - `seasonRanges(): SeasonRange[]`
    - `seasonsForDate(iso: string, ranges: readonly SeasonRange[]): string[]`

- [ ] **Step 1: Write the failing seasonRange test**

Append to `src/data/soccer-derive.test.ts` (add `seasonRange` and `seasonRanges`
to the existing import from `./soccer-derive.ts`):

```ts
test("seasonRange derives a season's window from its teams' runs", () => {
    // spring-2026: charlie-cheers Apr 7–May 26, abcde-fc Apr 5–Jun 21,
    // seven-wonders Apr 6–Jun 15 → earliest start, latest end.
    assert.deepEqual(seasonRange("spring-2026"), {
        id: "spring-2026",
        start: "2026-04-05",
        end: "2026-06-21",
    });
    assert.deepEqual(seasonRange("summer-2026"), {
        id: "summer-2026",
        start: "2026-06-17",
        end: "2026-08-31",
    });
});

test("seasonRanges covers every season and overlaps where reality overlaps", () => {
    const ranges = seasonRanges();
    assert.equal(ranges.length, SEASONS.length);
    const by = (id: string) => ranges.find((r) => r.id === id)!;
    // NYC Footy's fall session ran into Volo's winter one.
    assert.ok(by("fall-2025").end! >= by("winter-2025-26").start);
    // Spring's last week overlaps summer's first.
    assert.ok(by("spring-2026").end! >= by("summer-2026").start);
    // The Real Sosobad guest (2026-06-14) sits in spring and only spring —
    // the hand-correction this model has to reproduce, not contradict.
    assert.ok("2026-06-14" >= by("spring-2026").start);
    assert.ok("2026-06-14" <= by("spring-2026").end!);
    assert.ok("2026-06-14" < by("summer-2026").start);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test 2>&1 | grep -c "seasonRange"`
Expected: FAIL — `seasonRange is not exported by ./soccer-derive.ts`.

- [ ] **Step 3: Implement the derivation**

Append to `src/data/soccer-derive.ts`, after `seasonsChrono()`:

```ts
export interface SeasonRange {
    id: string;
    /** Earliest start among the season's teams. */
    start: string;
    /** Latest end; undefined while any of its teams is still running. */
    end?: string;
}

/** A season's calendar window, derived from its teams' runs rather than
    authored. Seasons have no dates of their own: a season IS when its teams
    played, so the two can never drift apart — which is exactly how an
    open-ended in-play season came to swallow the whole of Fall 2026. Real
    sessions overlap (a league's last week runs into the next one's first), so
    two ranges legitimately can cover the same date; callers decide, they don't
    get a guess. Returns undefined for a season with no teams. */
export function seasonRange(seasonId: string): SeasonRange | undefined {
    const teams = seasonById(seasonId).teamIds.map(teamById);
    if (!teams.length) return undefined;
    let start = teams[0].start;
    let end: string | undefined = teams[0].end;
    for (const t of teams.slice(1)) {
        if (t.start < start) start = t.start;
        // One open-ended run leaves the whole season open-ended.
        if (end !== undefined)
            end = t.end === undefined ? undefined : t.end > end ? t.end : end;
    }
    return { id: seasonId, start, end };
}

export function seasonRanges(): SeasonRange[] {
    return SEASONS.map((s) => seasonRange(s.id)).filter(
        (r): r is SeasonRange => r !== undefined
    );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test 2>&1 | tail -6`
Expected: PASS, **67 tests**.

- [ ] **Step 5: Add the season/team consistency invariant**

Append to `src/data/soccer-derive.test.ts`:

```ts
// seasonRange() walks a season's teamIds to find its window, so a team entry
// missing from its own season's roster would silently shrink that window —
// and an id in teamIds with no entry would throw at build time. Both
// directions have to hold.
test("every team entry and its season agree on each other", () => {
    const offenders: string[] = [];
    for (const t of TEAMS) {
        const s = SEASONS.find((s) => s.id === t.seasonId);
        if (!s) offenders.push(`${t.id}: unknown seasonId ${t.seasonId}`);
        else if (!s.teamIds.includes(t.id))
            offenders.push(`${t.id}: missing from ${s.id}.teamIds`);
    }
    for (const s of SEASONS)
        for (const id of s.teamIds)
            if (!TEAMS.some((t) => t.id === id))
                offenders.push(`${s.id}.teamIds: no entry for ${id}`);
    assert.deepEqual(offenders, []);
});
```

- [ ] **Step 6: Run it, and prove it actually catches something**

Run: `npm test 2>&1 | tail -6`
Expected: PASS, **68 tests**. This invariant locks correct data rather than
fixing broken data, so it passes immediately — verify it has teeth before
trusting it:

```bash
cd /Users/ethanratnofsky/Projects/Portfolio-Website && sed -i '' 's/"abcde-fc-fall-2026",$/"abcde-fc-fall-2026", "nonexistent-team",/' src/data/soccer.ts && npm test 2>&1 | grep -c "no entry for nonexistent-team"
```

Expected: `1`. Now restore:

```bash
cd /Users/ethanratnofsky/Projects/Portfolio-Website && sed -i '' 's/"abcde-fc-fall-2026", "nonexistent-team",/"abcde-fc-fall-2026",/' src/data/soccer.ts && npm test 2>&1 | tail -3
```

Expected: 68 passing again.

- [ ] **Step 7: Write the failing seasonsForDate test**

Replace all four `seasonForDate` tests in `scripts/strava/dates.test.ts`
(lines 39-61; keep the `matchDate` test above them) with:

```ts
const RANGES = [
    { id: "spring-2026", start: "2026-04-05", end: "2026-06-21" },
    { id: "summer-2026", start: "2026-06-17", end: "2026-08-31" },
    { id: "fall-2026", start: "2026-09-01", end: "2026-11-30" },
];

test("seasonsForDate returns the one season covering a date", () => {
    assert.deepEqual(seasonsForDate("2026-06-14", RANGES), ["spring-2026"]);
    assert.deepEqual(seasonsForDate("2026-09-14", RANGES), ["fall-2026"]);
});

test("seasonsForDate returns every season covering an overlapped date", () => {
    // Spring's last week and summer's first overlap — genuinely ambiguous.
    assert.deepEqual(seasonsForDate("2026-06-18", RANGES), [
        "spring-2026",
        "summer-2026",
    ]);
});

test("seasonsForDate returns nothing for a date in a gap", () => {
    assert.deepEqual(seasonsForDate("2026-03-01", RANGES), []);
});

test("seasonsForDate treats a missing end as still running", () => {
    const open = [{ id: "fall-2026", start: "2026-09-01" }];
    assert.deepEqual(seasonsForDate("2027-01-01", open), ["fall-2026"]);
});
```

Update the file's import line to `import { matchDate, seasonsForDate } from "./dates.ts";`
and delete the now-unused `Season` type import.

- [ ] **Step 8: Run to verify it fails**

Run: `npm test 2>&1 | grep -i "seasonsForDate"`
Expected: FAIL — `seasonsForDate is not exported`.

- [ ] **Step 9: Replace seasonForDate with seasonsForDate**

Replace the bottom half of `scripts/strava/dates.ts`, swapping the `Season`
type import for `SeasonRange` (one definition, owned by the module that
derives it — do not redeclare it here):

```ts
// Type-only import: erased at compile time, so this stays a pure date module
// with no runtime dependency on the data layer.
import type { SeasonRange } from "../../src/data/soccer-derive.ts";

/** Every season whose range covers this date, in the order given. Sessions
    overlap in reality, so this can legitimately return more than one — it
    reports what it found rather than picking. Zero or two-plus is the
    importer's cue to ask a human. */
export function seasonsForDate(
    iso: string,
    ranges: readonly SeasonRange[]
): string[] {
    const d = iso.slice(0, 10);
    return ranges
        .filter((r) => d >= r.start && (!r.end || d <= r.end))
        .map((r) => r.id);
}
```

Keep `matchDate` exactly as it is.

- [ ] **Step 10: Drop start/end from Season**

In `src/data/soccer.ts`, remove these two fields from the `Season` interface:

```ts
    /** ISO date the season opens (inclusive) — used to assign imported matches. */
    start: string;
    /** ISO date the season closes (inclusive); omit while in-play. */
    end?: string;
```

and add in their place:

```ts
/** No authored dates: a season's range is derived from its teams' runs —
        see seasonRange() in soccer-derive.ts. */
```

Then delete every `start:` and `end:` line from the five entries in the
`SEASONS` array.

- [ ] **Step 11: Wire import.ts to derived ranges**

In `scripts/strava/import.ts`:

Change the imports:

```ts
import { matchDate, seasonsForDate } from "./dates.ts";
import { TEAMS, SEASONS, LEAGUES } from "../../src/data/soccer.ts";
import { seasonRange, seasonRanges } from "../../src/data/soccer-derive.ts";
```

Replace the scan-window block (the `const seasons = …` through `const afterEpoch = …` lines):

```ts
const ranges = seasonRanges();
if (!ranges.length) throw new Error("No season has any team-season runs");
const earliest = ranges.reduce(
    (a, r) => (r.start < a ? r.start : a),
    ranges[0].start
);
const inPlay = SEASONS.find((s) => s.status === "in-play");
const inPlayStart = inPlay ? seasonRange(inPlay.id)?.start : undefined;
const since = all ? earliest : (inPlayStart ?? earliest);
const afterEpoch = Math.floor(new Date(since).getTime() / 1000);
```

Add `start`/`end` to the team projection:

```ts
const teams = TEAMS.map((t) => ({
    id: t.id,
    name: t.name,
    league: t.league,
    seasonId: t.seasonId,
    start: t.start,
    end: t.end,
}));
```

Leave the per-activity loop alone for now — Task 4 rewrites it once the parser
accepts a date.

- [ ] **Step 12: Run the full suite**

Run: `npm test 2>&1 | tail -10`
Expected: PASS, **68 tests**. `dates.test.ts` swaps four `seasonForDate`
tests for four `seasonsForDate` ones, so the count is unchanged there.
`npx astro check` may still report errors in `import.ts` — Task 4 resolves them.

- [ ] **Step 13: Commit**

```bash
cd /Users/ethanratnofsky/Projects/Portfolio-Website && npx prettier --write src/data/soccer.ts src/data/soccer-derive.ts src/data/soccer-derive.test.ts scripts/strava/dates.ts scripts/strava/dates.test.ts scripts/strava/import.ts && git add src/data/soccer.ts src/data/soccer-derive.ts src/data/soccer-derive.test.ts scripts/strava/dates.ts scripts/strava/dates.test.ts scripts/strava/import.ts && git commit -m "feat(soccer): derive season ranges from team-season runs

Season.start/end are gone. A season's window is now min-start/max-end
over its teams (seasonRange in soccer-derive), so the two can't drift —
the drift is what let an open-ended in-play season absorb Fall 2026.

seasonForDate becomes seasonsForDate and returns every covering season
instead of the first. Sessions genuinely overlap (fall-2025/winter
share Dec 8-14, spring/summer share Jun 17-21), so the caller decides
rather than the function guessing. The Real Sosobad guest at 2026-06-14
now resolves to spring-2026 alone, reproducing a hand-correction that
the old global boundary contradicted.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Date-scoped team resolution + out-of-range blocking

**Files:**

- Modify: `scripts/strava/parse.ts`
- Modify: `scripts/strava/parse.test.ts`
- Modify: `scripts/strava/import.ts` (per-activity loop)

**Interfaces:**

- Consumes: `seasonsForDate` and `seasonRanges` (Task 3), `Team.start`/`end` (Task 1).
- Produces: `ParseInput.date?: string` replaces `ParseInput.seasonId`;
  `KnownTeam` gains `start: string; end?: string`; `ParsedMatch` gains
  `seasonId?: string`.

- [ ] **Step 1: Write the failing tests**

In `scripts/strava/parse.test.ts`, add `start`/`end` to the three top fixture
teams (all three get `start: "2026-06-17", end: "2026-08-31"`) and to the two
inline fixtures in the "two same-named entries in one season" test (same dates).
Replace the `SEASON` constant usage in `parse()` so the helper passes a date:

```ts
const parse = (title: string, description: string) =>
    parseActivity({
        title,
        description,
        teams: TEAMS,
        leagues: LEAGUES,
        date: "2026-07-01",
    });
```

Replace the `CHARLIES` block and the five season-scoped tests with:

```ts
// --- date-scoped team resolution -----------------------------------------
// Each team-season is its own TEAMS entry with its own run, so "Charlie
// Cheers FC" is three entries. The match date is what tells them apart.
const CHARLIES = [
    {
        id: "charlie-cheers-winter-2025-26",
        name: "Charlie Cheers FC",
        league: "Volo",
        seasonId: "winter-2025-26",
        start: "2026-01-14",
        end: "2026-02-25",
    },
    {
        id: "charlie-cheers-spring-2026",
        name: "Charlie Cheers FC",
        league: "Volo",
        seasonId: "spring-2026",
        start: "2026-04-07",
        end: "2026-05-26",
    },
    {
        id: "charlie-cheers-summer-2026",
        name: "Charlie Cheers FC",
        league: "NYC Footy",
        seasonId: "summer-2026",
        start: "2026-06-17",
        end: "2026-08-19",
    },
];

test("same-named entries across runs resolve to the one covering the date", () => {
    const r = parseActivity({
        title: "Charlie Cheers FC - NYC Footy",
        description: "W 2-0\n1 G",
        teams: CHARLIES,
        leagues: LEAGUES,
        date: "2026-07-01",
    });
    assert.equal(r.teamId, "charlie-cheers-summer-2026");
    assert.equal(r.seasonId, "summer-2026");
    assert.equal(r.league, "NYC Footy");
    assert.equal(r.blocking, false);
    assert.deepEqual(r.flags, []);
});

test("the same title on another date resolves to that run's entry", () => {
    const r = parseActivity({
        title: "Charlie Cheers FC - Volo",
        description: "L 1-2",
        teams: CHARLIES,
        leagues: LEAGUES,
        date: "2026-05-05",
    });
    assert.equal(r.teamId, "charlie-cheers-spring-2026");
    assert.equal(r.seasonId, "spring-2026");
    assert.deepEqual(r.flags, []);
});

test("a typo folds to the rostered entry covering the match date", () => {
    const r = parseActivity({
        title: "Charlie Cheer FC - Volo",
        description: "W 5-4",
        teams: CHARLIES,
        leagues: LEAGUES,
        date: "2026-02-01",
    });
    assert.equal(r.teamId, "charlie-cheers-winter-2025-26");
    assert.ok(r.flags.some((f) => /auto-matched/i.test(f)));
});

// The guardrail. A rostered name outside every recorded run means a new
// team-season started — never absorb it into the old entry, never file it
// as a phantom guest.
test("a rostered name outside every run blocks and names the gap", () => {
    const r = parseActivity({
        title: "Charlie Cheers FC - NYC Footy",
        description: "W 2-0",
        teams: CHARLIES,
        leagues: LEAGUES,
        date: "2026-09-01",
    });
    assert.equal(r.teamId, undefined);
    assert.equal(r.blocking, true);
    assert.ok(
        r.flags.some((f) => /rostered in summer-2026/.test(f)),
        `expected a gap flag, got ${JSON.stringify(r.flags)}`
    );
});

test("an explicit (sub) outside every run is a guest, not a block", () => {
    const r = parseActivity({
        title: "Charlie Cheers FC (sub) - NYC Footy",
        description: "W 2-0",
        teams: CHARLIES,
        leagues: LEAGUES,
        date: "2026-09-01",
    });
    assert.equal(r.teamId, undefined);
    assert.equal(r.sub, true);
    assert.equal(r.blocking, false);
});

test("two entries whose runs both cover the date are tie-broken by league", () => {
    const teams = [
        {
            id: "cc-volo",
            name: "Charlie Cheers FC",
            league: "Volo",
            seasonId: "summer-2026",
            start: "2026-06-17",
            end: "2026-08-31",
        },
        {
            id: "cc-footy",
            name: "Charlie Cheers FC",
            league: "NYC Footy",
            seasonId: "summer-2026",
            start: "2026-06-17",
            end: "2026-08-31",
        },
    ];
    const r = parseActivity({
        title: "Charlie Cheers FC - Volo",
        description: "W 2-0",
        teams,
        leagues: LEAGUES,
        date: "2026-07-01",
    });
    assert.equal(r.teamId, "cc-volo");
    assert.ok(!r.flags.some((f) => /multiple team entries/i.test(f)));
});

test("without a date all entries stay in scope", () => {
    const r = parseActivity({
        title: "Charlie Cheers FC - Volo",
        description: "W 2-0",
        teams: CHARLIES,
        leagues: LEAGUES,
    });
    assert.equal(r.teamId, undefined);
    assert.ok(r.flags.some((f) => /multiple team entries/i.test(f)));
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test 2>&1 | grep -ciE "blocks and names the gap|not ok"`
Expected: FAIL — `date` is not a recognized `ParseInput` field, and `r.seasonId`
is undefined.

- [ ] **Step 3: Update the parser's types**

In `scripts/strava/parse.ts`, extend `KnownTeam`:

```ts
export interface KnownTeam {
    id: string;
    name: string;
    league: string;
    /** Season this entry plays in. Each team-season is its own TEAMS entry,
        so several entries share a display name (four "Charlie Cheers FC") —
        the run that covers the match date is what tells them apart. */
    seasonId: string;
    /** ISO date this entry's run opens (inclusive). */
    start: string;
    /** ISO date it closes (inclusive); omit while still running. */
    end?: string;
}
```

Replace `seasonId?: string` in `ParseInput` with:

```ts
    /** The match's own date (ISO). Scopes team resolution to entries whose
        run covers it. Omitted only by callers that have no date, in which
        case every entry stays in scope. */
    date?: string;
```

Add to `ParsedMatch`, under `teamId`:

```ts
    /** Season of the resolved team entry. Absent for guests — the caller
        derives those from the date. */
    seasonId?: string;
```

- [ ] **Step 4: Scope resolution by date**

Replace the `const inSeason = …` / `const titleMatches = …` lines in step 5 with:

```ts
const covers = (t: KnownTeam, d: string) =>
    d >= t.start && (!t.end || d <= t.end);
const inRange = input.date
    ? input.teams.filter((t) => covers(t, input.date!))
    : input.teams;
const titleMatches = inRange.filter((t) =>
    normTitle.includes(normalize(t.name))
);
// A title naming a rostered team whose run doesn't cover this date is the
// signal that a new team-season began. Captured here, acted on in step 11.
const outOfRange =
    input.date && titleMatches.length === 0
        ? input.teams.filter((t) => normTitle.includes(normalize(t.name)))
        : [];
```

Update the step-5 comment block above it to say the resolution is scoped to the
run covering the match date, not to the season.

In step 10, change `findNearMissTeam(label, inSeason)` to
`findNearMissTeam(label, inRange)`.

- [ ] **Step 5: Record seasonId and block on the gap**

In step 11's `if (team)` branch, add immediately after `base.league = team.league;`:

```ts
base.seasonId = team.seasonId;
```

In the `else` branch, insert immediately after `if (multiMatchFlag) flags.push(multiMatchFlag);`:

```ts
// A rostered name outside every recorded run: a new team-season
// started. Absorbing it into the old entry or filing it as a phantom
// guest are both silent corruptions, so block and name the gap. An
// explicit (sub) is a real guest appearance and passes through.
if (outOfRange.length && !base.sub) {
    const t = outOfRange[0];
    flags.push(
        `${t.name} is rostered in ${t.seasonId} (${t.start} – ${t.end ?? "open"}) but this match is ${input.date}. Add a new team-season entry for ${t.name}, or mark the post (sub) if it was a guest appearance.`
    );
    base.blocking = true;
}
```

- [ ] **Step 6: Run to verify it passes**

Run: `npm test 2>&1 | tail -10`
Expected: PASS, **69 tests** (the six season-scoped parser tests become seven).

- [ ] **Step 7: Wire the import loop**

In `scripts/strava/import.ts`, replace the body of the `for (const a of soccer)`
loop from `const date = matchDate(detail);` through `if (parsed.blocking) { … }`:

```ts
// Resolution runs name+date → team → season: a display name is
// ambiguous across a club's team-seasons but unique within the run
// that covers the date. Deriving the season first (as this used to)
// is what let an open-ended in-play season swallow Fall 2026.
const date = matchDate(detail);
const parsed = parseActivity({
    title: detail.name,
    description: detail.description ?? "",
    teams,
    leagues: LEAGUES,
    date,
});
if (!parsed.isMatch) continue;

if (parsed.blocking) {
    reports.push(`⚠︎ ${date} "${detail.name}": ${parsed.flags.join(" ")}`);
    continue;
}

// A rostered team carries its own season. A guest doesn't, so fall
// back to the date — and refuse to guess when that's ambiguous.
let seasonId = parsed.seasonId;
if (!seasonId) {
    const covering = seasonsForDate(date, ranges);
    if (covering.length !== 1) {
        reports.push(
            covering.length === 0
                ? `⚠︎ ${date} "${detail.name}": no season covers this date — add or extend a team-season run in TEAMS.`
                : `⚠︎ ${date} "${detail.name}": ${covering.length} seasons cover this date (${covering.join(", ")}) — assign the season by hand.`
        );
        continue;
    }
    seasonId = covering[0];
}
```

- [ ] **Step 8: Verify the whole thing typechecks and passes**

Run: `npm test 2>&1 | tail -6 && npx astro check 2>&1 | tail -15`
Expected: 69 tests pass; `astro check` reports 0 errors.

- [ ] **Step 9: Commit**

```bash
cd /Users/ethanratnofsky/Projects/Portfolio-Website && npx prettier --write scripts/strava/parse.ts scripts/strava/parse.test.ts scripts/strava/import.ts && git add scripts/strava/parse.ts scripts/strava/parse.test.ts scripts/strava/import.ts && git commit -m "feat(strava): resolve team by name+date, block on an unrecorded run

The importer derived the season from the date and then looked for a team
inside it. That first step has no good answer when sessions overlap, and
none at all when the in-play season is open-ended: every September match
landed in Summer 2026.

Resolution now runs name+date -> team -> season. A club never plays two
of its own team-seasons at once, so the run covering the date picks the
entry outright. Guests, having no entry, still fall back to the date and
now block when zero or several seasons cover it.

New blocking case: a title naming a rostered team outside every recorded
run. That is a new team-season starting, and it fires on the first match
(2026-09-01 for Charlie Cheers) instead of being silently absorbed. An
explicit (sub) still passes through as a guest.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Documentation and end-to-end verification

**Files:**

- Modify: `docs/strava-import.md`

**Interfaces:**

- Consumes: everything above.
- Produces: nothing code-facing.

- [ ] **Step 1: Update the post-conventions section**

In `docs/strava-import.md`, replace the bullet beginning "**The same team name in
different seasons resolves automatically.**" with:

```markdown
- **The same team name across seasons resolves automatically.** Each team-season
  is its own `TEAMS` entry carrying its own `start`/`end`, so "Charlie Cheers FC"
  is four entries (Winter/Spring/Summer/Fall). The importer resolves the team
  _within the run that covers the activity's date_, so you never need to
  disambiguate in the title. If a club somehow has two entries whose runs both
  cover the date (e.g. rosters in two leagues at once), the `- League` segment
  breaks the tie; only if it's still ambiguous after both is the match recorded
  as a guest with a note asking you to assign the team by hand.
```

- [ ] **Step 2: Rewrite the blocking-reasons list**

Replace the "**No season covers this date**" bullet with these three:

```markdown
- **A rostered team outside every recorded run** — the title names a team in
  `TEAMS`, but no entry for it has a `start`/`end` covering this date. This is
  what a new season looks like: add a new team-season entry for it in `TEAMS`
  (id `<club-slug>-<seasonId>`, with the new run's `start` and `end`), adding
  the season to `SEASONS` if it doesn't exist yet. If it was really a one-off
  guest appearance, mark the Strava post `(sub)` instead and it'll import as a
  guest.
- **No season covers this date** — the date falls outside every season's
  derived range. Seasons have no dates of their own: a season's range is the
  earliest `start` to the latest `end` across its teams, so fix this by adding
  or extending a team-season run in `TEAMS`, not by editing `SEASONS`.
- **Several seasons cover this date** — a guest appearance landed in a window
  where two sessions overlap (they legitimately do; NYC Footy's fall session
  runs into Volo's winter one). Add the match by hand with the season you mean.
```

- [ ] **Step 3: Document the season model**

Add after the blocking list:

```markdown
### Why seasons have no dates

`Season` carries no `start`/`end`. Its range is derived from its teams' runs
(`seasonRange()` in `src/data/soccer-derive.ts`), because two hand-maintained
date sources drift — and when they drifted, an open-ended in-play season
absorbed a whole new season's matches without a single flag. Three build-time
invariants in `src/data/soccer-derive.test.ts` keep the data honest:

1. Every rostered match falls inside its team-season's run.
2. No two entries sharing a team name have overlapping runs.
3. No guest row wears the name of a team rostered in its own season.

When a season starts, add its team entries with real `start` dates and the
season falls out of them. That is the only edit required.
```

- [ ] **Step 4: Verify the site builds and renders**

```bash
cd /Users/ethanratnofsky/Projects/Portfolio-Website && npm run build 2>&1 | tail -5
```

Expected: build completes, 0 errors.

Then confirm the derived data is what the Field Report will show:

```bash
cd /Users/ethanratnofsky/Projects/Portfolio-Website && node --experimental-strip-types -e '
import("./src/data/soccer-derive.ts").then((d) => {
  for (const s of d.seasonsChrono()) {
    const r = d.seasonRange(s.id);
    const a = d.seasonAgg(s.id);
    console.log(s.label.padEnd(18), s.status.padEnd(8), `${r.start} - ${r.end ?? "open"}`, d.record(a), `(${a.played})`);
  }
  console.log("all-time:", d.record(d.allTime()), d.allTime().played, "matches");
});'
```

Expected: five seasons; `Fall 2026 in-play 2026-09-01 - 2026-11-30 3–0–2 (5)`;
`Summer 2026 sealed 2026-06-17 - 2026-08-31`; Spring 2026 still `15–1–7`;
all-time 73 matches.

- [ ] **Step 5: Confirm no phantom guests remain**

```bash
cd /Users/ethanratnofsky/Projects/Portfolio-Website && node -e '
const m = require("./src/data/matches.json");
const g = m.filter((x) => x.guest);
console.log("guest rows:", g.length);
for (const x of g) console.log(" ", x.date, x.guest.team, x.seasonId);'
```

Expected: exactly one guest row — `2026-06-14 Real Sosobad spring-2026`.

- [ ] **Step 6: Commit**

```bash
cd /Users/ethanratnofsky/Projects/Portfolio-Website && npx prettier --write docs/strava-import.md && git add docs/strava-import.md && git commit -m "docs(strava): document date-scoped resolution and dateless seasons

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```
