# Strava importer — free-agent guests, timezone dates, typo folding, pickup skip

## Context

The Strava match importer (`scripts/strava/`) ran for the first time against real
data and opened PR #9. The review surfaced that the owner's real posting habits
differ from the importer's original assumptions:

- The owner plays NYC Footy largely as a **free agent**, so their team name
  changes constantly ("FA Orange Julius", "Pretty in Pink", "ABCDE FC",
  "FA Seven Wonders of the Goal", …). These are **teams the owner played on**,
  not opponents — they should be **recorded**, not blocked.
- Titles appear in **both** orders: `League – Team` (`"NYC Footy - FA Orange Julius"`,
  Nov–Feb) and `Team – League` (`"ABCDE FC - NYC Footy"`, Apr–Jun).
- Some activities are **pickup/scrimmage/drop-in**, not league games, and should
  be skipped entirely.
- Rostered-team names sometimes have **typos** (`"Charlie Cheer FC"` for
  Charlie Cheers FC) that should fold back to the rostered team.
- The recorded date is off by a day for evening games because the importer reads
  Strava's UTC `start_date` instead of the athlete-local `start_date_local`.

This plan changes **only** `scripts/strava/` (parser, client, orchestrator) plus a
new pure date helper and tests. The site's render layer already handles a
`guest` match with `sub:false` correctly (aggregates count every match regardless
of `sub`; the SUB chip is gated on `team.sub`; `matchTeam()` groups guests by
label). **No `src/` changes are in scope.** The real season → team → league
reconciliation and placeholder deletion happen later, after a fresh import; they
are NOT part of this plan.

### Key interfaces (as they exist today)

- `scripts/strava/parse.ts` — `parseActivity({title, description, teams, leagues}): ParsedMatch`.
  Pure. `ParsedMatch` has `isMatch, teamId?, guest?{team?,league?,format?}, sub,
  league?, result?, score?, goals, goalsIsMinimum, assists, flags: string[], blocking`.
  Result is derived from the score; a contradicting W/D/L letter adds a flag.
  Today: `(sub)` strips + sets `sub`; a blessed-league substring match anywhere
  wins; segment split is `/\s*[-–—|·]\s*/` and the **last** segment is treated as
  the league claim; an unknown team on a **non-sub** match is **blocking**.
- `scripts/strava/client.ts` — `StravaActivity {id, name, description, sport_type,
  start_date}`; `getActivity()` returns it. Strava's JSON also includes
  `start_date_local` (athlete wall-clock, ISO with a trailing `Z` that is NOT UTC —
  slice its first 10 chars for the local calendar date; no timezone math).
- `scripts/strava/import.ts` — orchestrator. Auto-runs `main()` at import time, so
  it is not unit-tested directly. Uses `detail.start_date` for the record date,
  season assignment (`seasonForDate`), and two report lines. `if (!parsed.isMatch)
  continue;` silently skips non-matches (no report line). `if (parsed.blocking)`
  pushes a `⚠︎` report line and skips. Non-blocking `parsed.flags` become an `ℹ`
  report line and the match is recorded.
- Tests run with `npm test` → `node --test --experimental-strip-types
  "src/**/*.test.ts" "scripts/**/*.test.ts"`. Relative imports need `.ts`
  extensions. Existing suites: `parse.test.ts` (16 tests), `merge.test.ts`.

## Global Constraints (bind every task; copy into reviewer prompts)

1. **Date source:** the recorded and reported match date MUST derive from
   `start_date_local` (first 10 chars), NEVER from `start_date` (UTC).
2. **Unknown LEAGUE still blocks.** A title whose only league claim is an
   unblessed league (e.g. `"… - Beer League"`) stays `blocking:true` with a
   league flag. Never silently accept or invent a league.
3. **No score still blocks.** A W/D/L with no score stays `blocking:true`.
4. **Free-agent guests are recorded, not blocked.** When a blessed league IS
   recognized and the team is unknown and the match is NOT a sub, record it as a
   `guest` (with `guest.team` = the extracted label, `guest.league` = the blessed
   league) and emit a **non-blocking informational** flag. This intentionally
   REVERSES the old "unknown team on a non-sub match is blocking" behavior — the
   old test asserting that MUST be rewritten to the new contract; that is a
   deliberate, plan-mandated change, not a regression.
5. **Guests always carry a league** (`guest.league`) whenever one is recognized,
   so the site's LEAGUE filter lists them.
6. **`(sub)` behavior is unchanged:** it strips from the title before team
   matching and sets `sub:true`; an unknown team on a sub match stays a
   non-blocking guest (as today).
7. **Rostered exact match still wins:** if a rostered team name appears anywhere
   in the (sub-stripped) title, that `teamId` is used — unchanged.
8. **Typo folding is conservative** and always emits an informational flag naming
   the correction; it must never fold a clearly-distinct name into a rostered team.
9. Every existing test must still pass except the one intentionally changed by
   constraint 4. `npm test` output must be pristine. Keep `scripts/**` TypeScript
   strict-clean (note: `astro check` covers only `src/**`, so type errors in
   `scripts/**` surface only at `node --test` strip-run time — verify by running
   the suite).
