// Type-only import: erased at compile time, so this stays a pure date module
// with no runtime dependency on the data layer.
import type { SeasonRange } from "../../src/data/soccer-derive.ts";

/** Strava's `start_date_local` is an ISO string with a trailing `Z` that
 * actually encodes the athlete's local wall-clock time — so the correct
 * local calendar date is just its first 10 characters. Do not attempt any
 * timezone math or `new Date()` conversion. */
export function matchDate(detail: { start_date_local: string }): string {
    return detail.start_date_local.slice(0, 10);
}

/** Every season whose range covers this date, in the order given. Sessions
    overlap in reality, so this can legitimately return more than one — it
    reports what it found rather than picking. Zero or two-plus is the
    importer's cue to ask a human. */
export function seasonsForDate(
    iso: string,
    ranges: readonly SeasonRange[]
): string[] {
    const d = iso.slice(0, 10);
    return ranges
        .filter((r) => d >= r.start && (!r.end || d <= r.end))
        .map((r) => r.id);
}
