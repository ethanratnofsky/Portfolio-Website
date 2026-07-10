import { test } from "node:test";
import assert from "node:assert/strict";
import { matchDate, seasonForDate } from "./dates.ts";
import type { Season } from "../../src/data/soccer.ts";

// Local fixture, independent of src/data/soccer.ts — real SEASONS boundaries
// change every import, so pinning these tests to it would make them as
// fragile as the data. A sealed season (start+end) followed by an in-play
// season (no end) exercises every branch of seasonForDate.
const FIXTURE_SEASONS: Season[] = [
    {
        id: "fall-2025",
        label: "Fall 2025",
        months: "SEP — NOV",
        status: "sealed",
        start: "2025-09-01",
        end: "2025-11-15",
        teamIds: [],
    },
    {
        id: "winter-2025-26",
        label: "Winter 2025 – 26",
        months: "DEC — MAR",
        status: "in-play",
        start: "2025-12-01",
        teamIds: [],
    },
];

test("matchDate uses the local calendar date, not UTC", () => {
    // Paired UTC start_date would be "2025-11-11T01:00:00Z" (rolls to the next
    // day) — pass only start_date_local to prove we never touch start_date.
    assert.equal(
        matchDate({ start_date_local: "2025-11-10T20:00:00Z" }),
        "2025-11-10"
    );
});

test("seasonForDate: a date on a sealed season's start resolves to that season", () => {
    assert.equal(seasonForDate("2025-09-01", FIXTURE_SEASONS), "fall-2025");
});

test("seasonForDate: a date on a sealed season's end resolves to that season", () => {
    assert.equal(seasonForDate("2025-11-15", FIXTURE_SEASONS), "fall-2025");
});

test("seasonForDate: an in-play season (no end) matches any date >= start", () => {
    assert.equal(
        seasonForDate("2025-12-01", FIXTURE_SEASONS),
        "winter-2025-26"
    );
    assert.equal(
        seasonForDate("2099-01-01", FIXTURE_SEASONS),
        "winter-2025-26"
    );
});

test("seasonForDate: a date before all seasons or in a gap returns null", () => {
    assert.equal(seasonForDate("2025-08-31", FIXTURE_SEASONS), null); // before all seasons
    assert.equal(seasonForDate("2025-11-16", FIXTURE_SEASONS), null); // gap between seasons
});
