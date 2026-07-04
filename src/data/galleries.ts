/**
 * Gallery plates — SHEET 03 (Design work) and SHEET 04 (Photographs).
 *
 * ADDING AN IMAGE (2 steps):
 *   1. Drop the file into src/assets/design/ (Behance exports) or
 *      src/assets/photography/ (Flickr exports). A big original JPG/PNG is
 *      perfect — astro:assets resizes it and generates AVIF/WebP at build.
 *   2. Import it below and add one entry to the matching array. That's it:
 *      the tile, caption, lightbox, and responsive sizes all derive from the
 *      entry, and one dashed placeholder slot disappears automatically.
 *
 * NUMBERING SCHEME (the "plate" field):
 *   - Design work:  DES-0XX — zero-padded design-plate number, e.g. "DES-014".
 *     Numbers just need to be unique, not sequential on the page.
 *   - Photographs:  FR-XX — frame number, like frames on a film roll,
 *     e.g. "FR-36".
 *
 * "title" is the short uppercase caption label; "alt" describes the image
 * itself for screen readers (tile thumbnail and lightbox).
 */
import type { ImageMetadata } from "astro";

import ninjaNahteyLogo from "../assets/design/NinjaNahteyLogo2017.jpg";
import covidSznPhotography from "../assets/photography/COVIDSZNPhotography.jpg";

export interface GalleryItem {
    /** Imported image file (see the how-to above). */
    image: ImageMetadata;
    /** Plate number — "DES-0XX" for design work, "FR-XX" for photographs. */
    plate: string;
    /** Short uppercase caption label, e.g. "NINJA NAHTEY". */
    title: string;
    /** Year the piece was made, e.g. "2017". */
    year: string;
    /** Descriptive alt text for the image itself. */
    alt: string;
}

export const designWorks: GalleryItem[] = [
    {
        image: ninjaNahteyLogo,
        plate: "DES-014",
        title: "NINJA NAHTEY",
        year: "2017",
        alt: "Ninja Nahtey logo — hand-drawn ninja mark (2017)",
    },
];

export const photographs: GalleryItem[] = [
    {
        image: covidSznPhotography,
        plate: "FR-36",
        title: "COVID SZN",
        year: "2020",
        alt: "Masked photographer aiming a DSLR at the viewer on a tree-lined park promenade",
    },
];
