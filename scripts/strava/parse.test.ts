import { test } from "node:test";
import assert from "node:assert/strict";
import { parseActivity, normalize } from "./parse.ts";

const SEASON = "summer-2026";
const TEAMS = [
    {
        id: "charlie-cheers",
        name: "Charlie Cheers FC",
        league: "NYC Footy",
        seasonId: SEASON,
        start: "2026-06-17",
        end: "2026-08-31",
    },
    {
        id: "fa-blast",
        name: "FA Blast from the Past",
        league: "NYC Footy",
        seasonId: SEASON,
        start: "2026-06-17",
        end: "2026-08-31",
    },
    {
        id: "salmon-roe",
        name: "Salmon Roe United",
        league: "Volo",
        seasonId: SEASON,
        start: "2026-06-17",
        end: "2026-08-31",
    },
];
const LEAGUES = ["NYC Footy", "Volo", "NYC Soccer"];
const parse = (title: string, description: string) =>
    parseActivity({
        title,
        description,
        teams: TEAMS,
        leagues: LEAGUES,
        date: "2026-07-01",
    });

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
    assert.equal(r.seasonId, undefined); // import.ts keys its date fallback off this
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

test("a one-typo rostered team name folds to the rostered team (auto-matched, non-blocking)", () => {
    const r = parse("Charlie Cheer FC - Volo", "W 5-4");
    assert.equal(r.teamId, "charlie-cheers");
    assert.equal(r.blocking, false);
    assert.ok(r.flags.some((f) => /auto-matched/i.test(f)));
});

test("a clearly different guest name does not fold to a rostered team", () => {
    const r = parse("FA Goalmates - NYC Footy", "W 2-0");
    assert.equal(r.teamId, undefined);
    assert.equal(r.guest?.team, "FA Goalmates");
    assert.ok(!r.flags.some((f) => /auto-matched/i.test(f)));
});

test("a short/ambiguous label does not fold (length guard)", () => {
    const r = parse("FC - NYC Footy", "W 1-0");
    assert.equal(r.teamId, undefined);
});

test("a drop-in title is skipped, no flags", () => {
    const r = parse("NYC Soccer - Drop-In", "W 5-3");
    assert.equal(r.isMatch, false);
    assert.equal(r.flags.length, 0);
});

test("a scrimmage title is skipped", () => {
    assert.equal(parse("NYC Footy Scrimmage", "W 2-0").isMatch, false);
});

test("a night football title is skipped", () => {
    assert.equal(parse("Night Football (Soccer)", "L 1-2").isMatch, false);
});

test("a pickup title (no separator) is skipped", () => {
    assert.equal(parse("Sunday Pickup Game", "W 3-1").isMatch, false);
});

test("a normal match is unaffected by the ignore list", () => {
    const r = parse("FA Blast From the Past - NYC Footy", "W 4-1\n\n1 G");
    assert.equal(r.isMatch, true);
});

test("ignore matching only applies to the title, not the description", () => {
    const r = parse(
        "FA Blast From the Past - NYC Footy",
        "W 4-1\n\nGreat pickup game energy today, 1 G"
    );
    assert.equal(r.isMatch, true);
    assert.equal(r.teamId, "fa-blast");
});

test("a title matching multiple same-named team entries is not guessed; recorded as an ambiguous guest", () => {
    const teams = [
        {
            id: "cc-a",
            name: "Charlie Cheers FC",
            league: "NYC Footy",
            seasonId: SEASON,
            start: "2026-06-17",
            end: "2026-08-31",
        },
        {
            id: "cc-b",
            name: "Charlie Cheers FC",
            league: "NYC Footy",
            seasonId: SEASON,
            start: "2026-06-17",
            end: "2026-08-31",
        },
    ];
    const r = parseActivity({
        title: "Charlie Cheers FC - Volo",
        description: "W 2-0",
        teams,
        leagues: LEAGUES,
        date: "2026-07-01",
    });
    assert.equal(r.teamId, undefined);
    assert.equal(r.guest?.team, "Charlie Cheers FC");
    assert.equal(r.blocking, false);
    assert.ok(r.flags.some((f) => /multiple team entries/i.test(f)));
});

test("a single-name team among an otherwise-multi-team roster still resolves normally", () => {
    const r = parse("FA Blast From the Past - NYC Footy", "W 4-1\n\n1 G");
    assert.equal(r.teamId, "fa-blast");
    assert.ok(!r.flags.some((f) => /multiple team entries/i.test(f)));
});

// --- date-scoped team resolution -----------------------------------------
// Each team-season is its own TEAMS entry with its own run, so "Charlie
// Cheers FC" is three entries. The match date is what tells them apart.
const CHARLIES = [
    {
        id: "charlie-cheers-winter-2025-26",
        name: "Charlie Cheers FC",
        league: "Volo",
        seasonId: "winter-2025-26",
        start: "2026-01-14",
        end: "2026-02-25",
    },
    {
        id: "charlie-cheers-spring-2026",
        name: "Charlie Cheers FC",
        league: "Volo",
        seasonId: "spring-2026",
        start: "2026-04-07",
        end: "2026-05-26",
    },
    {
        id: "charlie-cheers-summer-2026",
        name: "Charlie Cheers FC",
        league: "NYC Footy",
        seasonId: "summer-2026",
        start: "2026-06-17",
        end: "2026-08-19",
    },
];

test("same-named entries across runs resolve to the one covering the date", () => {
    const r = parseActivity({
        title: "Charlie Cheers FC - NYC Footy",
        description: "W 2-0\n1 G",
        teams: CHARLIES,
        leagues: LEAGUES,
        date: "2026-07-01",
    });
    assert.equal(r.teamId, "charlie-cheers-summer-2026");
    assert.equal(r.seasonId, "summer-2026");
    assert.equal(r.league, "NYC Footy");
    assert.equal(r.blocking, false);
    assert.deepEqual(r.flags, []);
});

