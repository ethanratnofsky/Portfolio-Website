export const SITE = {
    name: "Ethan Ratnofsky",
    title: "Ethan Ratnofsky — Software Engineer in New York",
    description:
        "Full-stack software engineer in New York with a designer's eye — featured projects, selected design work, photography, and resume.",
    resumePath: "/EthanRatnofskyResume.pdf",
    socials: [
        { label: "GITHUB", href: "https://github.com/ethanratnofsky" },
        { label: "LINKEDIN", href: "https://www.linkedin.com/in/ethan-ratnofsky/" },
        { label: "BEHANCE", href: "https://www.behance.net/ethanratnofsky" },
        { label: "FLICKR", href: "https://www.flickr.com/photos/ethanratnofsky/" },
    ],
    behance: "https://www.behance.net/ethanratnofsky",
    flickr: "https://www.flickr.com/photos/ethanratnofsky/",

    // TODO(ethan): replace with your real address, split into parts. It is assembled
    // in JS on click and must never appear whole in served HTML (anti-scraper).
    emailParts: ["hello", "@", "ethanratnofsky", ".com"],
    emailIsPlaceholder: true,

    // TODO(ethan): create a free form endpoint (https://formspree.io — new form →
    // copy its URL, e.g. "https://formspree.io/f/abcdwxyz"). null keeps the form
    // rendered but disabled with a "wire me up" note.
    formEndpoint: null as string | null,

    // TODO(ethan): set your GoatCounter code (https://goatcounter.com, e.g.
    // "ethanratnofsky" for ethanratnofsky.goatcounter.com) to enable
    // privacy-friendly analytics. null = no analytics script at all.
    goatcounter: null as string | null,
} as const;

export const NAV_ITEMS = [
    { label: "WORK", href: "/#work" },
    { label: "DESIGN", href: "/#design" },
    { label: "PHOTO", href: "/#photo" },
    { label: "ABOUT", href: "/#about" },
    { label: "CONTACT", href: "/#contact" },
] as const;