10. Follow the existing code style (en dashes in comments, `.ts` import
    extensions, injectable `fetchFn`, small pure functions).

---

## Task 1: Timezone-correct match dates (`start_date_local`)

**Goal:** The recorded/reported date must be the athlete's local calendar date, not
UTC. Extract the two pure date helpers out of the orchestrator so they are testable.

**Files:**
- `scripts/strava/client.ts` — add `start_date_local: string` to the
  `StravaActivity` interface (it is already present in Strava's JSON response;
  only the type is missing). Do not change `listActivitiesSince` (it only needs
  `id`/`sport_type`).
- NEW `scripts/strava/dates.ts` — two pure functions:
  - `matchDate(detail: { start_date_local: string }): string` → `detail.start_date_local.slice(0, 10)`.
  - `seasonForDate(iso: string, seasons: readonly Season[]): string | null` — moved
    verbatim from `import.ts` but taking `seasons` as a parameter (currently it
    closes over the module `SEASONS`). Import the `Season` type from
    `../../src/data/soccer.ts`. Keep the existing semantics: return the first
    season whose `start <= date <= (end ?? ∞)`, else `null`.
- `scripts/strava/import.ts` — import `matchDate` and `seasonForDate` from
  `./dates.ts`; delete the local `seasonForDate`; compute `const date =
  matchDate(detail);` once and use it for the record `date:`, the
  `seasonForDate(date, SEASONS)` call, and BOTH `⚠︎` report lines (replace every
  `detail.start_date.slice(0, 10)` and the `seasonForDate(detail.start_date)`).
- NEW `scripts/strava/dates.test.ts` — TDD.

**Tests (write first, RED → GREEN):**
- `matchDate` returns the local calendar date even when UTC is the next day:
  `matchDate({ start_date_local: "2025-11-10T20:00:00Z" })` === `"2025-11-10"`
  (the paired UTC `start_date` would be `"2025-11-11T01:00:00Z"` — prove we do NOT
  use it by only passing `start_date_local`).
- `seasonForDate` assigns by local date across a boundary: with the real SEASONS
  (import them, or a small fixture), a date on a season's `start` and on its `end`
  both resolve to that season; a date past the last `end` with no in-play season
  returns `null`; an in-play season (no `end`) matches any date `>= start`.

**Acceptance:** No `detail.start_date` reference remains in `import.ts` for date or
season purposes. `matchDate`/`seasonForDate` are pure and unit-tested.

---

## Task 2: Record free-agent guests; extract team label for both title orders

**Goal:** Stop blocking the owner's free-agent games, and fix the guest label so it
is correct whether the league was written first or last.

**File:** `scripts/strava/parse.ts` (+ `parse.test.ts`).

**Two coupled changes in the guest branch (step 4/5/9 of `parseActivity`):**

1. **Label extraction independent of order.** Today `preLeagueSegments =
   segments.slice(0, -1)` assumes the league is the LAST segment, so
   `"NYC Footy - FA Orange Julius"` yields the label `"NYC Footy"` (wrong). Change
   it: when a blessed league is recognized, the guest label is the segment(s) with
   the recognized-league segment **removed** — i.e. drop whichever segment matches
   the blessed league (by `normalize()` equality/substring), join the rest. So
   `"NYC Footy - FA Orange Julius"` → label `"FA Orange Julius"`, and
   `"ABCDE FC - NYC Footy"` → label `"ABCDE FC"`. If no blessed league is
   recognized, keep today's behavior (last segment = league claim / the unknown
   league is flagged & blocking per constraint 2).
2. **Non-sub unknown team + recognized blessed league → record as guest.** In the
   `else` (no rostered team) branch, when `league` (blessed) is set: set
   `base.league` and `base.guest.league` (as today) and DO NOT set `blocking`.
   Emit a **non-blocking** informational flag, e.g.
   `` `Recorded "${label}" as a guest team in ${league}. If this is a rostered team, add it to TEAMS.` ``
   Remove the old non-sub blocking push for this case. The unknown-LEAGUE branch
   (no blessed league at all) is UNCHANGED and still blocks (constraint 2). The
   empty-label edge (guest with no team name) on a non-sub match: still record as a
   guest named later `[Unknown team]` — non-blocking if a league is recognized.

**Tests:**
- Rewrite the existing `"unknown team on a NON-sub match is blocking"` test
  (currently `parse.test.ts:83`) to the new contract:
  `parse("Some Random FC - NYC Footy", "W 2-0")` → `blocking === false`,
  `teamId === undefined`, `guest.team === "Some Random FC"`, `league === "NYC Footy"`,
  and `flags` contains a non-blocking note mentioning "guest".
- League-first order yields a clean label:
  `parse("NYC Footy - FA Orange Julius", "L 4-6")` → `guest.team === "FA Orange Julius"`,
  `league === "NYC Footy"`, `blocking === false`.
- Team-last order still works:
  `parse("ABCDE FC - NYC Footy", "W 3-0")` → `guest.team === "ABCDE FC"`,
  `league === "NYC Footy"`, `blocking === false`.
