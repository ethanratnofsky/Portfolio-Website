export interface SnapEntry { score: [number, number]; goals: number; assists: number; goalsIsMinimum: boolean; }
export interface Snapshot { [stravaId: string]: SnapEntry; }
export type DraftMatch = Record<string, any> & { stravaId?: number; score: [number, number]; goals: number; assists: number; goalsIsMinimum?: boolean; };
export interface MergeResult {
    matches: DraftMatch[]; snapshot: Snapshot;
    added: string[]; updated: string[]; conflicts: string[]; skipped: string[];
}

const snapOf = (m: DraftMatch): SnapEntry => ({
    score: m.score, goals: m.goals, assists: m.assists, goalsIsMinimum: Boolean(m.goalsIsMinimum),
});
const sameSnap = (a: SnapEntry, b: SnapEntry) =>
    a.score[0] === b.score[0] && a.score[1] === b.score[1] &&
    a.goals === b.goals && a.assists === b.assists && a.goalsIsMinimum === b.goalsIsMinimum;
const label = (m: DraftMatch) => `${m.date} ${m.teamId ?? m.guest?.team ?? "[Unknown team]"}`;

export function mergeImports(existing: DraftMatch[], snapshot: Snapshot, drafts: DraftMatch[]): MergeResult {
    const byId = new Map<number, number>(); // stravaId → index in matches
    const matches = existing.map((m, i) => {
        if (typeof m.stravaId === "number") byId.set(m.stravaId, i);
        return m;
    });
    const snap: Snapshot = { ...snapshot };
    const res: MergeResult = { matches, snapshot: snap, added: [], updated: [], conflicts: [], skipped: [] };

    for (const d of drafts) {
        const id = d.stravaId!;
        const key = String(id);
        if (!byId.has(id)) {
            matches.push(d);
            snap[key] = snapOf(d);
            res.added.push(`added ${label(d)} ${d.score[0]}–${d.score[1]}`);
            continue;
        }
        const idx = byId.get(id)!;
        const repo = matches[idx];
        if (!snap[key]) snap[key] = snapOf(repo); // known id lacking a baseline: adopt the repo record as baseline
        const prev = snap[key];
        const stravaNow = snapOf(d);
        const stravaChanged = !prev || !sameSnap(prev, stravaNow);
        const repoChanged = prev ? !sameSnap(prev, snapOf(repo)) : false;
        if (!stravaChanged) { res.skipped.push(`unchanged ${label(repo)}`); continue; }
        if (repoChanged) {
            res.conflicts.push(`conflict ${label(repo)}: repo ${repo.score[0]}–${repo.score[1]} vs Strava ${d.score[0]}–${d.score[1]} (kept repo)`);
            continue;
        }
        matches[idx] = { ...repo, ...d };
        snap[key] = stravaNow;
        res.updated.push(`updated ${label(d)}: ${prev.score[0]}–${prev.score[1]} → ${d.score[0]}–${d.score[1]}`);
    }
    return res;
}
