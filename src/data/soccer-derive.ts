/* FIELD REPORT — build-time derivations over soccer.ts.

   Pure functions only; every number the section shows comes through here
   ("RECOMPUTED EVERY MATCH — NEVER HAND-EDITED"). Dash characters are
   en dashes (–) and separators are middle dots (·), per the register style. */

import { MATCHES, SEASONS, TEAMS } from "./soccer.ts";
import type { League, Match, Season, Team } from "./soccer.ts";

export interface Agg {
    played: number;
    w: number;
    d: number;
    l: number;
    goals: number;
    goalsIsMin: boolean;
    assists: number;
}

/** Matches sorted oldest → newest (stable for same-day doubleheaders). */
export function sortedMatches(): Match[] {
    return [...MATCHES].sort((a, b) => a.date.localeCompare(b.date));
}

export function matchesFor(seasonId?: string): Match[] {
    const all = sortedMatches();
    return seasonId ? all.filter((m) => m.seasonId === seasonId) : all;
}

export function teamById(id: string): Team {
    const team = TEAMS.find((t) => t.id === id);
    if (!team) throw new Error(`Unknown team id: ${id}`);
    return team;
}

export function seasonById(id: string): Season {
    const season = SEASONS.find((s) => s.id === id);
    if (!season) throw new Error(`Unknown season id: ${id}`);
    return season;
}

/** Seasons ordered oldest → newest, as declared in soccer.ts. */
export function seasonsChrono(): Season[] {
    return SEASONS;
}

export function currentSeason(): Season | undefined {
    return SEASONS.find((s) => s.status === "in-play");
}

function aggregate(matches: Match[]): Agg {
    const agg: Agg = {
        played: matches.length,
        w: 0,
        d: 0,
        l: 0,
        goals: 0,
        goalsIsMin: false,
        assists: 0,
    };
    for (const m of matches) {
        if (m.result === "W") agg.w++;
        else if (m.result === "D") agg.d++;
        else agg.l++;
        agg.goals += m.goals;
        agg.assists += m.assists;
        if (m.goalsIsMinimum) agg.goalsIsMin = true;
    }
    return agg;
}

export function allTime(): Agg & { seasons: number } {
    return { ...aggregate(MATCHES), seasons: SEASONS.length };
}

export function seasonAgg(seasonId: string): Agg {
    return aggregate(matchesFor(seasonId));
}

/** Last n matches across all teams, oldest → newest (the FORM squares). */
export function lastN(n: number): Match[] {
    return sortedMatches().slice(-n);
}

export function currentStreak(): { kind: "W" | "D" | "L"; len: number } {
    const all = sortedMatches();
    const last = all[all.length - 1];
    if (!last) return { kind: "W", len: 0 };
    let len = 0;
    for (let i = all.length - 1; i >= 0 && all[i].result === last.result; i--)
        len++;
    return { kind: last.result, len };
}

/** Longest run of consecutive matches satisfying pred (W streak, unbeaten…). */
export function longestStreak(pred: (m: Match) => boolean): number {
    let best = 0;
    let run = 0;
    for (const m of sortedMatches()) {
        run = pred(m) ? run + 1 : 0;
        if (run > best) best = run;
    }
    return best;
}

export function goalsPerMatch(): string {
    const { goals, played } = allTime();
    return played ? (goals / played).toFixed(2) : "0.00";
}

/** "14–3–7" (en dashes). */
export function record(a: Agg): string {
    return `${a.w}–${a.d}–${a.l}`;
}

/* Goals-count suffix, from the design's examples:
   – team line:   known undercount → "†"            (Salmon Roe "2†")
   – season:      in play → "+", else undercount → "†"  ("8+ G", "6† G")
   – all-time:    "+" while a season is in play, plus "†" if any undercount
                  anywhere ("25+†") */
export function goalsSuffix(
    scope: "team" | "season" | "all",
    agg: Agg,
    inPlay = false
): string {
    if (scope === "team") return agg.goalsIsMin ? "†" : "";
    if (scope === "season") return inPlay ? "+" : agg.goalsIsMin ? "†" : "";
    return (inPlay ? "+" : "") + (agg.goalsIsMin ? "†" : "");
}

/** Display-shape for a match's team, whether rostered (teamId) or a
    guest/inline appearance; `groupKey` is what callers dedupe/group rows by. */
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
    appearance. `index` is required — the per-match position — so that two
    distinct unknown-team guests are never merged into the same groupKey. */
export function matchTeam(m: Match, index: number): MatchTeam {
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
        // Lowercased so case variants of the same guest team ("Real Sosobad"
        // vs "real sosobad") dedupe to a single groupKey/row.
        groupKey: label ? `guest:${label.toLowerCase()}` : `guest:${index}`,
    };
}

/** Per-team ledger rows within a season, derived from matches: grouped by
    `matchTeam().groupKey`, ordered per the season's `teamIds` (rostered teams
    in their authored order), with any groups outside `teamIds` (guest/one-off
    appearances) after, in first-appearance order. Each group's stats
    aggregated. This is the render source for per-team season lines — unlike a
    walk of `Season.teamIds` alone, it also reflects guest/sub appearances. */
export function seasonTeamRows(
    seasonId: string
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
    // Rostered teams (groupKey === teamId) sort by their teamIds position;
    // guests/one-offs (not in teamIds) sort after, preserving the
    // first-appearance order already captured above (sort is stable).
    const ids = seasonById(seasonId).teamIds;
    const rank = (key: string) => {
        const i = ids.indexOf(key);
        return i >= 0 ? i : ids.length;
    };
    order.sort((a, b) => rank(a) - rank(b));
    return order.map((key) => {
        const ms = groups.get(key)!;
        // Resolve display from the first match of the group.
        const team = matchTeam(ms[0], matches.indexOf(ms[0]));
        return { team, agg: aggregate(ms) };
    });
}

/** Number of distinct teams (by groupKey) a season fielded. */
export function teamCount(seasonId: string): number {
    return seasonTeamRows(seasonId).length;
}

/** Match-log league string from a resolved MatchTeam:
    "NYC FOOTY · P4 · 7V7 OUT" / "VOLO · 6V6 INDOOR" / "NYC SOCCER · DIV 2 · 7V7". */
export function matchTeamLog(mt: MatchTeam): string {
    const parts: string[] = [];
    if (mt.league) parts.push(mt.league.toUpperCase());
    if (mt.division) parts.push(mt.division.toUpperCase());
    const fmt = [
        mt.format?.toUpperCase(),
        mt.venue === "outdoor" ? "OUT" : mt.venue?.toUpperCase(),
    ]
        .filter(Boolean)
        .join(" ");
    if (fmt) parts.push(fmt);
    return parts.join(" · ");
}

const MONTHS = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
] as const;

/** "2026-06-08" → "JUN 08". */
export function logDate(iso: string): string {
    return `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(8, 10)}`;
}

/** Short season tag for chart axes: "FALL '25", "WINTER '25–26". */
export function shortSeason(season: Season): string {
    return season.label
        .toUpperCase()
        .replace(/\s*–\s*/, "–")
        .replace(/\b(\d{2})(\d{2})\b/g, "'$2");
}
