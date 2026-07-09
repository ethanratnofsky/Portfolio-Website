import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeImports } from "./merge.ts";

const draft = (over = {}) => ({
    stravaId: 1, date: "2026-07-06", seasonId: "summer-2026", teamId: "charlie-cheers",
    result: "W", score: [4, 2], goals: 1, goalsIsMinimum: false, assists: 1, ...over,
});
const snap = (over = {}) => ({ "1": { score: [4, 2], goals: 1, assists: 1, goalsIsMinimum: false, ...over } });

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
    const r = mergeImports([draft()], snap(), [draft({ score: [3, 2], result: "W" })]);
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
