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

/** NYC Footy tier (P1 strongest); some teams span two adjacent tiers. */
export type Division = "P1" | "P2" | "P3" | "P4" | "P5" | "P2/P3" | "P3/P4";

export interface Team {
    id: string;
    name: string;
    /** Season this entry participates in — each team-season is its own TEAMS
        entry (e.g. Charlie Cheers FC has one entry per season it played). */
    seasonId: string;
    league: League;
    /** NYC Footy tier. Volo has no tiers — omit, never render. */
    division?: Division;
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
        venue?: "outdoor" | "indoor";
    };
}

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
];

export const SEASONS: Season[] = [
    {
        id: "fall-2025",
        label: "Fall 2025",
        months: "OCT — DEC",
        status: "sealed",
        start: "2025-10-01",
        end: "2025-12-15",
        teamIds: [
            "fa-orange-julius-fall-2025",
            "fa-rapinoe-grigio-fall-2025",
            "fa-pretty-in-pink-fall-2025",
        ],
    },
    {
        id: "winter-2025-26",
        label: "Winter 2025 – 26",
        months: "DEC — MAR",
        status: "sealed",
        start: "2025-12-16",
        end: "2026-03-31",
        teamIds: [
            "charlie-cheers-winter-2025-26",
            "formerly-fate-winter-2025-26",
            "fa-goalmates-winter-2025-26",
        ],
    },
    {
        id: "spring-2026",
        label: "Spring 2026",
        months: "APR — JUN",
        status: "sealed",
        start: "2026-04-01",
        end: "2026-06-13",
        teamIds: [
            "charlie-cheers-spring-2026",
            "abcde-fc-spring-2026",
            "fa-seven-wonders-spring-2026",
        ],
    },
    {
        id: "summer-2026",
        label: "Summer 2026",
        months: "JUN — AUG",
        status: "sealed",
        start: "2026-06-14",
        teamIds: [
            "charlie-cheers-summer-2026",
            "salmon-roe-summer-2026",
            "fa-blast-summer-2026",
        ],
    },
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
];

// Matches live in matches.json (not inline) so the Strava importer can write
// data without touching this file. `with { type: "json" }`
// is required so
// the Node-based importer (which imports this module directly) can load the
// JSON; Vite/Astro accept the attribute too. The cast through `unknown` is
// needed because JSON infers `score` as `number[]` and `result` as `string`,
// not the tuple/union types declared above.
import matchesData from "./matches.json" with { type: "json" };
export const MATCHES: Match[] = matchesData as unknown as Match[];
