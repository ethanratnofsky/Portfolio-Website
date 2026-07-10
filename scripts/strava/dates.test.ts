import { test } from "node:test";
import assert from "node:assert/strict";
import { matchDate, seasonForDate } from "./dates.ts";
import { SEASONS } from "../../src/data/soccer.ts";
import type { Season } from "../../src/data/soccer.ts";

test("matchDate uses the local calendar date, not UTC", () => {
    // Paired UTC start_date would be "2025-11-11T01:00:00Z" (rolls to the next
    // day) — pass only start_date_local to prove we never touch start_date.
    assert.equal(
        matchDate({ start_date_local: "2025-11-10T20:00:00Z" }),
        "2025-11-10"
    );
});

test("seasonForDate: a date on a season's start resolves to that season", () => {
    assert.equal(seasonForDate("2025-09-01", SEASONS), "fall-2025");
});

test("seasonForDate: a date on a season's end resolves to that season", () => {
    assert.equal(seasonForDate("2025-11-15", SEASONS), "fall-2025");
});

test("seasonForDate: an in-play season (no end) matches any date >= start", () => {
    assert.equal(seasonForDate("2026-06-01", SEASONS), "summer-2026");
    assert.equal(seasonForDate("2099-01-01", SEASONS), "summer-2026");
});

test("seasonForDate: a date past the last end with no in-play season returns null", () => {
    const fixture: Season[] = [
        {
            id: "fall-2025",
            label: "Fall 2025",
            months: "SEP — NOV",
            status: "sealed",
            start: "2025-09-01",
            end: "2025-11-15",
            teamIds: [],
        },
    ];
    assert.equal(seasonForDate("2025-11-16", fixture), null);
});
