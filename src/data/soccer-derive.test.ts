import { test } from "node:test";
import assert from "node:assert/strict";
import {
    allTime,
    record,
    matchTeam,
    matchTeamLog,
    seasonTeamRows,
    teamCount,
} from "./soccer-derive.ts";
import type { Match } from "./soccer.ts";

test("all-time aggregates match the shipped register", () => {
    const at = allTime();
    assert.equal(at.played, 24);
    assert.equal(record(at), "14–3–7");
    assert.equal(at.goals, 25);
    assert.equal(at.assists, 7);
    assert.equal(at.seasons, 4);
});

test("matchTeam resolves a rostered team from teamId", () => {
    const m = { teamId: "charlie-cheers" } as Match;
    const mt = matchTeam(m, 0);
    assert.equal(mt.name, "Charlie Cheers FC");
    assert.equal(mt.league, "NYC Footy");
    assert.equal(mt.division, "P4");
    assert.equal(mt.format, "7v7");
    assert.equal(mt.isGuest, false);
    assert.equal(mt.groupKey, "charlie-cheers");
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
        matchTeam({ teamId: "charlie-cheers", sub: true } as Match, 0).sub,
        true
    );
    assert.equal(
        matchTeam({ teamId: "charlie-cheers" } as Match, 0).sub,
        false
    );
});

test("matchTeamLog formats rostered and guest teams", () => {
    assert.equal(
        matchTeamLog(matchTeam({ teamId: "charlie-cheers" } as any, 0)),
        "NYC FOOTY · P4 · 7V7 OUT"
    );
    assert.equal(
        matchTeamLog(matchTeam({ teamId: "salmon-roe" } as any, 0)),
        "VOLO · 6V6 INDOOR"
    );
    assert.equal(
        matchTeamLog(
            matchTeam(
                {
                    guest: {
                        league: "NYC Soccer",
                        level: "Div 2",
                        format: "7v7",
                    },
                } as any,
                0
            )
        ),
        "NYC SOCCER · DIV 2 · 7V7"
    );
});

test("seasonTeamRows derives Summer 2026 team rows from matches", () => {
    const rows = seasonTeamRows("summer-2026");
    // Order follows the season's authored teamIds order (rostered teams),
    // not first-match date — Summer 2026's teamIds is
    // [charlie-cheers, fa-blast, salmon-roe].
    assert.deepEqual(
        rows.map((r) => r.team.name),
        ["Charlie Cheers FC", "FA Blast from the Past", "Salmon Roe United"]
    );
    assert.equal(teamCount("summer-2026"), 3);
    const charlie = rows[0];
    assert.equal(charlie.agg.played, 3);
    assert.equal(charlie.agg.goals, 2);
    assert.equal(charlie.agg.assists, 1);
});
