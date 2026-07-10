export interface KnownTeam {
    id: string;
    name: string;
    league: string;
}
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
    return s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

// Classic edit-distance DP, O(min space) via a single rolling row.
export function levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const row = new Array<number>(n + 1);
    for (let j = 0; j <= n; j++) row[j] = j;
    for (let i = 1; i <= m; i++) {
        let prevDiag = row[0];
        row[0] = i;
        for (let j = 1; j <= n; j++) {
            const temp = row[j];
            row[j] =
                a[i - 1] === b[j - 1]
                    ? prevDiag
                    : 1 + Math.min(prevDiag, row[j], row[j - 1]);
            prevDiag = temp;
        }
    }
    return row[n];
}

// Conservative near-miss fold: only for labels that are close enough to be
// an obvious typo of a rostered team, and long enough that a short/generic
// label ("FC") can't accidentally match. Ties (two teams equally close) are
// treated as ambiguous and are not folded.
function findNearMissTeam(
    label: string | undefined,
    teams: readonly KnownTeam[]
): KnownTeam | undefined {
    if (!label) return undefined;
    const nLabel = normalize(label);
    let best: { team: KnownTeam; distance: number } | undefined;
    let ambiguous = false;
    for (const t of teams) {
        const nName = normalize(t.name);
        if (Math.min(nLabel.length, nName.length) < 6) continue;
        const distance = levenshtein(nLabel, nName);
        if (distance > 2) continue;
        if (!best || distance < best.distance) {
            best = { team: t, distance };
            ambiguous = false;
        } else if (distance === best.distance) {
            ambiguous = true;
        }
    }
    return ambiguous ? undefined : best?.team;
}

