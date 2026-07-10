import type { Season } from "../../src/data/soccer.ts";

/** Strava's `start_date_local` is an ISO string with a trailing `Z` that
 * actually encodes the athlete's local wall-clock time — so the correct
 * local calendar date is just its first 10 characters. Do not attempt any
 * timezone math or `new Date()` conversion. */
export function matchDate(detail: { start_date_local: string }): string {
    return detail.start_date_local.slice(0, 10);
}

export function seasonForDate(
    iso: string,
    seasons: readonly Season[]
): string | null {
    const d = iso.slice(0, 10);
    for (const s of seasons) {
        if (d >= s.start && (!s.end || d <= s.end)) return s.id;
    }
    return null;
}
