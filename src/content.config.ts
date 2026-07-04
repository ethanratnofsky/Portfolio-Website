import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/* One markdown file per project. Every field beyond title/year/order is optional —
   card layouts degrade gracefully (image card → text sheet → flat-file row). */
const projects = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            /** Display year exactly as the design labels it (e.g. "2022"). */
            year: z.string(),
            /** Sort order within its group (featured grid / flat file). */
            order: z.number(),
            featured: z.boolean().default(false),
            /** "This website" rev strip — rendered as its own full-width row. */
            revStrip: z.boolean().default(false),
            /** Flat-file archive row number, e.g. "006". */
            flatFileNo: z.string().optional(),
            /** Compact mono stack label for cards/rows, e.g. "REACT · NODE · DOCKER". */
            stackLabel: z.string(),
            /** Full skill list (kept for data completeness / future use). */
            skills: z.array(z.string()).default([]),
            links: z
                .object({
                    live: z.string().url().optional(),
                    app: z.string().url().optional(),
                    github: z.string().url().optional(),
                })
                .default({}),
            /** Which link gets the accent treatment on cards. */
            primaryLink: z.enum(["live", "app", "github", "study"]).optional(),
            /** Replaces links for unpublishable work, e.g. "ABBVIE INTERNAL". */
            internal: z.string().optional(),
            cover: image().optional(),
            coverAlt: z.string().optional(),
            /** CSS object-position for the cover crop, e.g. "center 12%". */
            coverPosition: z.string().optional(),
            /** Image-less featured card variant (Her Future Coalition). */
            textSheet: z
                .object({
                    kicker: z.string(),
                    quote: z.string(),
                })
                .optional(),
            /** written = full case study (markdown body); queued = "sheet queued" page. */
            study: z.enum(["written", "queued", "none"]).default("none"),
            studyMeta: z
                .object({
                    drawingNo: z.string(),
                    subtitle: z.string().optional(),
                    team: z.string().optional(),
                    role: z.string().optional(),
                    context: z.string().optional(),
                    stackLines: z.array(z.string()).optional(),
                    deploy: z.string().optional(),
                    heroPlate: z
                        .object({
                            image: image(),
                            alt: z.string(),
                            caption: z.string(),
                            badge: z.string().optional(),
                        })
                        .optional(),
                    pullQuote: z.string().optional(),
                })
                .optional(),
        }),
});

export const collections = { projects };
