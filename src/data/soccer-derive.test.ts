import { test } from "node:test";
import assert from "node:assert/strict";
import { allTime, record } from "./soccer-derive.ts";

test("all-time aggregates match the shipped register", () => {
    const at = allTime();
    assert.equal(at.played, 24);
    assert.equal(record(at), "14–3–7");
    assert.equal(at.goals, 25);
    assert.equal(at.assists, 7);
    assert.equal(at.seasons, 4);
});
