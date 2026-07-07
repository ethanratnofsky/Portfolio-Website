/* FIELD REPORT — recreational-soccer source data (APPENDIX A sheet).

   Everything the section renders — tiles, FORM strip, season ledger, match
   log, charts, streaks — is DERIVED from MATCHES (see soccer-derive.ts).
   There are no stored totals anywhere: after a game, append one Match here
   and every number on the site recomputes at build time.

   Seasons can span calendar years ("Winter 2025 – 26"); the label and
   months strings carry that, nothing is parsed from them. A goals count you
   lost track of mid-celebration gets goalsIsMinimum: true and renders with
   the accent † (aggregates show "N+†" / "N†" per scope). */

export type League = "NYC Footy" | "Volo";

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
    teamIds: string[];
}

export interface Match {
    /** ISO date, e.g. "2026-06-29". */
    date: string;
    seasonId: string;
    teamId: string;
    result: "W" | "D" | "L";
    /** [for, against] */
    score: [number, number];
    goals: number;
    /** † flag — count is a known undercount. */
    goalsIsMinimum?: boolean;
    assists: number;
    note?: string;
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
        teamIds: ["charlie-cheers"],
    },
    {
        id: "winter-2025-26",
        label: "Winter 2025 – 26",
        months: "NOV — FEB",
        status: "sealed",
        teamIds: ["charlie-cheers", "salmon-roe"],
    },
    {
        id: "spring-2026",
        label: "Spring 2026",
        months: "MAR — MAY",
        status: "sealed",
        teamIds: ["charlie-cheers", "fa-blast"],
    },
    {
        id: "summer-2026",
        label: "Summer 2026",
        months: "JUN — AUG",
        status: "in-play",
        teamIds: ["charlie-cheers", "fa-blast", "salmon-roe"],
    },
];

// TODO(ethan): the three sealed seasons below are PLACEHOLDERS from the design
// handoff (result sequences and G/A per match match its charts; dates, scores
// and team splits are invented). Backfill the real matches from the Strava
// archive — every derived number recomputes. Summer 2026 is real so far.
export const MATCHES: Match[] = [
    // ---- Fall 2025 (placeholder) ----
    {
        date: "2025-09-14",
        seasonId: "fall-2025",
        teamId: "charlie-cheers",
        result: "W",
        score: [3, 1],
        goals: 1,
        assists: 0,
    },
    {
        date: "2025-09-28",
        seasonId: "fall-2025",
        teamId: "charlie-cheers",
        result: "L",
        score: [1, 2],
        goals: 0,
        assists: 0,
    },
    {
        date: "2025-10-12",
        seasonId: "fall-2025",
        teamId: "charlie-cheers",
        result: "D",
        score: [2, 2],
        goals: 2,
        assists: 1,
    },
    {
        date: "2025-10-26",
        seasonId: "fall-2025",
        teamId: "charlie-cheers",
        result: "W",
        score: [2, 0],
        goals: 0,
        assists: 0,
    },
    {
        date: "2025-11-09",
        seasonId: "fall-2025",
        teamId: "charlie-cheers",
        result: "L",
        score: [1, 4],
        goals: 1,
        assists: 0,
    },

    // ---- Winter 2025 – 26 (placeholder) ----
    {
        date: "2025-11-23",
        seasonId: "winter-2025-26",
        teamId: "salmon-roe",
        result: "W",
        score: [4, 2],
        goals: 0,
        assists: 0,
    },
    {
        date: "2025-12-07",
        seasonId: "winter-2025-26",
        teamId: "salmon-roe",
        result: "W",
        score: [5, 3],
        goals: 2,
        goalsIsMinimum: true,
        assists: 1,
    },
    {
        date: "2025-12-21",
        seasonId: "winter-2025-26",
        teamId: "charlie-cheers",
        result: "L",
        score: [2, 3],
        goals: 1,
        assists: 0,
    },
    {
        date: "2026-01-11",
        seasonId: "winter-2025-26",
        teamId: "charlie-cheers",
        result: "D",
        score: [1, 1],
        goals: 0,
        assists: 0,
    },
    {
        date: "2026-01-25",
        seasonId: "winter-2025-26",
        teamId: "salmon-roe",
        result: "W",
        score: [3, 1],
        goals: 2,
        assists: 1,
    },
    {
        date: "2026-02-08",
        seasonId: "winter-2025-26",
        teamId: "charlie-cheers",
        result: "L",
        score: [1, 3],
        goals: 1,
        assists: 0,
    },

    // ---- Spring 2026 (placeholder) ----
    {
        date: "2026-03-08",
        seasonId: "spring-2026",
        teamId: "charlie-cheers",
        result: "W",
        score: [2, 1],
        goals: 1,
        assists: 1,
    },
    {
        date: "2026-03-22",
        seasonId: "spring-2026",
        teamId: "fa-blast",
        result: "L",
        score: [0, 2],
        goals: 0,
        assists: 0,
    },
    {
        date: "2026-04-05",
        seasonId: "spring-2026",
        teamId: "fa-blast",
        result: "W",
        score: [4, 1],
        goals: 2,
        assists: 0,
    },
    {
        date: "2026-04-19",
        seasonId: "spring-2026",
        teamId: "charlie-cheers",
        result: "W",
        score: [3, 2],
        goals: 1,
        assists: 1,
    },
    {
        date: "2026-05-03",
        seasonId: "spring-2026",
        teamId: "charlie-cheers",
        result: "D",
        score: [0, 0],
        goals: 0,
        assists: 0,
    },
    {
        date: "2026-05-17",
        seasonId: "spring-2026",
        teamId: "fa-blast",
        result: "W",
        score: [5, 2],
        goals: 2,
        assists: 1,
    },
    {
        date: "2026-05-31",
        seasonId: "spring-2026",
        teamId: "charlie-cheers",
        result: "L",
        score: [1, 2],
        goals: 1,
        assists: 0,
    },

    // ---- Summer 2026 (real) ----
    {
        date: "2026-06-01",
        seasonId: "summer-2026",
        teamId: "charlie-cheers",
        result: "W",
        score: [2, 1],
        goals: 1,
        assists: 0,
    },
    {
        date: "2026-06-08",
        seasonId: "summer-2026",
        teamId: "charlie-cheers",
        result: "L",
        score: [1, 3],
        goals: 0,
        assists: 0,
    },
    {
        date: "2026-06-15",
        seasonId: "summer-2026",
        teamId: "salmon-roe",
        result: "W",
        score: [6, 3],
        goals: 2,
        goalsIsMinimum: true,
        assists: 0,
        note: "lost count mid-celebration",
    },
    {
        date: "2026-06-17",
        seasonId: "summer-2026",
        teamId: "fa-blast",
        result: "W",
        score: [5, 2],
        goals: 2,
        assists: 0,
    },
    {
        date: "2026-06-24",
        seasonId: "summer-2026",
        teamId: "fa-blast",
        result: "W",
        score: [3, 1],
        goals: 2,
        assists: 0,
    },
    {
        date: "2026-06-29",
        seasonId: "summer-2026",
        teamId: "charlie-cheers",
        result: "W",
        score: [4, 2],
        goals: 1,
        assists: 1,
    },
];
