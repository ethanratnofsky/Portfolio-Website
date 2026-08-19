import { test } from "node:test";
import assert from "node:assert/strict";
import {
    allTime,
    matchTeam,
    matchTeamLog,
    matchesBySeasonThenDate,
    record,
    seasonAgg,
    seasonTeamRows,
    teamCount,
} from "./soccer-derive.ts";
import type { Agg, MatchTeam } from "./soccer-derive.ts";
import { MATCHES, SEASONS, TEAMS } from "./soccer.ts";
import type { Match } from "./soccer.ts";

test("all-time aggregates are internally consistent with the live data", () => {
    const at = allTime();
    assert.equal(at.played, MATCHES.length);
    assert.equal(at.w + at.d + at.l, at.played);
    assert.equal(
        at.goals,
        MATCHES.reduce((s, m) => s + m.goals, 0)
    );
    assert.equal(
        at.assists,
        MATCHES.reduce((s, m) => s + m.assists, 0)
    );
    assert.equal(at.seasons, SEASONS.length);
});

test("record formats w–d–l with en dashes", () => {
    const agg: Agg = {
        played: 24,
        w: 14,
        d: 3,
        l: 7,
        goals: 25,
        goalsIsMin: false,
        assists: 7,
    };
    assert.equal(record(agg), "14–3–7");
});

test("Spring 2026 (sealed) record is pinned against W/D/L flips", () => {
    // Computed from the 23 spring-2026 matches in matches.json (incl. the
    // Real Sosobad guest sub, a Spring win): 15 W, 1 D, 7 L.
    assert.equal(record(seasonAgg("spring-2026")), "15–1–7");
});

test("matchTeam resolves a rostered team from teamId", () => {
    const t = TEAMS.find((t) => t.id === "salmon-roe")!;
    const mt = matchTeam({ teamId: t.id } as Match, 0);
    assert.equal(mt.name, t.name);
    assert.equal(mt.league, t.league);
    assert.equal(mt.division, t.division);
    assert.equal(mt.format, t.format);
    assert.equal(mt.isGuest, false);
    assert.equal(mt.groupKey, t.id);
});

test("matchTeam falls back to guest label, then [Unknown team]", () => {
    const labelled = matchTeam(
        {
            guest: {
                team: "Real Sosobad",
                league: "NYC Soccer",
                level: "Div 2",
                venue: "outdoor",
            },
        } as Match,
        0
    );
    assert.equal(labelled.name, "Real Sosobad");
    assert.equal(labelled.league, "NYC Soccer");
    assert.equal(labelled.division, "Div 2");
    assert.equal(labelled.venue, "outdoor"); // guests can carry a venue
    assert.equal(labelled.isGuest, true);
    assert.equal(labelled.groupKey, "guest:real sosobad");

    const unknown = matchTeam({ guest: { league: "NYC Soccer" } } as Match, 7);
    assert.equal(unknown.name, "[Unknown team]");
    assert.equal(unknown.groupKey, "guest:7"); // per-match, so two unknowns never merge
});

test("matchTeam reports the sub flag", () => {
    assert.equal(
        matchTeam({ teamId: "salmon-roe", sub: true } as Match, 0).sub,
        true
    );
    assert.equal(matchTeam({ teamId: "salmon-roe" } as Match, 0).sub, false);
});

