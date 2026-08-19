# Strava match importer — setup runbook

One-time setup so the [Field Report](../src/components/field-report/) section can be
fed from Strava. Read this once; you'll only redo it if a secret is rotated.

## How it works, in short

A scheduled GitHub Actions workflow reads your recent "Soccer" activities from Strava,
parses their title + description for match details, and opens a pull request against
`src/data/matches.json`. You review the PR (the parser flags anything it isn't sure
about) and merge it. No stored totals exist anywhere — every number on the site
recomputes from `MATCHES` at build time, so merging the PR is the only step.

Pickup games, scrimmages, and drop-ins are skipped entirely (no PR line at all) — see
[Post conventions](#5-post-conventions) for the marker list. Everything else gets a
match date from Strava's `start_date_local` (your local wall-clock time at kickoff), so
a late-evening game is dated the day you played it, not the day it rolled over to in
UTC.

The workflow runs **weekly** (Monday) and can also be triggered **on demand** from the
Actions tab (`workflow_dispatch`, with an optional "rescan all seasons" input for a
full backfill). Either way it only ever opens/updates a review PR — it never pushes
match data directly to the main branch.

## 1. Create a Strava API application

1. Go to <https://www.strava.com/settings/api>.
2. Create an application. For **Authorization Callback Domain**, enter `localhost`
   (there's no real server — you're just going to copy a code out of the browser's
   address bar after Strava redirects).
3. Note the **Client ID** and **Client Secret** shown on the app's settings page.

## 2. Authorize the app and grab a code

Open this URL in a browser, replacing `CLIENT_ID` with the value from step 1:

```
https://www.strava.com/oauth/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:read_all
```

`scope=activity:read_all` is required — the default `activity:read` scope excludes
private activities, and your Soccer activities may well be private.

Approve the request. Strava redirects to `http://localhost/exchange_token?...&code=...`
— the page itself will fail to load (nothing is listening on `localhost`), which is
expected. Copy the `code` query parameter's value out of the address bar. It's
single-use and expires quickly, so move on to the next step right away.

## 3. Mint the refresh token

Run the one-time helper script with the client ID/secret from step 1 and the code from
step 2:

```bash
STRAVA_CLIENT_ID=<client id> STRAVA_CLIENT_SECRET=<client secret> \
  node scripts/strava/auth.mjs <code>
```

It exchanges the code for tokens and prints:

```
Add these as GitHub Actions repository secrets:

STRAVA_CLIENT_ID     = <client id>
STRAVA_CLIENT_SECRET = <your client secret>
STRAVA_REFRESH_TOKEN = <refresh token>
```

(`STRAVA_CLIENT_SECRET` is printed as a placeholder, not echoed back — copy it from
step 1's value, not from the script's output.)

## 4. Add the repository secrets

In the GitHub repository: **Settings → Secrets and variables → Actions → New
repository secret**. Add all three:

- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_REFRESH_TOKEN`

Once these are set, the scheduled workflow can run unattended: on every run it
exchanges `STRAVA_REFRESH_TOKEN` for a short-lived access token
(`scripts/strava/client.ts`), then discards the access token when the run ends. The
same refresh token secret is reused run after run — you only need to redo steps 2–4 if
Strava revokes the app's access (e.g. you deauthorize it from your Strava settings).

## 5. Post conventions

The parser (`scripts/strava/parse.ts`) is tolerant of order, case, and punctuation, but
it needs the following in every match post:

| What                      | Where           | Format                                                                                                              | Example                                                                      |
| ------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Team + league             | **Title**       | `Team - League` or `League - Team` — either order (separator can be `-`, `–`, `—`, `\|`, or `·`)                    | `FA Blast From the Past - NYC Footy` or `NYC Footy - FA Blast From the Past` |
| Guest / substitute marker | **Title**       | `(sub)` (or `sub`, `substitute`) anywhere in the title                                                              | `Real Sosobad (sub) - NYC Soccer`                                            |
| Result                    | **Description** | `W`, `D`, or `L`                                                                                                    | `W`                                                                          |
| Score                     | **Description** | `N-N` (your goals – their goals; the separator regex also accepts an en dash `–` or em dash `—`, not just a hyphen) | `4-1`                                                                        |
| Goals                     | **Description** | `N G` — omit entirely if you didn't score                                                                           | `1 G`                                                                        |
| Goals, undercount         | **Description** | `N+ G` — flags the count as a minimum (renders with `†`)                                                            | `2+ G`                                                                       |
| Assists                   | **Description** | `N A` — omit entirely if you had none                                                                               | `1 A`                                                                        |

Notes on why this matters:

- **Title vs. description is not interchangeable.** Team, league, and the `(sub)`
  marker are read from the **title**; result, score, goals, and assists are read from
  the **description**. A post is only recognized as a match at all if the description
  contains a score or a `W`/`D`/`L` letter.
- **Leagues are a blessed, closed set:** `NYC Footy`, `Volo`, `NYC Soccer` (see
  `LEAGUES` in `src/data/soccer.ts`). Anything else in the league position is flagged
  in the PR, never silently accepted or auto-created.
- **A free-agent / one-off team name is recorded, not blocked, as long as the league
  is one of the blessed three.** You don't need `(sub)` for this — a title like `FA
Orange Julius - NYC Footy` is recorded as a guest appearance under "FA Orange
  Julius," with a non-blocking note in the PR so you can confirm it's really a one-off
  and not a rostered team you forgot to add to `TEAMS`. `(sub)` still exists to mark a
  guest appearance explicitly (e.g. subbing into a match for a team you don't
  otherwise play for) and skips that note. What still blocks the import: an
  **unrecognized league**, or a match with **no score**.
- **Never write "0 G" or "0 A."** A missing goals/assists token means 0 — write the
  `G` token only in games where you actually scored, and the `A` token only when you
  had an assist.
- **Result is derived from the score**, not from the letter. If you write `L` but the
  score says you won, the importer uses the score and adds a flag to the PR noting the
  disagreement — it doesn't block the import.
- A recognized team name anywhere in the title (e.g. `Charlie Cheers FC vs Riverside
Rovers`, or a `(Home)`/`(Away)` tag) doesn't need an explicit `- League` segment —
  the team's own league is used automatically.
- **A near-miss typo of a rostered team's name auto-matches to that team.** If the
  title's team label is a small edit away from an existing entry in `TEAMS` (e.g.
  `Charlie Cheer FC` for "Charlie Cheers FC"), the importer folds it to the rostered
  team and adds a non-blocking note naming the correction — it doesn't invent a guest
  row for what's really a typo. This is deliberately conservative (short edit
  distance only, both the label and the candidate team name must be at least 6
  normalized characters long so a short label like `FC` can never auto-match, and
  only when it isn't ambiguous between two teams), so a genuinely different team name
  is still treated as a guest or flagged normally.
- **The same team name in different seasons resolves automatically.** Each
  team-season is its own `TEAMS` entry, so "Charlie Cheers FC" is three entries
  (Winter/Spring/Summer). The importer resolves the team _within the season the
  activity's date falls in_, so you never need to disambiguate in the title. If one
  club somehow has two entries in the _same_ season (e.g. rosters in two leagues at
  once), the `- League` segment in the title breaks the tie; only if it's still
  ambiguous after both is the match recorded as a guest with a note asking you to
  assign the team by hand.
- An optional format token like `7v7` in the title is picked up automatically for
  guest appearances; you don't need to add it for rostered-team matches (the team's
  format is already known).
- **Pickup games, scrimmages, and drop-ins are skipped entirely — no PR line at all.**
  The importer checks the activity's **title** against a marker list (currently
  `scrimmage`, `drop-in`/`dropin`/`drop in`, `pickup`/`pick-up`/`pick up`, and `night
football`) and silently ignores anything that matches, on the assumption it isn't a
  league match worth tracking. If you use another recurring term for pickup soccer,
  add it to the `IGNORE_RE` constant near the top of `scripts/strava/parse.ts`.

### Examples

Rostered team, straightforward win:

> **Title:** `Charlie Cheers FC - NYC Footy`
> **Description:** `W 4-1` \
> `1 G`

Guest appearance, substitute, undercounted goals:

> **Title:** `Real Sosobad (sub) - NYC Soccer`
> **Description:** `W 6-3` \
> `2+ G` \
> `1 A`

Free-agent one-off, no `(sub)` needed — recorded as a guest row under "FA Orange
Julius" with a non-blocking review note, since `NYC Footy` is a blessed league (title
order doesn't matter here either):

> **Title:** `NYC Footy - FA Orange Julius`
> **Description:** `L 2-4`

## 6. Running the import

- **Weekly:** the workflow runs automatically every Monday and only scans activities
  from the start of the current in-play season onward.
- **On demand:** GitHub → **Actions** tab → **Strava import** → **Run workflow**. Check
  "rescan all seasons" to backfill/re-scan every season instead of just the current
  one (useful the first time, or after editing `SEASONS` in `src/data/soccer.ts`).
- Either way, if there's anything to add or change, the workflow opens (or updates) a
  pull request against `src/data/matches.json` (and its de-dup snapshot file) with a
  summary of what was added, updated, or flagged. Review the diff and the PR body,
  then merge — nothing is written to `matches.json` outside of a PR you approve.

## 7. Reading PR notes, and resolving a flag that blocks an activity

The PR body annotates every activity it touched with an `ℹ` or `⚠︎` line. The
difference matters:

- **`ℹ` (info) — the match was still recorded**, just with something worth a second
  look. This covers the two guest-recording notes above (an unrecognized-but-blessed
  team, or a near-miss typo auto-matched to a rostered team) and a result-letter/score
  disagreement. No action is required; skim it, and fix the data model (or the next
  post's title) only if the note reveals an actual mistake.
- **`⚠︎` (blocking) — the activity was _not_ written**, and needs a fix before it'll be
  imported. There are three ways an activity ends up blocked:
    - **Unrecognized league** — an _explicit_ league segment (in `Team - League` or
      `League - Team` form) doesn't match `LEAGUES` (`src/data/soccer.ts`), or neither a
      team nor a league can be identified in the title at all. Either add the league to
      that blessed list, or correct the post to use one of the existing three (`NYC
Footy`, `Volo`, `NYC Soccer`). Omitting the league segment entirely when a team
      **is** recognized is fine — the team's own league is used automatically (see the
      note under [Post conventions](#5-post-conventions)).
    - **No score found** — the description has a `W`/`D`/`L` letter but no `N-N` score,
      so the record can't be completed. Edit the post's description to add the score.
    - **No season covers this date** — the activity's date doesn't fall within any
      `Season.start`–`Season.end` range in `SEASONS` (`src/data/soccer.ts`). Add a new
      season, or extend an existing one's `start`/`end`.

    Note that an **unrecognized team name is no longer blocking by itself** — as long as
    the league is recognized, it's recorded as a guest row with an `ℹ` note (see
    [Post conventions](#5-post-conventions)). If it's actually a rostered team, add it to
    `TEAMS` in `src/data/soccer.ts` (id, name, league, seasonId, division/format/venue
    as applicable — one entry per season the team plays in) so _future_ activities for that team import correctly. The dedup
    snapshot only tracks score/goals/assists, not team identity, so simply re-running
    the import won't retroactively upgrade an already-written guest row to a
    rostered-team match — edit that one entry in `src/data/matches.json` by hand if you
    want it fixed too.

After fixing the data model, re-run the workflow on demand (Actions tab → **Strava
import** → **Run workflow**, with "rescan all seasons" checked if the activity is
older than the current season) so the previously flagged activity gets re-parsed and
included in a fresh PR.
