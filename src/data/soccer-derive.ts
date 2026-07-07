/* FIELD REPORT — build-time derivations over soccer.ts.

   Pure functions only; every number the section shows comes through here
   ("RECOMPUTED EVERY MATCH — NEVER HAND-EDITED"). Dash characters are
   en dashes (–) and separators are middle dots (·), per the register style. */

import { MATCHES, SEASONS, TEAMS } from "./soccer";
import type { Match, Season, Team } from "./soccer";

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

/** Per-team lines within a season, in the season's teamIds order. */
export function teamLines(seasonId: string): { team: Team; agg: Agg }[] {
    return seasonById(seasonId).teamIds.map((teamId) => ({
        team: teamById(teamId),
        agg: aggregate(matchesFor(seasonId).filter((m) => m.teamId === teamId)),
    }));
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

/** Chip text: "7V7 · OUTDOOR" (ledger) — uppercase register style. */
export function chipFormat(team: Team): string {
    return `${team.format.toUpperCase()} · ${team.venue.toUpperCase()}`;
}

/** Match-log league string: "NYC FOOTY · P4 · 7V7 OUT" / "VOLO · 6V6 INDOOR". */
export function logFormat(team: Team): string {
    const fmt = team.format.toUpperCase();
    const venue = team.venue === "outdoor" ? "OUT" : team.venue.toUpperCase();
    return team.league === "NYC Footy"
        ? `NYC FOOTY · ${team.division} · ${fmt} ${venue}`
        : `${team.league.toUpperCase()} · ${fmt} ${venue.toUpperCase()}`;
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
