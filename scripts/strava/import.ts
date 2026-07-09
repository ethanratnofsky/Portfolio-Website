import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
    refreshAccessToken,
    listActivitiesSince,
    getActivity,
} from "./client.ts";
import { parseActivity } from "./parse.ts";
import { mergeImports, type DraftMatch, type Snapshot } from "./merge.ts";
import { TEAMS, SEASONS, LEAGUES } from "../../src/data/soccer.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const MATCHES_PATH = `${ROOT}src/data/matches.json`;
const SNAP_PATH = `${ROOT}src/data/.strava-snapshot.json`;

function seasonForDate(iso: string): string | null {
    const d = iso.slice(0, 10);
    for (const s of SEASONS) {
        if (d >= s.start && (!s.end || d <= s.end)) return s.id;
    }
    return null;
}

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

    const seasons = [...SEASONS].sort((a, b) => a.start.localeCompare(b.start));
    const inPlay = seasons.find((s) => s.status === "in-play");
    const since = all ? seasons[0].start : (inPlay?.start ?? seasons[0].start);
    const afterEpoch = Math.floor(new Date(since).getTime() / 1000);

    const token = await refreshAccessToken(creds);
    const list = await listActivitiesSince(token, afterEpoch);
    const soccer = list.filter((a) => a.sport_type === "Soccer");

    const teams = TEAMS.map((t) => ({
        id: t.id,
        name: t.name,
        league: t.league,
    }));
    const drafts: DraftMatch[] = [];
    const reports: string[] = [];

    for (const a of soccer) {
        const detail = await getActivity(token, a.id);
        const parsed = parseActivity({
            title: detail.name,
            description: detail.description ?? "",
            teams,
            leagues: LEAGUES,
        });
        if (!parsed.isMatch) continue;

        const seasonId = seasonForDate(detail.start_date);
        if (!seasonId) {
            reports.push(
                `⚠︎ ${detail.start_date.slice(0, 10)} "${detail.name}": no season covers this date — add/extend a season.`
            );
            continue;
        }
        if (parsed.blocking) {
            reports.push(
                `⚠︎ ${detail.start_date.slice(0, 10)} "${detail.name}": ${parsed.flags.join(" ")}`
            );
            continue;
        }
        const m: DraftMatch = {
            stravaId: a.id,
            date: detail.start_date.slice(0, 10),
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
