/* IN THEIR WORDS — testimonial register data (ON RECORD sheet).

   Append-only: new entries go at the END. The register number (NO. 0NN) is
   the array index + 1, so the oldest entry is NO. 001 and reordering or
   deleting entries would renumber the whole file — don't. Display order is
   newest first; the component reverses this array.

   Stamps are set per entry, not automatic — roughly half the register
   carries one. Stamp rotation is derived from the entry number in the
   component (nothing to store here). */

// TODO(ethan): every entry below is a PLACEHOLDER from the design handoff
// (quotes, names, roles, dates, stamps — structure real, people invented).
// Swap in real quotes as you collect them, oldest first, then keep appending.

export interface Testimonial {
    /** The quote, without surrounding quotation marks (the card adds them). */
    quote: string;
    /** First initial + last name, e.g. "S. Patel". */
    name: string;
    /** Rendered uppercase, e.g. "SENIOR ENGINEER — TEAMMATE". */
    role: string;
    /** Month received, "YYYY-MM". Renders as "MM / YYYY". */
    date: string;
    /** Optional stamp: "ON RECORD" | "WOULD SHIP AGAIN" | "NO OBJECTIONS" | custom. */
    stamp?: string;
}

export const TESTIMONIALS: Testimonial[] = [
    // NO. 001
    {
        quote: "Took the messiest ticket in the backlog and came back with a diagram, three questions, and a fix. First-year students don't usually do that.",
        name: "M. Osei",
        role: "TA — INTRO TO SOFTWARE ENGINEERING",
        date: "2023-10",
    },
    // NO. 002
    {
        quote: "Our club site went from a shared doc of broken links to something we still brag about at the involvement fair.",
        name: "L. Nguyen",
        role: "CLUB PRESIDENT — VANDERBILT",
        date: "2024-02",
        stamp: "ON RECORD",
    },
    // NO. 003
    {
        quote: "He asked for the gnarliest data cleanup we had, then automated himself out of the assignment by July.",
        name: "D. Kaplan",
        role: "INTERN MANAGER — ABBVIE",
        date: "2024-07",
    },
    // NO. 004
    {
        quote: "Every review he left made the codebase a little easier to walk into. That's rarer than shipping fast.",
        name: "P. Mehta",
        role: "SENIOR ENGINEER — INTERNSHIP MENTOR",
        date: "2024-08",
        stamp: "WOULD SHIP AGAIN",
    },
    // NO. 005
    {
        quote: "Gave him the vaguest brief of my career — 'make it feel less like a spreadsheet' — and he came back with exactly that.",
        name: "C. Alvarez",
        role: "PROJECT LEAD — CHANGE++",
        date: "2025-01",
    },
    // NO. 006
    {
        quote: "The demo crashed four minutes before judging. He fixed it in three and still narrated the slides like nothing happened.",
        name: "N. Brooks",
        role: "HACKATHON TEAMMATE",
        date: "2025-02",
        stamp: "NO OBJECTIONS",
    },
    // NO. 007
    {
        quote: "I've taught a lot of capstones. Very few students leave the client planning around their availability after graduation.",
        name: "R. Whitfield",
        role: "FACULTY ADVISOR — VANDERBILT",
        date: "2025-04",
    },
    // NO. 008
    {
        quote: "Asked him to 'just tweak the logo.' Received a full identity system with usage notes. Kept all of it.",
        name: "E. Fontaine",
        role: "NONPROFIT DIRECTOR — CLIENT",
        date: "2025-05",
        stamp: "ON RECORD",
    },
    // NO. 009
    {
        quote: "The scraper broke every August. Ethan's rewrite hasn't — ask how many leases it found us.",
        name: "T. Walsh",
        role: "ROOMMATE & FIRST USER",
        date: "2025-08",
    },
    // NO. 010
    {
        quote: "Five engineers, one semester, zero drama. He ran it like he'd shipped for years.",
        name: "K. Deng",
        role: "CHANGE++ ENGINEER",
        date: "2025-11",
        stamp: "NO OBJECTIONS",
    },
    // NO. 011
    {
        quote: "Led five of us through a real production launch while still a student. The nonprofit still shows it off.",
        name: "J. Rivera",
        role: "CHANGE++ TEAMMATE",
        date: "2026-01",
    },
    // NO. 012
    {
        quote: "Half engineer, half art director — he'll argue kerning and query plans in the same standup.",
        name: "A. Chen",
        role: "PRODUCT DESIGNER — COLLEAGUE",
        date: "2026-03",
        stamp: "WOULD SHIP AGAIN",
    },
    // NO. 013
    {
        quote: "Pull requests that read like documentation — screenshots, edge cases, the why. Reviewing them was the easy part.",
        name: "R. Okafor",
        role: "SENIOR ENGINEER — TEAMMATE",
        date: "2026-05",
    },
    // NO. 014
    {
        quote: "Ships like an engineer; sweats pixels like a designer. The bar for 'done' moved when he joined.",
        name: "S. Patel",
        role: "ENGINEERING MANAGER",
        date: "2026-06",
        stamp: "ON RECORD",
    },
];
