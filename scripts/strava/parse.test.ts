import { test } from "node:test";
import assert from "node:assert/strict";
import { parseActivity, normalize } from "./parse.ts";

const TEAMS = [
    { id: "charlie-cheers", name: "Charlie Cheers FC", league: "NYC Footy" },
    { id: "fa-blast", name: "FA Blast from the Past", league: "NYC Footy" },
    { id: "salmon-roe", name: "Salmon Roe United", league: "Volo" },
];
const LEAGUES = ["NYC Footy", "Volo", "NYC Soccer"];
const parse = (title: string, description: string) =>
    parseActivity({ title, description, teams: TEAMS, leagues: LEAGUES });

test("normalize is case/whitespace/punctuation insensitive", () => {
    assert.equal(
        normalize("FA Blast  From the Past!"),
        normalize("fa blast from the past")
    );
});

test("a non-match Soccer activity is skipped", () => {
    assert.equal(
        parse("Sunday kickabout", "just messing around").isMatch,
        false
    );
});

test("parses the canonical post, deriving result from score", () => {
    const r = parse("FA Blast From the Past - NYC Footy", "W 4-1\n\n1 G");
    assert.equal(r.isMatch, true);
    assert.equal(r.teamId, "fa-blast");
    assert.equal(r.league, "NYC Footy");
    assert.deepEqual(r.score, [4, 1]);
    assert.equal(r.result, "W");
    assert.equal(r.goals, 1);
    assert.equal(r.assists, 0); // omitted → 0
    assert.equal(r.blocking, false);
    assert.equal(r.flags.length, 0);
});

test("order/case independent: league first, lowercase", () => {
    const r = parse("nyc footy — charlie cheers fc", "l 1-2");
    assert.equal(r.teamId, "charlie-cheers");
    assert.equal(r.result, "L");
});

test("draw derived from equal score", () => {
    assert.equal(parse("Salmon Roe United", "2-2").result, "D");
});

test("W/L letter contradicting the score flags, score wins", () => {
    const r = parse("Charlie Cheers FC", "W 1-3");
    assert.equal(r.result, "L");
    assert.ok(r.flags.some((f) => /result/i.test(f)));
});

test("N+ sets the minimum flag; plain N is exact", () => {
    assert.equal(
        parse("Salmon Roe United", "W 6-3\n2+ G").goalsIsMinimum,
        true
    );
    assert.equal(
        parse("Salmon Roe United", "W 6-3\n2 G").goalsIsMinimum,
        false
    );
});

test("assists parsed independently", () => {
    const r = parse("Charlie Cheers FC", "W 4-2\n1 G\n1 A");
    assert.equal(r.goals, 1);
    assert.equal(r.assists, 1);
});

test("(sub) sets sub and keeps an unknown team as a guest label (non-blocking)", () => {
    const r = parse("Real Sosobad (sub) - NYC Soccer", "W 3-2\n1 G");
    assert.equal(r.sub, true);
    assert.equal(r.teamId, undefined);
    assert.equal(r.guest?.team, "Real Sosobad");
    assert.equal(r.league, "NYC Soccer");
    assert.equal(r.blocking, false);
});

test("unknown team + recognized league on a NON-sub match is a non-blocking guest", () => {
    const r = parse("Some Random FC - NYC Footy", "W 2-0");
    assert.equal(r.blocking, false);
    assert.equal(r.teamId, undefined);
    assert.equal(r.guest?.team, "Some Random FC");
    assert.equal(r.league, "NYC Footy");
    assert.ok(r.flags.some((f) => /guest/i.test(f)));
});

test("league-first order still yields a clean guest label", () => {
    const r = parse("NYC Footy - FA Orange Julius", "L 4-6");
    assert.equal(r.guest?.team, "FA Orange Julius");
    assert.equal(r.league, "NYC Footy");
    assert.equal(r.blocking, false);
});

test("team-last order yields a clean guest label", () => {
    const r = parse("ABCDE FC - NYC Footy", "W 3-0");
    assert.equal(r.guest?.team, "ABCDE FC");
    assert.equal(r.league, "NYC Footy");
    assert.equal(r.blocking, false);
});

test("unknown league is blocking and never auto-accepted", () => {
    const r = parse("Charlie Cheers FC - Beer League", "W 2-0");
    assert.equal(r.blocking, true);
    assert.ok(r.flags.some((f) => /league/i.test(f)));
});

test("unknown team AND unknown league on a NON-sub match is still blocking", () => {
    const r = parse("Total Randoms - Beer League", "W 2-0");
    assert.equal(r.blocking, true);
    assert.ok(r.flags.some((f) => /league/i.test(f)));
});

test("omitted team on a sub match → guest with no label", () => {
    const r = parse("(sub) - NYC Soccer", "W 1-0");
    assert.equal(r.sub, true);
    assert.equal(r.guest?.team, undefined);
    assert.equal(r.blocking, false);
});

test("an obvious format token is captured for guests", () => {
    const r = parse("Real Sosobad (sub) - NYC Soccer 7v7", "W 3-2");
    assert.equal(r.guest?.format, "7v7");
    assert.equal(r.guest?.team, "Real Sosobad");
});

test("a guest label containing the league name as a substring is not corrupted", () => {
    const r = parse("Volo Rebels - Volo", "W 2-1");
    assert.equal(r.guest?.team, "Volo Rebels");
    assert.equal(r.league, "Volo");
    assert.equal(r.blocking, false);
    assert.equal(r.teamId, undefined);
});

test('an opponent after "vs" makes no league claim and isn\'t blocking', () => {
    const r = parse("Charlie Cheers FC vs Riverside Rovers", "W 3-2\n1 G");
    assert.equal(r.isMatch, true);
    assert.equal(r.teamId, "charlie-cheers");
    assert.equal(r.league, "NYC Footy");
    assert.equal(r.blocking, false);
});

test("a parenthetical tag makes no league claim and isn't blocking", () => {
    const r = parse("Charlie Cheers FC (Home)", "W 2-0");
    assert.equal(r.teamId, "charlie-cheers");
    assert.equal(r.blocking, false);
});

test("separator-based extraction yields a clean guest label, not a corrupted one", () => {
    const r = parse("NYC Rebels (sub) - NYC Soccer", "W 1-0");
    assert.equal(r.sub, true);
    assert.equal(r.guest?.team, "NYC Rebels");
    assert.equal(r.league, "NYC Soccer");
    assert.equal(r.blocking, false);
});

test("no score at all is blocking regardless of league/team resolution", () => {
    const r = parse("Charlie Cheers FC", "W");
    assert.equal(r.isMatch, true);
    assert.equal(r.blocking, true);
    assert.ok(r.flags.some((f) => /score/i.test(f)));
});
