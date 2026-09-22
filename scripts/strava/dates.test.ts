import { test } from "node:test";
import assert from "node:assert/strict";
import { matchDate, seasonsForDate } from "./dates.ts";

test("matchDate uses the local calendar date, not UTC", () => {
    // Paired UTC start_date would be "2025-11-11T01:00:00Z" (rolls to the next
    // day) — pass only start_date_local to prove we never touch start_date.
    assert.equal(
        matchDate({ start_date_local: "2025-11-10T20:00:00Z" }),
        "2025-11-10"
    );
});

const RANGES = [
    { id: "spring-2026", start: "2026-04-05", end: "2026-06-21" },
    { id: "summer-2026", start: "2026-06-17", end: "2026-08-31" },
    { id: "fall-2026", start: "2026-09-01", end: "2026-11-30" },
];

test("seasonsForDate returns the one season covering a date", () => {
    assert.deepEqual(seasonsForDate("2026-06-14", RANGES), ["spring-2026"]);
    assert.deepEqual(seasonsForDate("2026-09-14", RANGES), ["fall-2026"]);
});

test("seasonsForDate returns every season covering an overlapped date", () => {
    // Spring's last week and summer's first overlap — genuinely ambiguous.
    assert.deepEqual(seasonsForDate("2026-06-18", RANGES), [
        "spring-2026",
        "summer-2026",
    ]);
});

test("seasonsForDate returns nothing for a date in a gap", () => {
    assert.deepEqual(seasonsForDate("2026-03-01", RANGES), []);
});

test("seasonsForDate includes a date exactly on a range's start or end", () => {
    assert.deepEqual(seasonsForDate("2026-04-05", RANGES), ["spring-2026"]);
    assert.deepEqual(seasonsForDate("2026-11-30", RANGES), ["fall-2026"]);
});

test("seasonsForDate excludes a date one day outside a range's start or end", () => {
    assert.deepEqual(seasonsForDate("2026-04-04", RANGES), []);
    assert.deepEqual(seasonsForDate("2026-12-01", RANGES), []);
});

test("seasonsForDate treats a missing end as still running", () => {
    const open = [{ id: "fall-2026", start: "2026-09-01" }];
    assert.deepEqual(seasonsForDate("2027-01-01", open), ["fall-2026"]);
});