test("the same title on another date resolves to that run's entry", () => {
    const r = parseActivity({
        title: "Charlie Cheers FC - Volo",
        description: "L 1-2",
        teams: CHARLIES,
        leagues: LEAGUES,
        date: "2026-05-05",
    });
    assert.equal(r.teamId, "charlie-cheers-spring-2026");
    assert.equal(r.seasonId, "spring-2026");
    assert.deepEqual(r.flags, []);
});

test("covers() normalizes a full datetime the same as its date-only form, even on a run's exact last day", () => {
    const dateOnly = parseActivity({
        title: "Charlie Cheers FC - NYC Footy",
        description: "W 2-0\n1 G",
        teams: CHARLIES,
        leagues: LEAGUES,
        date: "2026-08-19", // the summer-2026 entry's exact `end`
    });
    const withTime = parseActivity({
        title: "Charlie Cheers FC - NYC Footy",
        description: "W 2-0\n1 G",
        teams: CHARLIES,
        leagues: LEAGUES,
        date: "2026-08-19T23:30:00Z",
    });
    assert.equal(dateOnly.teamId, "charlie-cheers-summer-2026");
    assert.equal(withTime.teamId, dateOnly.teamId);
    assert.equal(withTime.seasonId, dateOnly.seasonId);
    assert.equal(withTime.blocking, false);
    assert.deepEqual(withTime.flags, dateOnly.flags);
});

test("a typo folds to the rostered entry covering the match date", () => {
    const r = parseActivity({
        title: "Charlie Cheer FC - Volo",
        description: "W 5-4",
        teams: CHARLIES,
        leagues: LEAGUES,
        date: "2026-02-01",
    });
    assert.equal(r.teamId, "charlie-cheers-winter-2025-26");
    assert.ok(r.flags.some((f) => /auto-matched/i.test(f)));
});

// The guardrail. A rostered name outside every recorded run means a new
// team-season started — never absorb it into the old entry, never file it
// as a phantom guest.
test("a rostered name outside every run blocks and names the gap", () => {
    const r = parseActivity({
        title: "Charlie Cheers FC - NYC Footy",
        description: "W 2-0",
        teams: CHARLIES,
        leagues: LEAGUES,
        date: "2026-09-01",
    });
    assert.equal(r.teamId, undefined);
    assert.equal(r.blocking, true);
    assert.ok(
        r.flags.some((f) => /rostered in summer-2026/.test(f)),
        `expected a gap flag, got ${JSON.stringify(r.flags)}`
    );
    // A blocked result must not also claim the match was recorded as a
    // guest — the two lines would contradict each other in the PR.
    assert.ok(
        !r.flags.some((f) => /recorded .* as a guest team/i.test(f)),
        `blocking result should not carry the guest breadcrumb, got ${JSON.stringify(r.flags)}`
    );
});

test("an explicit (sub) outside every run is a guest, not a block", () => {
    const r = parseActivity({
        title: "Charlie Cheers FC (sub) - NYC Footy",
        description: "W 2-0",
        teams: CHARLIES,
        leagues: LEAGUES,
        date: "2026-09-01",
    });
    assert.equal(r.teamId, undefined);
    assert.equal(r.sub, true);
    assert.equal(r.blocking, false);
});

// The near-miss fold (an in-range typo) outranks the out-of-range block: the
// exact-name entry sitting in another run is what the typo is NOT about.
test("an in-range near-miss beats an out-of-range exact name", () => {
    const teams = [
        {
            id: "cc-winter",
            name: "Charlie Cheers FC",
            league: "Volo",
            seasonId: "winter-2025-26",
            start: "2026-01-14",
            end: "2026-02-25",
        },
        {
            id: "cc-summer",
            name: "Charlie Cheer FC",
            league: "Volo",
            seasonId: "summer-2026",
            start: "2026-06-17",
            end: "2026-08-31",
        },
    ];
    const r = parseActivity({
        title: "Charlie Cheers FC - Volo",
        description: "W 2-0",
        teams,
        leagues: LEAGUES,
        date: "2026-07-01",
    });
    assert.equal(r.teamId, "cc-summer");
    assert.equal(r.seasonId, "summer-2026");
    assert.equal(r.blocking, false);
    assert.ok(r.flags.some((f) => /auto-matched/i.test(f)));
    assert.ok(!r.flags.some((f) => /rostered in/.test(f)));
});

test("two entries whose runs both cover the date are tie-broken by league", () => {
    const teams = [
        {
            id: "cc-volo",
            name: "Charlie Cheers FC",
            league: "Volo",
            seasonId: "summer-2026",
            start: "2026-06-17",
            end: "2026-08-31",
        },
        {
            id: "cc-footy",
            name: "Charlie Cheers FC",
            league: "NYC Footy",
            seasonId: "summer-2026",
            start: "2026-06-17",
            end: "2026-08-31",
        },
    ];
    const r = parseActivity({
        title: "Charlie Cheers FC - Volo",
        description: "W 2-0",
        teams,
        leagues: LEAGUES,
        date: "2026-07-01",
    });
    assert.equal(r.teamId, "cc-volo");
    assert.ok(!r.flags.some((f) => /multiple team entries/i.test(f)));
});

test("without a date all entries stay in scope", () => {
    const r = parseActivity({
        title: "Charlie Cheers FC - Volo",
        description: "W 2-0",
        teams: CHARLIES,
        leagues: LEAGUES,
    });
    assert.equal(r.teamId, undefined);
    assert.ok(r.flags.some((f) => /multiple team entries/i.test(f)));
});
