import { test } from "node:test";
import assert from "node:assert/strict";
import {
    allTime,
    matchTeam,
    matchTeamLog,
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
    // Computed from the 22 spring-2026 matches in matches.json: 14 W, 1 D, 7 L.
    assert.equal(record(seasonAgg("spring-2026")), "14–1–7");
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
            },
        } as Match,
        0
    );
    assert.equal(labelled.name, "Real Sosobad");
    assert.equal(labelled.league, "NYC Soccer");
    assert.equal(labelled.division, "Div 2");
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
});

test("seasonTeamRows derives Spring 2026 (sealed) team rows from matches", () => {
    const rows = seasonTeamRows("spring-2026");
    assert.deepEqual(
        rows.map((r) => r.team.name),
        ["Charlie Cheers FC", "ABCDE FC", "FA Seven Wonders of the Goal"]
    );
    assert.equal(teamCount("spring-2026"), 3);
    const charlie = rows[0];
    assert.equal(charlie.agg.played, 8);
    assert.equal(charlie.agg.goals, 7);
    assert.equal(charlie.agg.assists, 0);
});
