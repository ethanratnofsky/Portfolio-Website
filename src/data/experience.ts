/* EXPERIENCE — SPECIFICATION panel data (About sheet).
   Rows and date labels come verbatim from the design handoff. */

export interface ExperienceRow {
    org: string;
    role: string;
    dates: string;
    current?: boolean;
}

export const EXPERIENCE: ExperienceRow[] = [
    { org: "Kinetik", role: "SOFTWARE ENGINEER", dates: "2023 — NOW", current: true },
    { org: "Kinetik", role: "SWE INTERN", dates: "2022" },
    { org: "Change++", role: "ENGINEERING MANAGER", dates: "2022 — 23" },
    { org: "Change++", role: "SOFTWARE ENGINEER", dates: "2021 — 22" },
    { org: "AbbVie", role: "SWE INTERN", dates: "2020 — 21" },
    { org: "Vanderbilt", role: "B.S. COMPUTER SCIENCE", dates: "2019 — 23" },
];

/* About-sheet skill chips. FIGMA stays per Ethan (2026-07-04), overriding the
   handoff README's earlier instruction to drop it. */
export const SKILL_CHIPS = ["REACT", "TYPESCRIPT", "NODE", "MONGODB", "PYTHON", "FIGMA"];
