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

    // 4. Split the cleaned title on "Team - League" style separators. The
    // last segment (when there are >= 2) is the explicit league claim; the
    // segment(s) before it are the fallback guest label.
    const segments = cleanTitle.split(/\s*[-–—|·]\s*/).map((s) => s.trim());
    const leagueSegment = segments.length >= 2 ? segments[segments.length - 1] : undefined;
    const preLeagueSegments = segments.length >= 2 ? segments.slice(0, -1) : segments;

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
                flags.push(`Result letter "${letter}" disagrees with score ${forGoals}–${against}; used ${base.result}.`);
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
    if (g) { base.goals = Number(g[1]); base.goalsIsMinimum = Boolean(g[2]); }
    const a = ASSISTS_RE.exec(hay);
    if (a) base.assists = Number(a[1]);

    // 9. Resolve team vs guest.
    if (team) {
        base.teamId = team.id;
        base.league = team.league;
        if (league) {
            if (normalize(league) !== normalize(team.league)) {
                flags.push(`Post league "${league}" differs from ${team.name}'s league ${team.league}; kept ${team.league}.`);
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
        // No rostered team. The segment(s) before the league segment (if
        // any) become the guest label.
        const label = preLeagueSegments.join(" ").trim() || undefined;
        base.guest = { team: label, format };
        if (league) {
            base.league = league;
            base.guest.league = league;
        } else if (unrecognizedLeagueFlag) {
            flags.push(unrecognizedLeagueFlag);
            base.blocking = true;
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
