import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeImports } from "./merge.ts";

const draft = (over = {}) => ({
    stravaId: 1,
    date: "2026-07-06",
    seasonId: "summer-2026",
    teamId: "charlie-cheers",
    result: "W",
    score: [4, 2],
    goals: 1,
    goalsIsMinimum: false,
    assists: 1,
    ...over,
});
const snap = (over = {}) => ({
    "1": {
        score: [4, 2],
        goals: 1,
        assists: 1,
        goalsIsMinimum: false,
        ...over,
    },
});

test("new activity is added", () => {
    const r = mergeImports([], {}, [draft()]);
    assert.equal(r.matches.length, 1);
    assert.equal(r.added.length, 1);
    assert.equal(r.snapshot["1"].goals, 1);
});

test("known + unchanged on Strava is skipped", () => {
    const r = mergeImports([draft()], snap(), [draft()]);
    assert.equal(r.updated.length, 0);
    assert.equal(r.skipped.length, 1);
});

test("Strava correction with an unedited repo updates and diffs", () => {
    const r = mergeImports([draft()], snap(), [
        draft({ score: [3, 2], result: "W" }),
    ]);
    assert.equal(r.updated.length, 1);
    assert.match(r.updated[0], /4–2.*3–2|score/);
    assert.deepEqual(r.matches[0].score, [3, 2]);
    assert.deepEqual(r.snapshot["1"].score, [3, 2]);
});

test("repo hand-edit is respected when Strava is unchanged", () => {
    const edited = draft({ note: "great game" });
    const r = mergeImports([edited], snap(), [draft()]);
    assert.equal(r.matches[0].note, "great game");
    assert.equal(r.updated.length, 0);
});

test("Strava changed AND repo changed the same field → conflict, repo kept", () => {
    const repoEdited = draft({ score: [5, 2] });
    const stravaChanged = draft({ score: [3, 2] });
    const r = mergeImports([repoEdited], snap(), [stravaChanged]);
    assert.equal(r.conflicts.length, 1);
    assert.deepEqual(r.matches[0].score, [5, 2]); // repo wins; human resolves
});

test("known id with missing snapshot baseline and a differing draft does not throw, updates from repo baseline", () => {
    const r = mergeImports([draft()], {}, [draft({ score: [3, 2] })]);
    assert.equal(r.updated.length, 1);
    assert.deepEqual(r.matches[0].score, [3, 2]);
    assert.deepEqual(r.snapshot["1"].score, [3, 2]);
});

test("known id with missing snapshot baseline and an identical draft does not throw, seeds snapshot and skips", () => {
    const r = mergeImports([draft()], {}, [draft()]);
    assert.equal(r.updated.length, 0);
    assert.equal(r.skipped.length, 1);
    assert.ok(r.snapshot["1"]);
    assert.deepEqual(r.snapshot["1"].score, [4, 2]);
});

test("update preserves curated teamId/seasonId even when the re-derived draft has a different identity", () => {
    const repo = draft({
        teamId: "charlie-cheers-summer",
        seasonId: "summer-2026",
    });
    const restrava: any = draft({
        score: [3, 2],
        goals: 2,
        assists: 0,
    });
    // Simulate the importer re-deriving a *different* identity for the same
    // stravaId (e.g. an ambiguous team name folded to a guest instead).
    delete restrava.teamId;
    delete restrava.seasonId;
    restrava.guest = { team: "Some Guest FC", league: "Volo" };

    const r = mergeImports([repo], snap(), [restrava]);
    assert.equal(r.updated.length, 1);
    assert.equal(r.matches[0].teamId, "charlie-cheers-summer");
    assert.equal(r.matches[0].seasonId, "summer-2026");
    assert.equal(r.matches[0].guest, undefined);
    assert.deepEqual(r.matches[0].score, [3, 2]);
    assert.equal(r.matches[0].goals, 2);
    assert.equal(r.matches[0].assists, 0);
});

test("update preserves repo's guest and sub when the draft carries a (different) resolved teamId", () => {
    const repo = draft({ guest: { team: "Some Guest FC", league: "Volo" } });
    delete (repo as any).teamId;
    (repo as any).sub = true;
    const restrava: any = draft({ score: [3, 2] });
    // Draft re-resolved a rostered team where the repo had recorded a guest.
    restrava.teamId = "charlie-cheers-fall";

    const r = mergeImports([repo], snap(), [restrava]);
    assert.equal(r.updated.length, 1);
    assert.equal(r.matches[0].teamId, undefined);
    assert.deepEqual(r.matches[0].guest, {
        team: "Some Guest FC",
        league: "Volo",
    });
    assert.equal(r.matches[0].sub, true);
    assert.deepEqual(r.matches[0].score, [3, 2]);
});

test("goalsIsMinimum does not linger true when the new draft omits it", () => {
    const repo = draft({ goalsIsMinimum: true });
    const baseline = snap({ goalsIsMinimum: true });
    const restrava: any = draft({ score: [5, 2] });
    delete restrava.goalsIsMinimum;

    const r = mergeImports([repo], baseline, [restrava]);
    assert.equal(r.updated.length, 1);
    assert.equal(r.matches[0].goalsIsMinimum, undefined);
    assert.deepEqual(r.matches[0].score, [5, 2]);
});