- Constraint 2 preserved:
  `parse("Charlie Cheers FC - Beer League", "W 2-0")` stays blocking (this existing
  test must still pass — Charlie Cheers is rostered, so it hits the known-team
  path; keep it).
  ALSO add: `parse("Total Randoms - Beer League", "W 2-0")` (unknown team, unknown
  league) stays `blocking === true` with a league flag.
- Existing rostered/`(sub)`/`vs`/parenthetical tests must still pass unchanged.

**Acceptance:** free-agent games become non-blocking guests with the correct label
and league in both orders; unknown-league and no-score cases still block.

---

## Task 3: Fold rostered-team typos back to the rostered team

**Goal:** `"Charlie Cheer FC"` (missing the "s") should resolve to the
`charlie-cheers` rostered team, not become a phantom guest — while a clearly
different name ("FA Goalmates") must NOT fold.

**File:** `scripts/strava/parse.ts` (+ `parse.test.ts`). Depends on Task 2's label
extraction (operate on the extracted team label).

**Approach (conservative, deterministic):**
- Keep the existing exact substring team match first (constraint 7). Only when it
  finds nothing, attempt a near-miss fold against the **extracted team label**
  (from Task 2), not the whole title.
- Add a small pure Levenshtein helper (or normalized token comparison). Fold the
  label to a rostered team when, on `normalize()`d strings, the edit distance to
  that team's normalized name is `<= 2` AND the shorter of the two strings has
  length `>= 6` (guards against folding short/ambiguous labels). If multiple teams
  qualify, pick the smallest distance; ties → do not fold (ambiguous).
- On a fold: set `teamId`/`league` from the rostered team (as the known-team path
  does) and emit a **non-blocking** informational flag naming the correction, e.g.
  `` `Title team "Charlie Cheer FC" ≈ Charlie Cheers FC (auto-matched; fix the Strava title if wrong).` ``

**Tests:**
- `parse("Charlie Cheer FC - Volo", "W 5-4")` → `teamId === "charlie-cheers"`,
  `blocking === false`, and a flag mentioning the auto-match. (Note: Charlie Cheers
  is rostered as NYC Footy, so a league-mismatch flag for the "Volo" claim is also
  expected and fine — assert the auto-match flag specifically.)
- `parse("FA Goalmates - NYC Footy", "W 2-0")` does NOT fold: `teamId === undefined`,
  recorded as a guest (Task 2 behavior), no auto-match flag.
- A short/ambiguous label does not fold: `parse("FC - NYC Footy", "W 1-0")` →
  `teamId === undefined` (length guard).

**Acceptance:** exactly-one-typo rostered names fold with an info flag; distinct
names do not.

---

## Task 4: Skip pickup / scrimmage / drop-in activities

**Goal:** Activities that are not league games should be silently skipped (no
report line), per the owner's decision.

**File:** `scripts/strava/parse.ts` (+ `parse.test.ts`).

**Approach:**
- Add a clearly-commented `IGNORE_RE` constant matching (case-insensitive, word
  boundaries) any of: `scrimmage`, `drop[\s-]?in`, `pick[\s-]?up`, `night football`.
  Comment it as the owner-extendable list of non-league activity markers.
- Early in `parseActivity`, test **the title only** (`rawTitle`) against
  `IGNORE_RE`; if it matches, return a result with `isMatch: false` (so
  `import.ts` skips it with no report line). Place this before the score/team
  logic so ignored activities never produce flags. Deliberately do NOT test the
  description: pickup/scrimmage markers belong in titles, and matching a free-form
  description risks silently dropping a real match whose notes happen to mention
  one of these words (an invisible data loss with no report line).

**Tests:**
- `parse("NYC Soccer - Drop-In", "W 5-3").isMatch === false`
- `parse("NYC Footy Scrimmage", "W 2-0").isMatch === false`
- `parse("Night Football (Soccer)", "L 1-2").isMatch === false`
- A normal match is unaffected: the canonical-post test still returns
  `isMatch === true`.

**Acceptance:** the three named pickup titles are skipped; league games unaffected.

---

## Task 5: Update the runbook for the new conventions

**Goal:** `docs/strava-import.md` must reflect the new behavior so the owner's
posting guide is truthful.

**File:** `docs/strava-import.md` (docs only — no code).

**Edits:**
- Note that free-agent / one-off team names are now **recorded as guest rows**
  (grouped by team name) even without `(sub)`, as long as the league is one of the
  blessed leagues; `(sub)` is still how you force the SUB chip.
- Note that titles work in either order (`League – Team` or `Team – League`).
- Note that near-miss typos of a rostered team auto-match with a review flag.
- Note that `scrimmage` / `drop-in` / `pickup` / `night football` activities are
  skipped; list where to extend `IGNORE_RE`.
- Note that the match date now follows the athlete-local date (`start_date_local`),
  so late-evening games no longer roll to the next day.

**Acceptance:** the runbook describes the Task 1–4 behavior accurately; no stale
claim that unknown teams are always blocked.
