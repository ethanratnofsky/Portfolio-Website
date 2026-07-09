/* FIELD REPORT — recreational-soccer source data (APPENDIX A sheet).

   Everything the section renders — tiles, FORM strip, season ledger, match
   log, charts, streaks — is DERIVED from MATCHES (see soccer-derive.ts).
   There are no stored totals anywhere: after a game, append one Match here
   and every number on the site recomputes at build time.

   Seasons can span calendar years ("Winter 2025 – 26"); the label and
   months strings carry that, nothing is parsed from them. A goals count you
   lost track of mid-celebration gets goalsIsMinimum: true and renders with
   the accent † (aggregates show "N+†" / "N†" per scope). */

export const LEAGUES = ["NYC Footy", "Volo", "NYC Soccer"] as const;
export type League = (typeof LEAGUES)[number];

export interface Team {
    id: string;
    name: string;
    league: League;
    /** NYC Footy tier (P1 strongest). Volo has no tiers — omit, never render. */
    division?: "P1" | "P2" | "P3" | "P4" | "P5";
    /** e.g. "7v7" | "8v8" | "6v6" */
    format: string;
    venue: "outdoor" | "indoor";
}

export interface Season {
    id: string;
    /** Display label, e.g. "Summer 2026", "Winter 2025 – 26". */
    label: string;
    /** Months range for the ledger, e.g. "JUN — AUG". */
    months: string;
    status: "in-play" | "sealed";
    /** ISO date the season opens (inclusive) — used to assign imported matches. */
    start: string;
    /** ISO date the season closes (inclusive); omit while in-play. */
    end?: string;
    teamIds: string[];
}

export interface Match {
    /** ISO date, e.g. "2026-06-29". */
    date: string;
    seasonId: string;
    result: "W" | "D" | "L";
    /** [for, against] */
    score: [number, number];
    goals: number;
    /** † flag — count is a known undercount. */
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

export const TEAMS: Team[] = [
    {
        id: "charlie-cheers",
        name: "Charlie Cheers FC",
        league: "NYC Footy",
        division: "P4", // TODO(ethan): set the real P1–P5 tier
        format: "7v7",
        venue: "outdoor",
    },
    {
        id: "fa-blast",
        name: "FA Blast from the Past",
        league: "NYC Footy",
        division: "P3", // TODO(ethan): set the real P1–P5 tier
        format: "8v8",
        venue: "outdoor",
    },
    {
        id: "salmon-roe",
        name: "Salmon Roe United",
        league: "Volo",
        format: "6v6",
        venue: "indoor",
    },
];

export const SEASONS: Season[] = [
    {
        id: "fall-2025",
        label: "Fall 2025",
        months: "SEP — NOV",
        status: "sealed",
        start: "2025-09-01",
        end: "2025-11-15",
        teamIds: ["charlie-cheers"],
    },
    {
        id: "winter-2025-26",
        label: "Winter 2025 – 26",
        months: "NOV — FEB",
        status: "sealed",
        start: "2025-11-16",
        end: "2026-02-28",
        teamIds: ["charlie-cheers", "salmon-roe"],
    },
    {
        id: "spring-2026",
        label: "Spring 2026",
        months: "MAR — MAY",
        status: "sealed",
        start: "2026-03-01",
        end: "2026-05-31",
        teamIds: ["charlie-cheers", "fa-blast"],
    },
    {
        id: "summer-2026",
        label: "Summer 2026",
        months: "JUN — AUG",
        status: "in-play",
        start: "2026-06-01",
        teamIds: ["charlie-cheers", "fa-blast", "salmon-roe"],
    },
];

// The three sealed seasons below are PLACEHOLDERS from the design handoff
// (result sequences and G/A per match match its charts; dates, scores and
// team splits are invented). Backfill the real matches from the Strava
// archive — every derived number recomputes. Summer 2026 is real so far.
//
// Matches live in matches.json (not inline) so the Strava importer can write
// data without touching this file. `with { type: "json" }` is required so
// the Node-based importer (which imports this module directly) can load the
// JSON; Vite/Astro accept the attribute too. The cast through `unknown` is
// needed because JSON infers `score` as `number[]` and `result` as `string`,
// not the tuple/union types declared above.
import matchesData from "./matches.json" with { type: "json" };
export const MATCHES: Match[] = matchesData as unknown as Match[];
