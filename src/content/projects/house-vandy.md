---
title: House Vandy
year: "2022"
order: 1
featured: true
stackLabel: "REACT · NODE · DOCKER"
skills:
    [
        "Web Development",
        "MongoDB",
        "Express.js",
        "React",
        "Node.js",
        "REST API",
        "Web Scraping",
        "Chameleon Cloud",
        "Docker",
    ]
links:
    live: "http://129.114.25.44:8080/"
    github: "https://github.com/ethanratnofsky/House-Vandy"
primaryLink: live
cover: ../../assets/projects/house-vandy/house_vandy.png
coverAlt: "House Vandy web app — apartment listings view with filters"
study: written
studyMeta:
    drawingNo: "HV-2022-01"
    subtitle: "APARTMENT HUNTING, AUTOMATED"
    team: "3 ENGINEERS"
    role: "FULL STACK + INFRA"
    context: "CS-4287, VANDERBILT"
    stackLines: ["REACT · NODE · MONGO", "DOCKER · CRON"]
    deploy: "CHAMELEON CLOUD VM"
    heroPlate:
        image: ../../assets/projects/house-vandy/house_vandy.png
        alt: "House Vandy listings view"
        caption: "PLATE I — LISTINGS VIEW"
        badge: "WEB APP"
    pullQuote: "The scrapers run every 24 hours — the data is never staler than a day, and nobody refreshes four websites again."
---

<!-- Chapter copy verbatim from handoff prototype #7a. Chapters (## headings)
     become the "ON THIS SHEET" nav; the pull-quote renders from
     studyMeta.pullQuote (do not duplicate it here). -->

## The problem

Vanderbilt students hunting for off-campus housing were juggling four separate apartment-complex websites with no way to compare price, size, or availability side by side. The listings changed daily; the tabs multiplied.

## The build

Custom scrapers collect listings from all four complexes nightly on a cron schedule, normalize them into MongoDB, and serve a REST API the React frontend filters instantly — price, beds, baths, square footage. Everything runs as six Docker containers on a Chameleon Cloud VM.

![Filtering and comparing apartment listings by price, beds, and baths in House Vandy](../../assets/projects/house-vandy/house_vandy2.png)

*PLATE II — FILTERING & COMPARISON*

## The outcome

Designed the system architecture with two teammates and shipped it end to end — scrapers to UI — for Principles of Cloud Computing. The deployment survived the semester without a restart; the pattern (scrape → normalize → serve) became my default for data-aggregation side projects.
