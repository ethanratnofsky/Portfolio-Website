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
        if (league) {
            if (normalize(league) !== normalize(team.league)) {
                flags.push(`Post league "${league}" differs from ${team.name}'s league ${team.league}; kept ${team.league}.`);
            }
        } else {
            // No blessed league recognized in the title. If there's leftover
            // text beyond the team name (and format token), it's an
            // unrecognized league mention — flag it even though the team
            // itself is known.
            let residual = normTitle.replace(normalize(team.name), " ");
            if (format) residual = residual.replace(normalize(format), " ");
            residual = residual.replace(/\s+/g, " ").trim();
            if (residual) {
                flags.push(`Unrecognized league "${residual}" — add it to the blessed list or correct the post.`);
                base.blocking = true;
            }
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