// Owner-extendable list of non-league activity markers (pickup games,
// scrimmages, drop-ins, etc.) — add new terms here as they come up. Matched
// case-insensitively with word boundaries against the TITLE ONLY (never the
// description — see the comment at the call site).
const IGNORE_RE = /\b(scrimmage|drop[\s-]?in|pick[\s-]?up|night football)\b/i;

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

    // 0. Non-league activity (pickup/scrimmage/drop-in/etc.) — skip silently.
    // Title only, deliberately: matching the free-form description risks
    // silently dropping a real match whose notes happen to mention one of
    // these words, which would be invisible data loss (no report line).
    if (IGNORE_RE.test(rawTitle)) {
        return {
            isMatch: false,
            sub: false,
            goals: 0,
            goalsIsMinimum: false,
            assists: 0,
            flags: [],
            blocking: false,
        };
    }

    // 1. Is it a match? Needs a score or a W/D/L token in the description.
    const score = SCORE_RE.exec(rawDesc);
    const resultLetter = RESULT_RE.exec(rawDesc);
    const isMatch = Boolean(score || resultLetter);
    const base: ParsedMatch = {
        isMatch,
        sub: false,
        goals: 0,
        goalsIsMinimum: false,
        assists: 0,
        flags,
        blocking: false,
    };
    if (!isMatch) return base;

    // 2. Sub marker (strip before team matching so it can't corrupt the name).
    base.sub = SUB_RE.test(rawTitle);
    const cleanTitle = rawTitle.replace(SUB_RE, " ");
    const normTitle = normalize(cleanTitle);

    // 3. Team — normalized dictionary substring match. With per-season teams,
    // several TEAMS entries can share a display name (e.g. three "Charlie
    // Cheers FC", one per season). Collect ALL teams whose normalized name
    // is contained in the title rather than taking the first: if exactly one
    // matches, resolve it as before; if more than one matches, don't guess —
    // treat the team as unresolved (falls through to the guest path below)
    // and flag the ambiguity so a human assigns the season by hand.
    const titleMatches = input.teams.filter((t) =>
        normTitle.includes(normalize(t.name))
    );
    let team = titleMatches.length === 1 ? titleMatches[0] : undefined;
    const multiMatchFlag =
        titleMatches.length > 1
            ? `Title matches multiple team entries (${titleMatches
                  .map((t) => t.id)
                  .join(
                      ", "
                  )}); recorded as a guest — assign the season by hand.`
            : undefined;

    // 4. Split the cleaned title on "Team - League" style separators. The
    // last segment (when there are >= 2) is the explicit league claim; the
    // segment(s) before it are the fallback guest label, used only when no
    // blessed league is recognized (step 9 derives the order-independent
    // label directly from `segments` once a blessed league is found).
    const segments = cleanTitle.split(/\s*[-–—|·]\s*/).map((s) => s.trim());
    const leagueSegment =
        segments.length >= 2 ? segments[segments.length - 1] : undefined;
    const preLeagueSegments =
        segments.length >= 2 ? segments.slice(0, -1) : segments;

    // 5. League — a blessed dictionary substring match anywhere in the title
    // always wins. Otherwise, an explicit (but unrecognized) league segment
    // is flagged rather than silently accepted or ignored.
    const league = input.leagues.find((l) => normTitle.includes(normalize(l)));
    const unrecognizedLeagueFlag = leagueSegment
        ? `Unrecognized league "${leagueSegment}" — add it to the blessed list or correct the post.`
        : undefined;

    // 6. Format token (optional).
    const fmt = FORMAT_RE.exec(hay);
    const format = fmt ? fmt[1].replace(/\s+/g, "").toLowerCase() : undefined;

    // 7. Score → result (source of truth); contradicting letter flags.
    if (score) {
        const forGoals = Number(score[1]);
        const against = Number(score[2]);
        base.score = [forGoals, against];
        base.result = forGoals > against ? "W" : forGoals < against ? "L" : "D";
        if (resultLetter) {
            const letter = resultLetter[1].toUpperCase() as "W" | "D" | "L";
            if (letter !== base.result) {
                flags.push(
                    `Result letter "${letter}" disagrees with score ${forGoals}–${against}; used ${base.result}.`
                );
            }
        }
    } else {
        // W/D/L present but no score — can't complete the record.
        base.result = resultLetter![1].toUpperCase() as "W" | "D" | "L";
        flags.push("No score found; fill it in.");
        base.blocking = true;
    }

    // 8. Goals / assists.
    const g = GOALS_RE.exec(hay);
    if (g) {
        base.goals = Number(g[1]);
        base.goalsIsMinimum = Boolean(g[2]);
    }
    const a = ASSISTS_RE.exec(hay);
    if (a) base.assists = Number(a[1]);

    // 9. Extract the non-league team label — the same label guests are
    // recorded under. Computed unconditionally (not just on the guest path)
    // so the near-miss fold below can compare it against rostered team names
    // before the team-vs-guest decision is made. When a blessed league is
    // recognized, the label is whatever segment(s) are left after dropping
    // the one segment that IS the recognized league (identified by an exact
    // match, not substring containment, so a guest name that merely contains
    // the league word — e.g. "Volo Rebels" vs league "Volo" — survives
    // intact). This is order-independent, so "NYC Footy - FA Orange Julius"
    // and "ABCDE FC - NYC Footy" both yield the correct team-only label. If
    // no segment is an exact match (e.g. the league was only recognized as a
    // substring inside a single no-separator segment), fall back to treating
    // the last segment as the (unrecognized) league claim, same as when no
    // blessed league is recognized at all.
    let label: string | undefined;
    if (league) {
        const nLeague = normalize(league);
        const leagueSegIndex = segments.findIndex(
            (s) => normalize(s.replace(FORMAT_RE, "").trim()) === nLeague
        );
        if (leagueSegIndex !== -1) {
            const remaining = segments.filter((_, i) => i !== leagueSegIndex);
            label = remaining.join(" ").trim() || undefined;
        } else {
            label = preLeagueSegments.join(" ").trim() || undefined;
        }
    } else {
        label = preLeagueSegments.join(" ").trim() || undefined;
    }

    // 10. Near-miss fold: only when the exact substring match (step 3) found
    // nothing at all — never when it found more than one (an exact-name
    // ambiguity takes precedence over fuzzy matching; guessing among
    // several exact matches via typo-distance would be even less justified
    // than guessing among them directly). Folds a conservative typo of a
    // rostered team's name (e.g. "Charlie Cheer FC" missing the "s") to that
    // team instead of letting it become a phantom guest. The known-team
    // branch below then handles it exactly like a real match (teamId/league
    // + league-mismatch flag), with an added non-blocking info flag naming
    // the auto-correction.
    let autoMatchFlag: string | undefined;
    if (!team && titleMatches.length === 0) {
        const nearMiss = findNearMissTeam(label, input.teams);
        if (nearMiss) {
            team = nearMiss;
            autoMatchFlag = `Title team "${label}" ≈ ${team.name} (auto-matched; fix the Strava title if wrong).`;
        }
    }

    // 11. Resolve team vs guest.
    if (team) {
        base.teamId = team.id;
        base.league = team.league;
        if (autoMatchFlag) flags.push(autoMatchFlag);
        if (league) {
            if (normalize(league) !== normalize(team.league)) {
                flags.push(
                    `Post league "${league}" differs from ${team.name}'s league ${team.league}; kept ${team.league}.`
                );
            }
        } else if (unrecognizedLeagueFlag) {
            // No blessed league recognized, but the title explicitly claims
            // one via a separator segment — flag it even though the team
            // itself is known. No separator segment at all (e.g. an
            // opponent after "vs" or a parenthetical tag) makes no league
            // claim, so it's left alone.
            flags.push(unrecognizedLeagueFlag);
            base.blocking = true;
        }
    } else {
        // No rostered team, and no near-miss fold applied either.
        if (multiMatchFlag) flags.push(multiMatchFlag);
        base.guest = { team: label, format };
        if (league) {
            base.league = league;
            base.guest.league = league;
            // A recognized league makes this a legitimate free-agent/guest
            // appearance rather than a data-entry error — record it
            // without blocking, but leave a breadcrumb in case "guest" is
            // actually a rostered team missing from TEAMS.
            if (!base.sub) {
                flags.push(
                    `Recorded "${label ?? "[Unknown team]"}" as a guest team in ${league}. If this is a rostered team, add it to TEAMS.`
                );
            }
        } else {
            flags.push(
                unrecognizedLeagueFlag ??
                    "Unrecognized league — add it to the blessed list or correct the post."
            );
            base.blocking = true;
            if (!base.sub) {
                flags.push(
                    `Unrecognized team${label ? ` "${label}"` : ""} on a non-sub match — define the team or mark it (sub).`
                );
            }
        }
    }
    return base;
}