test("matchTeamLog formats rostered and guest teams", () => {
    const rostered: MatchTeam = {
        name: "x",
        league: "NYC Footy",
        division: "P3",
        format: "7v7",
        venue: "outdoor",
        isGuest: false,
        sub: false,
        groupKey: "x",
    };
    assert.equal(matchTeamLog(rostered), "NYC FOOTY · P3 · 7V7 OUT");

    const volo: MatchTeam = {
        name: "x",
        league: "Volo",
        isGuest: false,
        sub: false,
        format: "7v7",
        venue: "indoor",
        groupKey: "x",
    };
    assert.equal(matchTeamLog(volo), "VOLO · 7V7 INDOOR");

    const guest: MatchTeam = {
        name: "x",
        league: "NYC Soccer",
        division: "Div 2",
        format: "7v7",
        venue: undefined,
        isGuest: true,
        sub: false,
        groupKey: "guest:x",
    };
    assert.equal(matchTeamLog(guest), "NYC SOCCER · DIV 2 · 7V7");

    const guestWithVenue: MatchTeam = {
        name: "x",
        league: "NYC Footy",
        division: "P3",
        format: "7v7",
        venue: "outdoor",
        isGuest: true,
        sub: true,
        groupKey: "guest:x",
    };
    assert.equal(matchTeamLog(guestWithVenue), "NYC FOOTY · P3 · 7V7 OUT");
});

test("seasonTeamRows derives Spring 2026 (sealed) team rows from matches", () => {
    const rows = seasonTeamRows("spring-2026");
    // Rostered teams in teamIds order, then the Real Sosobad guest (a Spring
    // sub) appended after, in first-appearance order.
    assert.deepEqual(
        rows.map((r) => r.team.name),
        [
            "Charlie Cheers FC",
            "ABCDE FC",
            "FA Seven Wonders of the Goal",
            "Real Sosobad",
        ]
    );
    assert.equal(teamCount("spring-2026"), 4);
    const charlie = rows[0];
    assert.equal(charlie.agg.played, 8);
    assert.equal(charlie.agg.goals, 7);
    assert.equal(charlie.agg.assists, 0);
});

test("matchesBySeasonThenDate makes each season a contiguous block, date-sorted within", () => {
    const ms = matchesBySeasonThenDate();
    assert.equal(ms.length, MATCHES.length); // nothing dropped

    // Collapse consecutive season ids into runs; each season must appear in
    // exactly one run (contiguous) and the runs must follow SEASONS order.
    const runs: string[] = [];
    for (const m of ms)
        if (runs[runs.length - 1] !== m.seasonId) runs.push(m.seasonId);
    assert.equal(
        runs.length,
        new Set(runs).size,
        "each season is one contiguous block"
    );
    const present = SEASONS.map((s) => s.id).filter((id) => runs.includes(id));
    assert.deepEqual(runs, present, "blocks follow SEASONS declaration order");

    // Dates ascending within each season.
    for (const s of SEASONS) {
        const dates = ms.filter((m) => m.seasonId === s.id).map((m) => m.date);
        assert.deepEqual(dates, [...dates].sort());
    }

    // The interleave bug this fixes: the Fall match dated 2025-12-14 must sort
    // BEFORE the Winter match dated 2025-12-08 (season order beats raw date).
    const iFall = ms.findIndex((m) => m.date === "2025-12-14");
    const iWinter = ms.findIndex((m) => m.date === "2025-12-08");
    assert.ok(iFall >= 0 && iWinter >= 0);
    assert.ok(
        iFall < iWinter,
        "Fall 12-14 precedes Winter 12-08 under season-then-date"
    );
});

// Guards the bug the season-scoped importer fixes: before team resolution was
// scoped to the match's season, every "Charlie Cheers FC" title matched all
// three of its team-seasons at once, and the importer filed the match as a
// GUEST rather than guessing. Those rows split one rostered team into two
// entities on the site. A guest label that is a rostered team name in that
// same season is always a mis-recorded match.
test("no guest match wears the name of a team rostered in its own season", () => {
    const offenders = MATCHES.filter((m) => {
        const label = m.guest?.team;
        if (!label) return false;
        return TEAMS.some(
            (t) =>
                t.seasonId === m.seasonId &&
                t.name.toLowerCase() === label.toLowerCase()
        );
    }).map((m) => `${m.date} ${m.guest?.team} (${m.seasonId})`);
    assert.deepEqual(offenders, []);
});
