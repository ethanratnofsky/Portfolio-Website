import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
    refreshAccessToken,
    listActivitiesSince,
    getActivity,
} from "./client.ts";
import { parseActivity } from "./parse.ts";
import { mergeImports, type DraftMatch, type Snapshot } from "./merge.ts";
import { matchDate, seasonsForDate } from "./dates.ts";
import { TEAMS, SEASONS, LEAGUES } from "../../src/data/soccer.ts";
import { seasonRange, seasonRanges } from "../../src/data/soccer-derive.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const MATCHES_PATH = `${ROOT}src/data/matches.json`;
const SNAP_PATH = `${ROOT}src/data/.strava-snapshot.json`;

async function main() {
    const all = process.argv.includes("--all");
    const creds = {
        clientId: process.env.STRAVA_CLIENT_ID!,
        clientSecret: process.env.STRAVA_CLIENT_SECRET!,
        refreshToken: process.env.STRAVA_REFRESH_TOKEN!,
    };
    if (!creds.clientId || !creds.clientSecret || !creds.refreshToken) {
        throw new Error(
            "Missing STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET / STRAVA_REFRESH_TOKEN"
        );
    }

    const ranges = seasonRanges();
    if (!ranges.length) throw new Error("No season has any team-season runs");
    const earliest = ranges.reduce(
        (a, r) => (r.start < a ? r.start : a),
        ranges[0].start
    );
    const inPlay = SEASONS.find((s) => s.status === "in-play");
    const inPlayStart = inPlay ? seasonRange(inPlay.id)?.start : undefined;
    const since = all ? earliest : (inPlayStart ?? earliest);
    const afterEpoch = Math.floor(new Date(since).getTime() / 1000);

    const token = await refreshAccessToken(creds);
    const list = await listActivitiesSince(token, afterEpoch);
    const soccer = list.filter((a) => a.sport_type === "Soccer");

    const teams = TEAMS.map((t) => ({
        id: t.id,
        name: t.name,
        league: t.league,
        seasonId: t.seasonId,
        start: t.start,
        end: t.end,
    }));
    const drafts: DraftMatch[] = [];
    const reports: string[] = [];

    for (const a of soccer) {
        const detail = await getActivity(token, a.id);
        // Resolution runs name+date → team → season: a display name is
        // ambiguous across a club's team-seasons but unique within the run
        // that covers the date. Deriving the season first (as this used to)
        // is what let an open-ended in-play season swallow Fall 2026.
        const date = matchDate(detail);
        const parsed = parseActivity({
            title: detail.name,
            description: detail.description ?? "",
            teams,
            leagues: LEAGUES,
            date,
        });
        if (!parsed.isMatch) continue;

        if (parsed.blocking) {
            reports.push(
                `⚠︎ ${date} "${detail.name}": ${parsed.flags.join(" ")}`
            );
            continue;
        }

        // A rostered team carries its own season. A guest doesn't, so fall
        // back to the date — and refuse to guess when that's ambiguous.
        let seasonId = parsed.seasonId;
        if (!seasonId) {
            const covering = seasonsForDate(date, ranges);
            if (covering.length !== 1) {
                reports.push(
                    covering.length === 0
                        ? `⚠︎ ${date} "${detail.name}": no season covers this date — add or extend a team-season run in TEAMS.`
                        : `⚠︎ ${date} "${detail.name}": ${covering.length} seasons cover this date (${covering.join(", ")}) — assign the season by hand.`
                );
                continue;
            }
            seasonId = covering[0];
        }
        const m: DraftMatch = {
            stravaId: a.id,
            date,
            seasonId,
            result: parsed.result!,
            score: parsed.score!,
            goals: parsed.goals,
            assists: parsed.assists,
        };
        if (parsed.goalsIsMinimum) m.goalsIsMinimum = true;
        if (parsed.sub) m.sub = true;
        if (parsed.teamId) m.teamId = parsed.teamId;
        else m.guest = { ...parsed.guest, league: parsed.league };
        if (parsed.flags.length)
            reports.push(
                `ℹ ${m.date} "${detail.name}": ${parsed.flags.join(" ")}`
            );
        drafts.push(m);
    }

    const existing = JSON.parse(
        readFileSync(MATCHES_PATH, "utf8")
    ) as DraftMatch[];
    const snapshot = JSON.parse(readFileSync(SNAP_PATH, "utf8")) as Snapshot;
    const merged = mergeImports(existing, snapshot, drafts);

    merged.matches.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    writeFileSync(MATCHES_PATH, JSON.stringify(merged.matches, null, 4) + "\n");
    writeFileSync(SNAP_PATH, JSON.stringify(merged.snapshot, null, 4) + "\n");

    const summary = [
        `## Strava import`,
        ``,
        `- Added: ${merged.added.length}`,
        `- Updated: ${merged.updated.length}`,
        `- Conflicts: ${merged.conflicts.length}`,
        `- Skipped (unchanged): ${merged.skipped.length}`,
        ...(merged.added.length
            ? [``, `### Added`, ...merged.added.map((s) => `- ${s}`)]
            : []),
        ...(merged.updated.length
            ? [``, `### Updated`, ...merged.updated.map((s) => `- ${s}`)]
            : []),
        ...(merged.conflicts.length
            ? [
                  ``,
                  `### Conflicts (resolve by hand)`,
                  ...merged.conflicts.map((s) => `- ${s}`),
              ]
            : []),
        ...(reports.length
            ? [``, `### Needs attention`, ...reports.map((s) => `- ${s}`)]
            : []),
        ``,
        `_Change count: ${merged.added.length + merged.updated.length}_`,
    ].join("\n");
    writeFileSync(`${ROOT}import-summary.md`, summary + "\n");
    console.log(summary);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
